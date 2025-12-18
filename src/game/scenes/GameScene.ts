import Phaser from 'phaser';
import { SoundGenerator } from '../utils/SoundGenerator';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private lives = 3;
  private resources = 9;
  private currentLevel = 1;
  private maxLevel = 5;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private resourcesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private lastFired = 0;
  private fireRate = 250;
  private gameOver = false;
  private enemyDirection = 1;
  private enemySpeed = 0.3;
  private baseEnemySpeed = 0.3;
  private enemyMoveTimer = 0;
  private enemyFireDelay = 1500;
  private planets!: Phaser.GameObjects.Group;
  private stars!: Phaser.GameObjects.Graphics;
  private soundGenerator!: SoundGenerator;
  private introAnimationPlaying = false;
  private music!: Phaser.Sound.BaseSound;
  private enemyFireTimer!: Phaser.Time.TimerEvent;
  private asteroids!: Phaser.Physics.Arcade.Group;
  private asteroidSpawnTimer!: Phaser.Time.TimerEvent;
  private combo = 0;
  private comboTimer = 0;
  private comboText!: Phaser.GameObjects.Text;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBar!: Phaser.GameObjects.Graphics;
  private isPaused = false;
  private pauseMenu!: Phaser.GameObjects.Container;
  private escKey!: Phaser.Input.Keyboard.Key;

  // Power-ups
  private powerUpKeys!: { key1: Phaser.Input.Keyboard.Key; key2: Phaser.Input.Keyboard.Key; key3: Phaser.Input.Keyboard.Key };
  private rapidFireActive = false;
  private rapidFireTimer = 0;
  private rapidFireDuration = 10000; // 10 seconds
  private rapidFireCost = 15;

  private shieldActive = false;
  private shieldTimer = 0;
  private shieldDuration = 8000; // 8 seconds
  private shieldCost = 20;
  private shieldGraphics!: Phaser.GameObjects.Graphics;

  private speedBoostActive = false;
  private speedBoostTimer = 0;
  private speedBoostDuration = 12000; // 12 seconds
  private speedBoostCost = 10;

  private powerUpPanel!: Phaser.GameObjects.Container;
  private powerUpTexts!: { rapid: Phaser.GameObjects.Text; shield: Phaser.GameObjects.Text; speed: Phaser.GameObjects.Text };

  // Boss fight
  private boss!: Phaser.Physics.Arcade.Sprite;
  private isBossLevel = false;
  private bossHealth = 0;
  private bossMaxHealth = 100;
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthBarBg!: Phaser.GameObjects.Graphics;
  private bossHealthText!: Phaser.GameObjects.Text;
  private bossPhase = 1;
  private bossAttackTimer = 0;
  private bossMovementTimer = 0;
  private bossDirection = 1;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Create starfield background
    this.createStarfield();

    // Create planets in background
    this.createPlanets();

    // Create sound effects
    this.createSoundEffects();

    // Create player
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.8);

    // Create shield graphics (initially invisible)
    this.shieldGraphics = this.add.graphics();
    this.shieldGraphics.setDepth(10);
    this.shieldGraphics.setVisible(false);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.powerUpKeys = {
      key1: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      key2: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      key3: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
    };

    // Create bullet groups
    this.bullets = this.physics.add.group({
      defaultKey: 'laserBlue',
      maxSize: 20
    });

    this.enemyBullets = this.physics.add.group({
      defaultKey: 'laserRed',
      maxSize: 30
    });

    // Create asteroids group
    this.asteroids = this.physics.add.group();

    // Create enemies
    this.enemies = this.physics.add.group();
    this.createEnemyFormation();

    // Setup collisions
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemyBullets,
      this.hitPlayerBullet as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Asteroid collisions
    this.physics.add.overlap(
      this.bullets,
      this.asteroids,
      this.hitAsteroid as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.asteroids,
      this.hitPlayerAsteroid as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Create UI
    this.createUI();

    // Enemy firing timer (will be updated per level)
    this.setupEnemyFireTimer();

    // Asteroid spawn timer
    this.setupAsteroidSpawner();
  }

  createStarfield() {
    this.stars = this.add.graphics();
    this.stars.fillStyle(0xffffff, 1);

    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const size = Phaser.Math.Between(1, 3);
      this.stars.fillCircle(x, y, size);
    }
  }

  createPlanets() {
    // Clear existing planets if any - check if it's a valid group first
    try {
      if (this.planets && typeof this.planets.clear === 'function') {
        this.planets.clear(true, true);
      }
    } catch (e) {
      // Ignore errors from clearing stale groups on restart
    }

    // Create new group
    this.planets = this.add.group();

    // Different planet configurations for each level
    const levelConfigs = [
      // Level 1 - Blue/Purple theme
      [
        { planet: 'planet1', x: 100, y: 100, scale: 0.3, alpha: 0.6 },
        { planet: 'planet2', x: 700, y: 150, scale: 0.4, alpha: 0.5 },
        { planet: 'planet3', x: 650, y: 500, scale: 0.35, alpha: 0.4 }
      ],
      // Level 2 - More planets, different positions
      [
        { planet: 'planet2', x: 150, y: 80, scale: 0.25, alpha: 0.7 },
        { planet: 'planet4', x: 650, y: 120, scale: 0.45, alpha: 0.6 },
        { planet: 'planet1', x: 200, y: 450, scale: 0.3, alpha: 0.5 },
        { planet: 'planet3', x: 700, y: 520, scale: 0.4, alpha: 0.4 }
      ],
      // Level 3 - Dense planet field
      [
        { planet: 'planet3', x: 80, y: 150, scale: 0.35, alpha: 0.6 },
        { planet: 'planet1', x: 400, y: 100, scale: 0.3, alpha: 0.5 },
        { planet: 'planet4', x: 720, y: 180, scale: 0.4, alpha: 0.7 },
        { planet: 'planet2', x: 150, y: 500, scale: 0.35, alpha: 0.5 },
        { planet: 'planet3', x: 650, y: 480, scale: 0.3, alpha: 0.4 }
      ],
      // Level 4 - Large planets closer
      [
        { planet: 'planet4', x: 120, y: 120, scale: 0.5, alpha: 0.7 },
        { planet: 'planet1', x: 680, y: 100, scale: 0.5, alpha: 0.6 },
        { planet: 'planet2', x: 400, y: 500, scale: 0.45, alpha: 0.5 }
      ],
      // Level 5 - Epic final background
      [
        { planet: 'planet3', x: 400, y: 150, scale: 0.6, alpha: 0.8 },
        { planet: 'planet4', x: 100, y: 450, scale: 0.4, alpha: 0.6 },
        { planet: 'planet1', x: 700, y: 500, scale: 0.4, alpha: 0.6 },
        { planet: 'planet2', x: 150, y: 100, scale: 0.3, alpha: 0.5 },
        { planet: 'planet4', x: 650, y: 120, scale: 0.35, alpha: 0.5 }
      ]
    ];

    const config = levelConfigs[this.currentLevel - 1];
    config.forEach(planetConfig => {
      const planet = this.add.image(planetConfig.x, planetConfig.y, planetConfig.planet);
      planet.setScale(planetConfig.scale);
      planet.setAlpha(planetConfig.alpha);
      this.planets.add(planet);
    });
  }

  createSoundEffects() {
    // Initialize sound generator for sound effects
    this.soundGenerator = new SoundGenerator();

    // Start background music from audio file
    this.music = this.sound.add('bgMusic', {
      volume: 0.5, // 50% volume
      loop: true
    });
    this.music.play();
  }

  createEnemyFormation() {
    this.introAnimationPlaying = true;

    // Check if this is the boss level (level 5)
    if (this.currentLevel === 5) {
      this.isBossLevel = true;
      this.createBoss();
      return;
    }

    this.isBossLevel = false;
    const enemyTypes = ['enemy1', 'enemy2', 'enemy4', 'enemy5', 'enemy6', 'enemy8'];

    // Level-based difficulty configuration
    const rows = Math.min(4 + this.currentLevel - 1, 6); // 4-6 rows
    const cols = 8;

    // Adjust enemy speed based on level
    this.baseEnemySpeed = 0.3 + (this.currentLevel - 1) * 0.15;
    this.enemySpeed = this.baseEnemySpeed;

    // Adjust enemy fire rate (faster = more dangerous)
    this.enemyFireDelay = Math.max(800, 1500 - (this.currentLevel - 1) * 150);

    // Show level intro text
    const levelText = this.add.text(400, 250, `LEVEL ${this.currentLevel}`, {
      fontSize: '64px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    levelText.setOrigin(0.5);
    levelText.setAlpha(0);

    const readyText = this.add.text(400, 330, 'READY?', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    readyText.setOrigin(0.5);
    readyText.setAlpha(0);

    // Fade in text
    this.tweens.add({
      targets: [levelText, readyText],
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });

    let animationDelay = 600; // Start after text appears
    const delayIncrement = 40; // ms between each enemy appearing
    let lastRow = rows - 1;
    let lastCol = cols - 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const finalX = 150 + col * 70;
        const finalY = 80 + row * 60;
        const startY = -100 - (row * 50); // Start above screen, staggered by row
        const enemyType = enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];

        // Create enemy above the screen
        const enemy = this.enemies.create(finalX, startY, enemyType);
        enemy.setScale(0.6);
        enemy.setData('startX', finalX);
        enemy.setData('startY', finalY);
        enemy.setAlpha(0); // Start invisible

        // Animate enemy flying in
        this.tweens.add({
          targets: enemy,
          y: finalY,
          alpha: 1,
          duration: 600,
          ease: 'Back.easeOut',
          delay: animationDelay,
          onComplete: () => {
            // Check if this is the last enemy
            if (row === lastRow && col === lastCol) {
              // Fade out text
              this.tweens.add({
                targets: [levelText, readyText],
                alpha: 0,
                duration: 300,
                delay: 200,
                onComplete: () => {
                  levelText.destroy();
                  readyText.destroy();
                  this.introAnimationPlaying = false;
                }
              });
            }
          }
        });

        animationDelay += delayIncrement;
      }
    }
  }

  createUI() {
    // Create UI panel backgrounds
    const panelGraphics = this.add.graphics();

    // Top HUD panel
    panelGraphics.fillStyle(0x000000, 0.6);
    panelGraphics.fillRoundedRect(10, 10, 780, 60, 8);
    panelGraphics.lineStyle(2, 0x00ffff, 0.5);
    panelGraphics.strokeRoundedRect(10, 10, 780, 60, 8);

    // Health bar background (left side)
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x330000, 1);
    this.healthBarBg.fillRoundedRect(20, 25, 150, 15, 4);
    this.healthBarBg.lineStyle(1, 0xff0000, 0.5);
    this.healthBarBg.strokeRoundedRect(20, 25, 150, 15, 4);

    // Health bar (fill)
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // Lives label
    this.add.text(20, 45, 'HEALTH', {
      fontSize: '12px',
      color: '#ff6666',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });

    // Lives count with icons
    this.livesText = this.add.text(120, 45, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.updateLivesDisplay();

    // Level display (center)
    const levelBg = this.add.graphics();
    levelBg.fillStyle(0x001a33, 0.8);
    levelBg.fillRoundedRect(340, 20, 120, 35, 6);
    levelBg.lineStyle(2, 0x00ffff, 0.8);
    levelBg.strokeRoundedRect(340, 20, 120, 35, 6);

    this.levelText = this.add.text(400, 37, `LEVEL ${this.currentLevel}`, {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);

    // Resources panel (right side)
    const resourceBg = this.add.graphics();
    resourceBg.fillStyle(0x001a00, 0.8);
    resourceBg.fillRoundedRect(550, 25, 110, 30, 5);
    resourceBg.lineStyle(1, 0x00ff00, 0.6);
    resourceBg.strokeRoundedRect(550, 25, 110, 30, 5);

    this.add.text(555, 30, '⚡', {
      fontSize: '18px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });

    this.resourcesText = this.add.text(580, 32, `${this.resources.toString().padStart(3, '0')}`, {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });

    // Score panel (far right)
    const scoreBg = this.add.graphics();
    scoreBg.fillStyle(0x1a1a00, 0.8);
    scoreBg.fillRoundedRect(670, 25, 110, 30, 5);
    scoreBg.lineStyle(1, 0xffff00, 0.6);
    scoreBg.strokeRoundedRect(670, 25, 110, 30, 5);

    this.add.text(675, 30, '⭐', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });

    this.scoreText = this.add.text(700, 32, `${this.score.toString().padStart(5, '0')}`, {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });

    // Combo text (initially hidden)
    this.comboText = this.add.text(400, 100, '', {
      fontSize: '32px',
      color: '#ff00ff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);
    this.comboText.setAlpha(0);
    this.comboText.setDepth(100);

    // Create power-ups UI panel
    this.createPowerUpPanel();

    // Create pause menu (initially hidden)
    this.createPauseMenu();
  }

  createPowerUpPanel() {
    this.powerUpPanel = this.add.container(0, 0);

    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.7);
    panelBg.fillRoundedRect(10, 520, 250, 70, 8);
    panelBg.lineStyle(2, 0x9900ff, 0.6);
    panelBg.strokeRoundedRect(10, 520, 250, 70, 8);

    const title = this.add.text(20, 528, 'POWER-UPS:', {
      fontSize: '14px',
      color: '#9900ff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });

    // Power-up 1: Rapid Fire
    const rapid = this.add.text(20, 548, `[1] Rapid Fire (${this.rapidFireCost}⚡)`, {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace'
    });

    // Power-up 2: Shield
    const shield = this.add.text(20, 563, `[2] Shield (${this.shieldCost}⚡)`, {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace'
    });

    // Power-up 3: Speed Boost
    const speed = this.add.text(20, 578, `[3] Speed Boost (${this.speedBoostCost}⚡)`, {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace'
    });

    this.powerUpTexts = { rapid, shield, speed };

    this.powerUpPanel.add([panelBg, title, rapid, shield, speed]);
    this.powerUpPanel.setDepth(50);
  }

  createBoss() {
    // Show boss intro text
    const bossIntroText = this.add.text(400, 250, 'FINAL BOSS', {
      fontSize: '72px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    bossIntroText.setOrigin(0.5);
    bossIntroText.setAlpha(0);
    bossIntroText.setStroke('#660000', 8);

    const warningText = this.add.text(400, 330, 'THE MOTHERSHIP APPROACHES!', {
      fontSize: '32px',
      color: '#ff6666',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    warningText.setOrigin(0.5);
    warningText.setAlpha(0);

    // Fade in text
    this.tweens.add({
      targets: [bossIntroText, warningText],
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    // Create boss sprite (using largest enemy)
    this.boss = this.physics.add.sprite(400, -150, 'enemy8');
    this.boss.setScale(3); // Make it much larger
    this.boss.setAlpha(0);

    // Initialize boss health
    this.bossHealth = this.bossMaxHealth;
    this.bossPhase = 1;

    // Create boss health bar
    this.createBossHealthBar();

    // Animate boss entrance
    this.time.delayedCall(2000, () => {
      // Fade out intro text
      this.tweens.add({
        targets: [bossIntroText, warningText],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          bossIntroText.destroy();
          warningText.destroy();
        }
      });

      // Boss flies in
      this.tweens.add({
        targets: this.boss,
        y: 120,
        alpha: 1,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
          this.introAnimationPlaying = false;
          this.bossHealthBarBg.setVisible(true);
          this.bossHealthBar.setVisible(true);
          this.bossHealthText.setVisible(true);
        }
      });
    });

    // Setup boss collision
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.boss,
      this.hitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  createBossHealthBar() {
    // Health bar background
    this.bossHealthBarBg = this.add.graphics();
    this.bossHealthBarBg.fillStyle(0x330000, 1);
    this.bossHealthBarBg.fillRoundedRect(150, 80, 500, 20, 5);
    this.bossHealthBarBg.lineStyle(2, 0xff0000, 1);
    this.bossHealthBarBg.strokeRoundedRect(150, 80, 500, 20, 5);
    this.bossHealthBarBg.setVisible(false);
    this.bossHealthBarBg.setDepth(100);

    // Health bar fill
    this.bossHealthBar = this.add.graphics();
    this.bossHealthBar.setVisible(false);
    this.bossHealthBar.setDepth(101);

    // Boss name text
    this.bossHealthText = this.add.text(400, 70, 'MOTHERSHIP', {
      fontSize: '16px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.bossHealthText.setOrigin(0.5);
    this.bossHealthText.setVisible(false);
    this.bossHealthText.setDepth(102);

    this.updateBossHealthBar();
  }

  updateBossHealthBar() {
    this.bossHealthBar.clear();
    const healthPercentage = this.bossHealth / this.bossMaxHealth;
    const barWidth = 496 * healthPercentage;

    // Determine color based on health
    let healthColor = 0xff0000; // Red
    if (healthPercentage > 0.66) {
      healthColor = 0xff6600; // Orange
    } else if (healthPercentage > 0.33) {
      healthColor = 0xff3300; // Red-Orange
    }

    this.bossHealthBar.fillStyle(healthColor, 1);
    this.bossHealthBar.fillRoundedRect(152, 82, barWidth, 16, 4);
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercentage = this.lives / 3;
    const barWidth = 146 * healthPercentage;

    // Determine color based on health
    let healthColor = 0x00ff00; // Green
    if (healthPercentage <= 0.33) {
      healthColor = 0xff0000; // Red
    } else if (healthPercentage <= 0.66) {
      healthColor = 0xff9900; // Orange
    }

    this.healthBar.fillStyle(healthColor, 1);
    this.healthBar.fillRoundedRect(22, 27, barWidth, 11, 3);
  }

  createPauseMenu() {
    this.pauseMenu = this.add.container(400, 300);

    // Background overlay
    const overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
    overlay.setOrigin(0.5);

    // Pause menu panel
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x001a33, 0.95);
    menuBg.fillRoundedRect(-200, -150, 400, 300, 12);
    menuBg.lineStyle(3, 0x00ffff, 1);
    menuBg.strokeRoundedRect(-200, -150, 400, 300, 12);

    const pauseTitle = this.add.text(0, -80, 'PAUSED', {
      fontSize: '48px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    pauseTitle.setOrigin(0.5);

    const resumeText = this.add.text(0, 0, 'Press ESC to Resume', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    resumeText.setOrigin(0.5);

    const controlsText = this.add.text(0, 60, 'ARROW KEYS - Move\nSPACE - Shoot\nESC - Pause/Resume', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    });
    controlsText.setOrigin(0.5);

    this.pauseMenu.add([overlay, menuBg, pauseTitle, resumeText, controlsText]);
    this.pauseMenu.setVisible(false);
    this.pauseMenu.setDepth(1000);
  }

  updateLivesDisplay() {
    let livesStr = '';
    for (let i = 0; i < this.lives; i++) {
      livesStr += '♥ ';
    }
    this.livesText.setText(livesStr);
    this.updateHealthBar();
  }

  update(time: number) {
    // Handle pause
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.togglePause();
    }

    if (this.gameOver || this.introAnimationPlaying || this.isPaused) {
      return;
    }

    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= 16; // Assuming 60 FPS
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboText.setAlpha(0);
      }
    }

    // Handle power-up activations
    if (Phaser.Input.Keyboard.JustDown(this.powerUpKeys.key1)) {
      this.activateRapidFire();
    }
    if (Phaser.Input.Keyboard.JustDown(this.powerUpKeys.key2)) {
      this.activateShield();
    }
    if (Phaser.Input.Keyboard.JustDown(this.powerUpKeys.key3)) {
      this.activateSpeedBoost();
    }

    // Update power-up timers
    if (this.rapidFireActive) {
      this.rapidFireTimer -= 16;
      if (this.rapidFireTimer <= 0) {
        this.rapidFireActive = false;
        this.fireRate = 250; // Reset to normal
      }
    }

    if (this.shieldActive) {
      this.shieldTimer -= 16;
      this.updateShield();
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
        this.shieldGraphics.setVisible(false);
      }
    }

    if (this.speedBoostActive) {
      this.speedBoostTimer -= 16;
      if (this.speedBoostTimer <= 0) {
        this.speedBoostActive = false;
      }
    }

    // Update power-up UI
    this.updatePowerUpUI();

    // Player movement (with speed boost)
    const moveSpeed = this.speedBoostActive ? 300 : 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-moveSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(moveSpeed);
    } else {
      this.player.setVelocityY(0);
    }

    // Shooting
    if (this.cursors.space.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // Move enemies or boss
    if (this.isBossLevel && this.boss && this.boss.active) {
      this.updateBoss();
    } else {
      this.moveEnemies();
    }

    // Clean up bullets
    this.bullets.children.each((bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.y < -10) {
        this.bullets.killAndHide(b);
      }
      return true;
    });

    this.enemyBullets.children.each((bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.y > 610) {
        this.enemyBullets.killAndHide(b);
      }
      return true;
    });

    // Clean up asteroids that go off-screen
    this.asteroids.children.each((asteroid) => {
      const a = asteroid as Phaser.Physics.Arcade.Sprite;
      if (a.active && (a.y > 650 || a.x < -100 || a.x > 900)) {
        this.asteroids.killAndHide(a);
      }
      return true;
    });

    // Check if all enemies are destroyed (or boss is defeated)
    if (!this.introAnimationPlaying) {
      if (this.isBossLevel) {
        // Boss level - check if boss is defeated
        if (this.boss && !this.boss.active) {
          this.winGame();
        }
      } else if (this.enemies.countActive() === 0) {
        // Regular level - check if all enemies destroyed
        if (this.currentLevel < this.maxLevel) {
          this.nextLevel();
        } else {
          this.winGame();
        }
      }
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-350);
      bullet.setScale(0.8);

      // Play shoot sound
      this.soundGenerator.playShootSound();
    }
  }

  enemyFire() {
    if (this.gameOver || this.introAnimationPlaying) return;

    const activeEnemies = this.enemies.getChildren().filter(
      (enemy) => (enemy as Phaser.Physics.Arcade.Sprite).active
    );

    if (activeEnemies.length > 0) {
      const enemy = Phaser.Utils.Array.GetRandom(activeEnemies) as Phaser.Physics.Arcade.Sprite;
      const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20);

      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(180);
        bullet.setScale(0.8);

        // Play enemy shoot sound
        this.soundGenerator.playEnemyShootSound();
      }
    }
  }

  moveEnemies() {
    this.enemyMoveTimer += this.enemySpeed;

    if (this.enemyMoveTimer >= 1) {
      this.enemyMoveTimer = 0;
      let changeDirection = false;

      this.enemies.children.each((enemy) => {
        const e = enemy as Phaser.Physics.Arcade.Sprite;
        if (!e.active) return true;

        e.x += this.enemyDirection * 5;

        if ((e.x > 750 && this.enemyDirection > 0) || (e.x < 50 && this.enemyDirection < 0)) {
          changeDirection = true;
        }
        return true;
      });

      if (changeDirection) {
        this.enemyDirection *= -1;
        this.enemies.children.each((enemy) => {
          const e = enemy as Phaser.Physics.Arcade.Sprite;
          if (e.active) {
            e.y += 20;

            if (e.y > 500) {
              this.endGame();
            }
          }
          return true;
        });
      }
    }
  }

  hitEnemy(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const b = bullet as Phaser.Physics.Arcade.Sprite;
    const e = enemy as Phaser.Physics.Arcade.Sprite;

    // Check if enemy is already destroyed to prevent double-hit
    if (!e.active) {
      return;
    }

    // Immediately destroy bullet
    b.destroy();

    // Deactivate enemy to prevent further collisions
    e.setActive(false);
    e.disableBody(true, false); // Disable physics but keep visible

    // Update combo
    this.combo++;
    this.comboTimer = 3000; // 3 seconds to continue combo

    const comboBonus = this.combo > 1 ? this.combo * 5 : 0;
    this.score += 10 + comboBonus;
    this.resources += 1;

    this.scoreText.setText(`${this.score.toString().padStart(5, '0')}`);
    this.resourcesText.setText(`${this.resources.toString().padStart(3, '0')}`);

    // Show combo text
    if (this.combo > 1) {
      this.comboText.setText(`${this.combo}x COMBO!`);
      this.comboText.setAlpha(1);
      this.tweens.add({
        targets: this.comboText,
        scale: 1.2,
        duration: 100,
        yoyo: true
      });
    }

    // Play explosion sound
    this.soundGenerator.playExplosionSound();

    // Create explosion effect with smoke particles
    this.createExplosionEffect(e.x, e.y);

    // Add falling animation - enemy spins and falls down while fading
    this.tweens.add({
      targets: e,
      y: e.y + 300, // Fall down
      rotation: Phaser.Math.Between(-3, 3), // Spin randomly
      alpha: 0, // Fade out
      scale: e.scale * 0.5, // Shrink
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        e.destroy(); // Destroy after animation completes
      }
    });
  }

  createExplosionEffect(x: number, y: number) {
    // Create multiple explosion particles
    const particleCount = 15;
    const colors = [0xff6600, 0xff9900, 0xffcc00, 0x666666, 0x999999];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Phaser.Math.Between(50, 150);
      const color = Phaser.Utils.Array.GetRandom(colors);
      const size = Phaser.Math.Between(8, 16);

      // Create particle
      const particle = this.add.circle(x, y, size, color, 1);

      // Calculate velocity
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Animate particle
      this.tweens.add({
        targets: particle,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(300, 600),
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    // Create central flash
    const flash = this.add.circle(x, y, 30, 0xffffff, 0.9);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.5,
      duration: 200,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });

    // Create expanding smoke ring
    const smokeRing = this.add.circle(x, y, 20, 0x666666, 0.6);
    this.tweens.add({
      targets: smokeRing,
      alpha: 0,
      scale: 3,
      duration: 500,
      ease: 'Power2',
      onComplete: () => smokeRing.destroy()
    });
  }

  hitPlayer(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    e.setActive(false);
    e.setVisible(false);

    this.loseLife();
  }

  hitPlayerBullet(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const b = bullet as Phaser.Physics.Arcade.Sprite;
    b.setActive(false);
    b.setVisible(false);

    this.loseLife();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseMenu.setVisible(this.isPaused);

    if (this.isPaused) {
      this.physics.pause();
      if (this.music) {
        (this.music as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).pause();
      }
    } else {
      this.physics.resume();
      if (this.music) {
        (this.music as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).resume();
      }
    }
  }

  activateRapidFire() {
    if (this.rapidFireActive || this.resources < this.rapidFireCost) return;

    this.resources -= this.rapidFireCost;
    this.resourcesText.setText(`${this.resources.toString().padStart(3, '0')}`);

    this.rapidFireActive = true;
    this.rapidFireTimer = this.rapidFireDuration;
    this.fireRate = 100; // Faster fire rate

    // Visual feedback
    this.cameras.main.flash(100, 255, 100, 0);

    // Play sound
    this.soundGenerator.playShootSound();
  }

  activateShield() {
    if (this.shieldActive || this.resources < this.shieldCost) return;

    this.resources -= this.shieldCost;
    this.resourcesText.setText(`${this.resources.toString().padStart(3, '0')}`);

    this.shieldActive = true;
    this.shieldTimer = this.shieldDuration;
    this.shieldGraphics.setVisible(true);

    // Visual feedback
    this.cameras.main.flash(100, 0, 100, 255);
  }

  activateSpeedBoost() {
    if (this.speedBoostActive || this.resources < this.speedBoostCost) return;

    this.resources -= this.speedBoostCost;
    this.resourcesText.setText(`${this.resources.toString().padStart(3, '0')}`);

    this.speedBoostActive = true;
    this.speedBoostTimer = this.speedBoostDuration;

    // Visual feedback
    this.cameras.main.flash(100, 100, 200, 255);
  }

  updateShield() {
    // Draw rotating shield around player
    this.shieldGraphics.clear();
    this.shieldGraphics.lineStyle(3, 0x00ffff, 0.8);

    const angle = Date.now() / 10;
    const radius = 40;

    for (let i = 0; i < 6; i++) {
      const a1 = angle + (i * Math.PI / 3);
      const a2 = a1 + Math.PI / 6;

      const x1 = this.player.x + Math.cos(a1) * radius;
      const y1 = this.player.y + Math.sin(a1) * radius;
      const x2 = this.player.x + Math.cos(a2) * radius;
      const y2 = this.player.y + Math.sin(a2) * radius;

      this.shieldGraphics.beginPath();
      this.shieldGraphics.arc(this.player.x, this.player.y, radius, a1, a2);
      this.shieldGraphics.strokePath();
    }
  }

  updatePowerUpUI() {
    // Update colors based on affordability and active status
    if (this.rapidFireActive) {
      this.powerUpTexts.rapid.setColor('#00ff00');
      this.powerUpTexts.rapid.setText(`[1] Rapid Fire (${Math.ceil(this.rapidFireTimer / 1000)}s)`);
    } else if (this.resources >= this.rapidFireCost) {
      this.powerUpTexts.rapid.setColor('#ffffff');
      this.powerUpTexts.rapid.setText(`[1] Rapid Fire (${this.rapidFireCost}⚡)`);
    } else {
      this.powerUpTexts.rapid.setColor('#666666');
      this.powerUpTexts.rapid.setText(`[1] Rapid Fire (${this.rapidFireCost}⚡)`);
    }

    if (this.shieldActive) {
      this.powerUpTexts.shield.setColor('#00ffff');
      this.powerUpTexts.shield.setText(`[2] Shield (${Math.ceil(this.shieldTimer / 1000)}s)`);
    } else if (this.resources >= this.shieldCost) {
      this.powerUpTexts.shield.setColor('#ffffff');
      this.powerUpTexts.shield.setText(`[2] Shield (${this.shieldCost}⚡)`);
    } else {
      this.powerUpTexts.shield.setColor('#666666');
      this.powerUpTexts.shield.setText(`[2] Shield (${this.shieldCost}⚡)`);
    }

    if (this.speedBoostActive) {
      this.powerUpTexts.speed.setColor('#ffff00');
      this.powerUpTexts.speed.setText(`[3] Speed Boost (${Math.ceil(this.speedBoostTimer / 1000)}s)`);
    } else if (this.resources >= this.speedBoostCost) {
      this.powerUpTexts.speed.setColor('#ffffff');
      this.powerUpTexts.speed.setText(`[3] Speed Boost (${this.speedBoostCost}⚡)`);
    } else {
      this.powerUpTexts.speed.setColor('#666666');
      this.powerUpTexts.speed.setText(`[3] Speed Boost (${this.speedBoostCost}⚡)`);
    }
  }

  loseLife() {
    if (this.gameOver) return;

    // Check if shield is active
    if (this.shieldActive) {
      // Shield absorbs the hit
      this.cameras.main.flash(100, 0, 255, 255);
      return;
    }

    this.lives -= 1;
    this.updateLivesDisplay();

    // Reset combo on hit
    this.combo = 0;
    this.comboTimer = 0;
    this.comboText.setAlpha(0);

    // Play hit sound
    this.soundGenerator.playHitSound();

    // Flash effect and screen shake
    this.cameras.main.flash(200, 255, 0, 0);
    this.cameras.main.shake(300, 0.01);

    if (this.lives <= 0) {
      this.endGame();
    } else {
      // Temporary invincibility
      this.player.setAlpha(0.5);
      this.time.delayedCall(1000, () => {
        this.player.setAlpha(1);
      });
    }
  }

  setupEnemyFireTimer() {
    if (this.enemyFireTimer) {
      this.enemyFireTimer.remove();
    }
    this.enemyFireTimer = this.time.addEvent({
      delay: this.enemyFireDelay,
      callback: this.enemyFire,
      callbackScope: this,
      loop: true
    });
  }

  setupAsteroidSpawner() {
    if (this.asteroidSpawnTimer) {
      this.asteroidSpawnTimer.remove();
    }

    // Spawn asteroids more frequently as levels progress
    const spawnDelay = Math.max(2000, 4000 - (this.currentLevel - 1) * 400);

    this.asteroidSpawnTimer = this.time.addEvent({
      delay: spawnDelay,
      callback: this.spawnAsteroid,
      callbackScope: this,
      loop: true
    });
  }

  spawnAsteroid() {
    if (this.gameOver || this.introAnimationPlaying) return;

    // Random meteor type
    const meteorTypes = [
      { key: 'meteorBrown1', scale: 0.5, health: 3 },
      { key: 'meteorBrown2', scale: 0.4, health: 2 },
      { key: 'meteorBrown3', scale: 0.3, health: 1 },
      { key: 'meteorGrey1', scale: 0.5, health: 3 },
      { key: 'meteorGrey2', scale: 0.4, health: 2 },
      { key: 'meteorGrey3', scale: 0.3, health: 1 }
    ];

    const meteorType = Phaser.Utils.Array.GetRandom(meteorTypes);

    // Random spawn position - from top or sides
    const spawnSide = Phaser.Math.Between(0, 2);
    let x, y, velocityX, velocityY;

    if (spawnSide === 0) {
      // Spawn from top
      x = Phaser.Math.Between(50, 750);
      y = -50;
      velocityX = Phaser.Math.Between(-50, 50);
      velocityY = Phaser.Math.Between(80, 150);
    } else if (spawnSide === 1) {
      // Spawn from left
      x = -50;
      y = Phaser.Math.Between(50, 300);
      velocityX = Phaser.Math.Between(80, 150);
      velocityY = Phaser.Math.Between(-30, 100);
    } else {
      // Spawn from right
      x = 850;
      y = Phaser.Math.Between(50, 300);
      velocityX = Phaser.Math.Between(-150, -80);
      velocityY = Phaser.Math.Between(-30, 100);
    }

    const asteroid = this.asteroids.create(x, y, meteorType.key) as Phaser.Physics.Arcade.Sprite;
    asteroid.setScale(meteorType.scale);
    asteroid.setVelocity(velocityX, velocityY);
    asteroid.setAngularVelocity(Phaser.Math.Between(-100, 100)); // Rotation
    asteroid.setData('health', meteorType.health);
    asteroid.setData('maxHealth', meteorType.health);
  }

  hitAsteroid(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    asteroid: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const b = bullet as Phaser.Physics.Arcade.Sprite;
    const a = asteroid as Phaser.Physics.Arcade.Sprite;

    if (!a.active) return;

    // Destroy bullet
    b.destroy();

    // Reduce asteroid health
    let health = a.getData('health') as number;
    health -= 1;
    a.setData('health', health);

    // Flash effect on hit
    this.tweens.add({
      targets: a,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });

    if (health <= 0) {
      // Destroy asteroid
      a.setActive(false);

      this.score += 5;
      this.scoreText.setText(`${this.score.toString().padStart(5, '0')}`);

      // Play explosion sound
      this.soundGenerator.playExplosionSound();

      // Create explosion effect
      this.createExplosionEffect(a.x, a.y);

      // Asteroid breaks apart
      a.setVelocity(a.body!.velocity.x * 0.5, a.body!.velocity.y + 100);
      this.tweens.add({
        targets: a,
        y: a.y + 200,
        alpha: 0,
        rotation: a.rotation + Phaser.Math.Between(-2, 2),
        duration: 600,
        onComplete: () => a.destroy()
      });
    }
  }

  hitPlayerAsteroid(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    asteroid: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const a = asteroid as Phaser.Physics.Arcade.Sprite;

    if (!a.active) return;

    // Destroy asteroid
    a.setActive(false);
    a.setVisible(false);

    this.loseLife();
  }

  updateBoss() {
    if (!this.boss || !this.boss.active) return;

    this.bossMovementTimer++;
    this.bossAttackTimer++;

    // Boss movement pattern - side to side
    if (this.bossMovementTimer % 2 === 0) {
      this.boss.x += this.bossDirection * 2;

      if (this.boss.x > 700 || this.boss.x < 100) {
        this.bossDirection *= -1;
      }
    }

    // Boss attack patterns based on phase
    const attackSpeed = this.bossPhase === 1 ? 120 : this.bossPhase === 2 ? 80 : 50;

    if (this.bossAttackTimer > attackSpeed) {
      this.bossAttack();
      this.bossAttackTimer = 0;
    }
  }

  bossAttack() {
    if (!this.boss || !this.boss.active) return;

    // Phase 1: Single shot aimed at player
    if (this.bossPhase === 1) {
      const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 60);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setScale(1.2);

        // Aim towards player
        const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
        const speed = 200;
        bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        this.soundGenerator.playEnemyShootSound();
      }
    }
    // Phase 2: Triple shot spread
    else if (this.bossPhase === 2) {
      for (let i = -1; i <= 1; i++) {
        const bullet = this.enemyBullets.get(this.boss.x + i * 40, this.boss.y + 60);
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setScale(1.2);
          bullet.setVelocity(i * 80, 200);

          this.soundGenerator.playEnemyShootSound();
        }
      }
    }
    // Phase 3: Rapid fire spread + aimed shots
    else {
      // Spread shots
      for (let i = -2; i <= 2; i++) {
        const bullet = this.enemyBullets.get(this.boss.x + i * 30, this.boss.y + 60);
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setScale(1.1);
          bullet.setVelocity(i * 60, 220);
        }
      }

      // Aimed shot
      const aimedBullet = this.enemyBullets.get(this.boss.x, this.boss.y + 60);
      if (aimedBullet) {
        aimedBullet.setActive(true);
        aimedBullet.setVisible(true);
        aimedBullet.setScale(1.5);

        const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
        const speed = 250;
        aimedBullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }

      this.soundGenerator.playEnemyShootSound();
    }
  }

  hitBoss(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _boss: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const b = bullet as Phaser.Physics.Arcade.Sprite;

    if (!this.boss.active) return;

    // Destroy bullet
    b.destroy();

    // Damage boss
    this.bossHealth -= 2;

    // Update combo
    this.combo++;
    this.comboTimer = 3000;

    const comboBonus = this.combo > 1 ? this.combo * 2 : 0;
    this.score += 5 + comboBonus;
    this.resources += 1;

    this.scoreText.setText(`${this.score.toString().padStart(5, '0')}`);
    this.resourcesText.setText(`${this.resources.toString().padStart(3, '0')}`);

    // Show combo
    if (this.combo > 1) {
      this.comboText.setText(`${this.combo}x COMBO!`);
      this.comboText.setAlpha(1);
      this.tweens.add({
        targets: this.comboText,
        scale: 1.2,
        duration: 100,
        yoyo: true
      });
    }

    // Update health bar
    this.updateBossHealthBar();

    // Flash effect
    this.tweens.add({
      targets: this.boss,
      alpha: 0.5,
      duration: 50,
      yoyo: true
    });

    // Phase transitions
    const healthPercentage = this.bossHealth / this.bossMaxHealth;
    if (healthPercentage <= 0.66 && this.bossPhase === 1) {
      this.bossPhase = 2;
      this.showPhaseWarning('PHASE 2!');
      this.cameras.main.shake(500, 0.015);
    } else if (healthPercentage <= 0.33 && this.bossPhase === 2) {
      this.bossPhase = 3;
      this.showPhaseWarning('FINAL PHASE!');
      this.cameras.main.shake(800, 0.02);
    }

    // Check if boss defeated
    if (this.bossHealth <= 0) {
      this.defeatBoss();
    } else {
      this.soundGenerator.playHitSound();
    }
  }

  showPhaseWarning(text: string) {
    const warning = this.add.text(400, 300, text, {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    warning.setOrigin(0.5);
    warning.setAlpha(0);
    warning.setDepth(200);
    warning.setStroke('#660000', 6);

    this.tweens.add({
      targets: warning,
      alpha: 1,
      scale: 1.5,
      duration: 300,
      yoyo: true,
      onComplete: () => warning.destroy()
    });
  }

  defeatBoss() {
    this.boss.setActive(false);

    // Play massive explosion
    this.soundGenerator.playExplosionSound();
    this.cameras.main.shake(1000, 0.03);

    // Create massive explosion effect
    for (let i = 0; i < 50; i++) {
      this.time.delayedCall(i * 50, () => {
        const x = this.boss.x + Phaser.Math.Between(-80, 80);
        const y = this.boss.y + Phaser.Math.Between(-80, 80);
        this.createExplosionEffect(x, y);
      });
    }

    // Fade out and destroy boss
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 0,
      rotation: 3,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.boss.destroy();
        // Hide boss health bar
        this.bossHealthBarBg.setVisible(false);
        this.bossHealthBar.setVisible(false);
        this.bossHealthText.setVisible(false);
      }
    });

    // Bonus points for defeating boss
    this.score += 500;
    this.scoreText.setText(`${this.score.toString().padStart(5, '0')}`);
  }

  nextLevel() {
    this.currentLevel++;
    this.levelText.setText(`LEVEL ${this.currentLevel}`);

    // Clear all bullets and asteroids from previous level
    this.bullets.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.asteroids.clear(true, true);

    // Update background
    this.createPlanets();

    // Recreate enemies with new difficulty
    this.createEnemyFormation();

    // Update enemy fire timer with new delay
    this.setupEnemyFireTimer();

    // Update asteroid spawner with new difficulty
    this.setupAsteroidSpawner();
  }

  winGame() {
    this.gameOver = true;
    this.physics.pause();

    // Stop background music
    if (this.music) {
      this.music.stop();
    }

    // Create victory screen background
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x001a00, 0.95);
    menuBg.fillRoundedRect(150, 120, 500, 360, 12);
    menuBg.lineStyle(3, 0x00ff00, 1);
    menuBg.strokeRoundedRect(150, 120, 500, 360, 12);

    const winText = this.add.text(400, 180, 'VICTORY!', {
      fontSize: '72px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    winText.setOrigin(0.5);
    winText.setStroke('#003300', 6);

    const congratsText = this.add.text(400, 260, 'You completed all 5 levels!', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    congratsText.setOrigin(0.5);

    const statsPanel = this.add.graphics();
    statsPanel.fillStyle(0x002200, 0.8);
    statsPanel.fillRoundedRect(200, 300, 400, 80, 8);
    statsPanel.lineStyle(2, 0x00ff00, 0.5);
    statsPanel.strokeRoundedRect(200, 300, 400, 80, 8);

    const finalScoreText = this.add.text(400, 320, `Final Score: ${this.score}`, {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    finalScoreText.setOrigin(0.5);

    const resourcesCollected = this.add.text(400, 355, `Resources Collected: ${this.resources}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    resourcesCollected.setOrigin(0.5);

    const restartText = this.add.text(400, 430, 'Press SPACE to Play Again', {
      fontSize: '22px',
      color: '#00ffff',
      fontFamily: 'monospace'
    });
    restartText.setOrigin(0.5);

    // Animate win text with glow effect
    this.tweens.add({
      targets: winText,
      scale: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Animate restart text
    this.tweens.add({
      targets: restartText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Clear any existing space key state
    this.input.keyboard!.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Setup restart functionality
    this.input.keyboard!.once('keydown-SPACE', () => {
      // Reset all game state before restart
      this.score = 0;
      this.lives = 3;
      this.resources = 9;
      this.currentLevel = 1;
      this.gameOver = false;
      this.enemySpeed = 0.3;
      this.baseEnemySpeed = 0.3;
      this.combo = 0;
      this.comboTimer = 0;

      // Restart the scene
      this.scene.restart();
    });
  }

  endGame() {
    this.gameOver = true;
    this.physics.pause();

    // Stop background music
    if (this.music) {
      this.music.stop();
    }

    // Create game over screen background
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x1a0000, 0.95);
    menuBg.fillRoundedRect(150, 150, 500, 300, 12);
    menuBg.lineStyle(3, 0xff0000, 1);
    menuBg.strokeRoundedRect(150, 150, 500, 300, 12);

    const gameOverText = this.add.text(400, 220, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setStroke('#330000', 6);

    const statsPanel = this.add.graphics();
    statsPanel.fillStyle(0x220000, 0.8);
    statsPanel.fillRoundedRect(200, 280, 400, 80, 8);
    statsPanel.lineStyle(2, 0xff0000, 0.5);
    statsPanel.strokeRoundedRect(200, 280, 400, 80, 8);

    const finalScoreText = this.add.text(400, 300, `Final Score: ${this.score}`, {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    finalScoreText.setOrigin(0.5);

    const levelReached = this.add.text(400, 335, `Level Reached: ${this.currentLevel}`, {
      fontSize: '20px',
      color: '#ff6666',
      fontFamily: 'monospace'
    });
    levelReached.setOrigin(0.5);

    const restartText = this.add.text(400, 400, 'Press SPACE to Restart', {
      fontSize: '22px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    restartText.setOrigin(0.5);

    // Animate game over text
    this.tweens.add({
      targets: gameOverText,
      scale: 1.1,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Animate restart text
    this.tweens.add({
      targets: restartText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Clear any existing space key state
    this.input.keyboard!.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Setup restart functionality
    this.input.keyboard!.once('keydown-SPACE', () => {
      // Reset all game state before restart
      this.score = 0;
      this.lives = 3;
      this.resources = 9;
      this.currentLevel = 1;
      this.gameOver = false;
      this.enemySpeed = 0.3;
      this.baseEnemySpeed = 0.3;
      this.combo = 0;
      this.comboTimer = 0;

      // Restart the scene
      this.scene.restart();
    });
  }
}
