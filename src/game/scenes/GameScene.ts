import Phaser from 'phaser';
import { SoundGenerator } from '../utils/SoundGenerator';
import { HandGestureController, GestureState } from '../utils/HandGestureController';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;

  // Gesture controls
  private gestureController: HandGestureController | null = null;
  private gesturesEnabled = false;
  private lastGestureShield = false;
  private lastFingerCount = 0;
  private score = 0;
  private lives = 3;
  private resources = 0;
  private currentLevel = 1;
  private selectedShip = 'playerShip1_blue';
  private selectedLaser = 'laserBlue01';
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

  // AI Co-Pilot Assistant
  private aiAssistant!: Phaser.GameObjects.Container;
  private aiAssistantText!: Phaser.GameObjects.Text;
  private aiAssistantIcon!: Phaser.GameObjects.Graphics;
  private aiTipTimer = 0;
  private lastAITip = '';
  private playerMovementHistory: { x: number; y: number; time: number }[] = [];

  // Smart Enemy AI
  private enemyAIEnabled = true;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Get selected ship and laser from registry
    this.selectedShip = this.registry.get('selectedShip') || 'player';
    this.selectedLaser = this.registry.get('selectedLaser') || 'laserBlue01';

    // Get gesture controller from registry
    this.gestureController = this.registry.get('gestureController') || null;
    this.gesturesEnabled = this.registry.get('gesturesEnabled') || false;

    // Create starfield background
    this.createStarfield();

    // Create planets in background
    this.createPlanets();

    // Create sound effects
    this.createSoundEffects();

    // Create player with selected ship
    this.player = this.physics.add.sprite(700, 800, this.selectedShip);
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

    // Create bullet groups with selected laser
    this.bullets = this.physics.add.group({
      defaultKey: this.selectedLaser,
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

    for (let i = 0; i < 350; i++) {
      const x = Phaser.Math.Between(0, 1400);
      const y = Phaser.Math.Between(0, 900);
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
        { planet: 'planet1', x: 175, y: 150, scale: 0.3, alpha: 0.6 },
        { planet: 'planet2', x: 1225, y: 225, scale: 0.4, alpha: 0.5 },
        { planet: 'planet3', x: 1138, y: 750, scale: 0.35, alpha: 0.4 }
      ],
      // Level 2 - More planets, different positions
      [
        { planet: 'planet2', x: 263, y: 120, scale: 0.25, alpha: 0.7 },
        { planet: 'planet4', x: 1138, y: 180, scale: 0.45, alpha: 0.6 },
        { planet: 'planet1', x: 350, y: 675, scale: 0.3, alpha: 0.5 },
        { planet: 'planet3', x: 1225, y: 780, scale: 0.4, alpha: 0.4 }
      ],
      // Level 3 - Dense planet field
      [
        { planet: 'planet3', x: 140, y: 225, scale: 0.35, alpha: 0.6 },
        { planet: 'planet1', x: 700, y: 150, scale: 0.3, alpha: 0.5 },
        { planet: 'planet4', x: 1260, y: 270, scale: 0.4, alpha: 0.7 },
        { planet: 'planet2', x: 263, y: 750, scale: 0.35, alpha: 0.5 },
        { planet: 'planet3', x: 1138, y: 720, scale: 0.3, alpha: 0.4 }
      ],
      // Level 4 - Large planets closer
      [
        { planet: 'planet4', x: 210, y: 180, scale: 0.5, alpha: 0.7 },
        { planet: 'planet1', x: 1190, y: 150, scale: 0.5, alpha: 0.6 },
        { planet: 'planet2', x: 700, y: 750, scale: 0.45, alpha: 0.5 }
      ],
      // Level 5 - Epic final background
      [
        { planet: 'planet3', x: 700, y: 225, scale: 0.6, alpha: 0.8 },
        { planet: 'planet4', x: 175, y: 675, scale: 0.4, alpha: 0.6 },
        { planet: 'planet1', x: 1225, y: 750, scale: 0.4, alpha: 0.6 },
        { planet: 'planet2', x: 263, y: 150, scale: 0.3, alpha: 0.5 },
        { planet: 'planet4', x: 1138, y: 180, scale: 0.35, alpha: 0.5 }
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
    const levelText = this.add.text(700, 375, `LEVEL ${this.currentLevel}`, {
      fontSize: '64px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    levelText.setOrigin(0.5);
    levelText.setAlpha(0);

    const readyText = this.add.text(700, 495, 'READY?', {
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
        const finalX = 350 + col * 100;
        const finalY = 120 + row * 70;
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
    panelGraphics.fillRoundedRect(10, 10, 1380, 60, 8);
    panelGraphics.lineStyle(2, 0x00ffff, 0.5);
    panelGraphics.strokeRoundedRect(10, 10, 1380, 60, 8);

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
    levelBg.fillRoundedRect(640, 20, 120, 35, 6);
    levelBg.lineStyle(2, 0x00ffff, 0.8);
    levelBg.strokeRoundedRect(640, 20, 120, 35, 6);

    this.levelText = this.add.text(700, 37, `LEVEL ${this.currentLevel}`, {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);

    // Resources panel (right side)
    const resourceBg = this.add.graphics();
    resourceBg.fillStyle(0x001a00, 0.8);
    resourceBg.fillRoundedRect(1150, 25, 110, 30, 5);
    resourceBg.lineStyle(1, 0x00ff00, 0.6);
    resourceBg.strokeRoundedRect(1150, 25, 110, 30, 5);

    this.add.text(1155, 30, '⚡', {
      fontSize: '18px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });

    this.resourcesText = this.add.text(1180, 32, `${this.resources.toString().padStart(3, '0')}`, {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });

    // Score panel (far right)
    const scoreBg = this.add.graphics();
    scoreBg.fillStyle(0x1a1a00, 0.8);
    scoreBg.fillRoundedRect(1270, 25, 110, 30, 5);
    scoreBg.lineStyle(1, 0xffff00, 0.6);
    scoreBg.strokeRoundedRect(1270, 25, 110, 30, 5);

    this.add.text(1275, 30, '⭐', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });

    this.scoreText = this.add.text(1300, 32, `${this.score.toString().padStart(5, '0')}`, {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });

    // Combo text (initially hidden)
    this.comboText = this.add.text(700, 150, '', {
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

    // Create AI Co-Pilot Assistant
    this.createAIAssistant();
  }

  createPowerUpPanel() {
    this.powerUpPanel = this.add.container(0, 0);

    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.7);
    panelBg.fillRoundedRect(10, 820, 250, 70, 8);
    panelBg.lineStyle(2, 0x9900ff, 0.6);
    panelBg.strokeRoundedRect(10, 820, 250, 70, 8);

    const title = this.add.text(20, 828, 'POWER-UPS:', {
      fontSize: '14px',
      color: '#9900ff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });

    // Power-up 1: Rapid Fire
    const rapid = this.add.text(20, 848, `[1] Rapid Fire (${this.rapidFireCost}⚡)`, {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace'
    });

    // Power-up 2: Shield
    const shield = this.add.text(20, 863, `[2] Shield (${this.shieldCost}⚡)`, {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace'
    });

    // Power-up 3: Speed Boost
    const speed = this.add.text(20, 878, `[3] Speed Boost (${this.speedBoostCost}⚡)`, {
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
    const bossIntroText = this.add.text(700, 375, 'FINAL BOSS', {
      fontSize: '72px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    bossIntroText.setOrigin(0.5);
    bossIntroText.setAlpha(0);
    bossIntroText.setStroke('#660000', 8);

    const warningText = this.add.text(700, 495, 'THE MOTHERSHIP APPROACHES!', {
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
    this.boss = this.physics.add.sprite(700, -150, 'enemy8');
    this.boss.setScale(3); // Make it much larger
    this.boss.setAlpha(0);
    this.boss.setActive(true); // Ensure boss is active

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
    this.bossHealthBarBg.fillRoundedRect(450, 80, 500, 20, 5);
    this.bossHealthBarBg.lineStyle(2, 0xff0000, 1);
    this.bossHealthBarBg.strokeRoundedRect(450, 80, 500, 20, 5);
    this.bossHealthBarBg.setVisible(false);
    this.bossHealthBarBg.setDepth(100);

    // Health bar fill
    this.bossHealthBar = this.add.graphics();
    this.bossHealthBar.setVisible(false);
    this.bossHealthBar.setDepth(101);

    // Boss name text
    this.bossHealthText = this.add.text(700, 70, 'MOTHERSHIP', {
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
    this.bossHealthBar.fillRoundedRect(452, 82, barWidth, 16, 4);
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
    this.pauseMenu = this.add.container(700, 450);

    // Background overlay
    const overlay = this.add.rectangle(0, 0, 1400, 900, 0x000000, 0.8);
    overlay.setOrigin(0.5);

    // Pause menu panel
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x001a33, 0.95);
    menuBg.fillRoundedRect(-250, -200, 500, 400, 12);
    menuBg.lineStyle(3, 0x00ffff, 1);
    menuBg.strokeRoundedRect(-250, -200, 500, 400, 12);

    const pauseTitle = this.add.text(0, -140, 'PAUSED', {
      fontSize: '48px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    pauseTitle.setOrigin(0.5);

    // Option 1: Resume - Using rectangle for better interaction
    const resumeBg = this.add.rectangle(0, -30, 400, 60, 0x003300, 0.9);
    resumeBg.setStrokeStyle(2, 0x00ff00, 1);
    resumeBg.setInteractive({ useHandCursor: true });
    resumeBg.on('pointerdown', () => this.togglePause());
    resumeBg.on('pointerover', () => {
      resumeBg.setFillStyle(0x004400, 1);
      resumeBg.setStrokeStyle(3, 0x00ff00, 1);
    });
    resumeBg.on('pointerout', () => {
      resumeBg.setFillStyle(0x003300, 0.9);
      resumeBg.setStrokeStyle(2, 0x00ff00, 1);
    });

    const resumeText = this.add.text(0, -30, 'RESUME (ESC)', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    resumeText.setOrigin(0.5);

    // Option 2: Restart - Using rectangle for better interaction
    const restartBg = this.add.rectangle(0, 50, 400, 60, 0x331a00, 0.9);
    restartBg.setStrokeStyle(2, 0xffaa00, 1);
    restartBg.setInteractive({ useHandCursor: true });
    restartBg.on('pointerdown', () => this.restartGame());
    restartBg.on('pointerover', () => {
      restartBg.setFillStyle(0x442200, 1);
      restartBg.setStrokeStyle(3, 0xffaa00, 1);
    });
    restartBg.on('pointerout', () => {
      restartBg.setFillStyle(0x331a00, 0.9);
      restartBg.setStrokeStyle(2, 0xffaa00, 1);
    });

    const restartText = this.add.text(0, 50, 'RESTART', {
      fontSize: '24px',
      color: '#ffaa00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    restartText.setOrigin(0.5);

    // Option 3: Main Menu - Using rectangle for better interaction
    const menuButtonBg = this.add.rectangle(0, 130, 400, 60, 0x330000, 0.9);
    menuButtonBg.setStrokeStyle(2, 0xff0000, 1);
    menuButtonBg.setInteractive({ useHandCursor: true });
    menuButtonBg.on('pointerdown', () => this.returnToMenu());
    menuButtonBg.on('pointerover', () => {
      menuButtonBg.setFillStyle(0x440000, 1);
      menuButtonBg.setStrokeStyle(3, 0xff0000, 1);
    });
    menuButtonBg.on('pointerout', () => {
      menuButtonBg.setFillStyle(0x330000, 0.9);
      menuButtonBg.setStrokeStyle(2, 0xff0000, 1);
    });

    const menuText = this.add.text(0, 130, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ff6666',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    menuText.setOrigin(0.5);

    this.pauseMenu.add([overlay, menuBg, pauseTitle, resumeBg, resumeText, restartBg, restartText, menuButtonBg, menuText]);
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

  update(time: number, delta: number) {
    // Handle pause
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.togglePause();
    }

    if (this.gameOver || this.introAnimationPlaying || this.isPaused) {
      return;
    }

    // Update AI Assistant
    this.updateAIAssistant(time, delta);

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

    // Update gesture state from registry (can be toggled during gameplay)
    this.gesturesEnabled = this.registry.get('gesturesEnabled') || false;

    // Get gesture state if gestures are enabled
    let gestureState: GestureState | null = null;
    if (this.gesturesEnabled && this.gestureController) {
      gestureState = this.gestureController.getGestureState();
    }

    // Player movement (with speed boost)
    const moveSpeed = this.speedBoostActive ? 300 : 200;

    // Horizontal movement - keyboard or gesture
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
    } else if (gestureState && gestureState.isHandDetected) {
      // Gesture control (inverted to match mirror view)
      if (gestureState.moveDirection === 'left') {
        this.player.setVelocityX(moveSpeed); // Hand left = ship right (mirror)
      } else if (gestureState.moveDirection === 'right') {
        this.player.setVelocityX(-moveSpeed); // Hand right = ship left (mirror)
      } else {
        this.player.setVelocityX(0);
      }
    } else {
      this.player.setVelocityX(0);
    }

    // Vertical movement - keyboard only
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-moveSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(moveSpeed);
    } else {
      this.player.setVelocityY(0);
    }

    // Shooting - keyboard or gesture
    const shouldShoot = this.cursors.space.isDown ||
      (gestureState && gestureState.isHandDetected && gestureState.isPalmOpen);

    if (shouldShoot && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // Gesture-based power-up activation using finger counting
    if (gestureState && gestureState.isHandDetected) {
      const fingerCount = gestureState.fingersExtended;

      // Activate power-ups when finger count changes (edge trigger)
      if (fingerCount !== this.lastFingerCount && fingerCount >= 1 && fingerCount <= 3) {
        switch (fingerCount) {
          case 1:
            this.activateRapidFire();
            break;
          case 2:
            this.activateShield();
            break;
          case 3:
            this.activateSpeedBoost();
            break;
        }
      }
      this.lastFingerCount = fingerCount;
    } else {
      this.lastFingerCount = 0;
    }

    // Move enemies
    this.moveEnemies();

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
      if (b.y > 910) {
        this.enemyBullets.killAndHide(b);
      }
      return true;
    });

    // Clean up asteroids that go off-screen
    this.asteroids.children.each((asteroid) => {
      const a = asteroid as Phaser.Physics.Arcade.Sprite;
      if (a.active && (a.y > 950 || a.x < -100 || a.x > 1500)) {
        this.asteroids.killAndHide(a);
      }
      return true;
    });

    // Check if all enemies are destroyed
    if (!this.introAnimationPlaying) {
      if (this.enemies.countActive() === 0) {
        // Check if all enemies destroyed
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
      bullet.setTexture(this.selectedLaser); // Use selected laser
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
        bullet.setScale(0.8);

        // AI: Predict player movement and aim there
        if (this.enemyAIEnabled && this.currentLevel >= 2) {
          const predictedPosition = this.predictPlayerPosition();
          const angle = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            predictedPosition.x,
            predictedPosition.y
          );

          const speed = 200;
          bullet.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        } else {
          // Normal straight shot
          bullet.setVelocityY(180);
        }

        // Play enemy shoot sound
        this.soundGenerator.playEnemyShootSound();
      }
    }
  }

  predictPlayerPosition(): { x: number; y: number } {
    // Analyze player movement history to predict future position
    if (this.playerMovementHistory.length < 10) {
      return { x: this.player.x, y: this.player.y };
    }

    // Get last 10 positions
    const recentHistory = this.playerMovementHistory.slice(-10);

    // Calculate average velocity
    let avgVelocityX = 0;
    let avgVelocityY = 0;

    for (let i = 1; i < recentHistory.length; i++) {
      const deltaTime = recentHistory[i].time - recentHistory[i - 1].time;
      if (deltaTime > 0) {
        avgVelocityX += (recentHistory[i].x - recentHistory[i - 1].x) / deltaTime;
        avgVelocityY += (recentHistory[i].y - recentHistory[i - 1].y) / deltaTime;
      }
    }

    avgVelocityX /= (recentHistory.length - 1);
    avgVelocityY /= (recentHistory.length - 1);

    // Predict position 300ms ahead
    const predictionTime = 300;
    const predictedX = this.player.x + (avgVelocityX * predictionTime);
    const predictedY = this.player.y + (avgVelocityY * predictionTime);

    return { x: predictedX, y: predictedY };
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

        if ((e.x > 1350 && this.enemyDirection > 0) || (e.x < 50 && this.enemyDirection < 0)) {
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

            if (e.y > 750) {
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

    // Don't deactivate the boss - only regular enemies
    if (!this.isBossLevel || e !== this.boss) {
      e.setActive(false);
      e.setVisible(false);
    }

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
      // Pause timers
      if (this.enemyFireTimer) {
        this.enemyFireTimer.paused = true;
      }
      if (this.asteroidSpawnTimer) {
        this.asteroidSpawnTimer.paused = true;
      }
    } else {
      this.physics.resume();
      if (this.music) {
        (this.music as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).resume();
      }
      // Resume timers
      if (this.enemyFireTimer) {
        this.enemyFireTimer.paused = false;
      }
      if (this.asteroidSpawnTimer) {
        this.asteroidSpawnTimer.paused = false;
      }
    }
  }

  restartGame() {
    // Stop music
    if (this.music) {
      this.music.stop();
    }

    // Reset all game state
    this.score = 0;
    this.lives = 3;
    this.resources = 0;
    this.currentLevel = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.enemySpeed = 0.3;
    this.baseEnemySpeed = 0.3;
    this.combo = 0;
    this.comboTimer = 0;

    // Restart the scene
    this.scene.restart();
  }

  returnToMenu() {
    // Stop music
    if (this.music) {
      this.music.stop();
    }

    // Reset pause state
    this.isPaused = false;

    // Return to menu scene
    this.scene.start('MenuScene');
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
      x = Phaser.Math.Between(50, 1350);
      y = -50;
      velocityX = Phaser.Math.Between(-50, 50);
      velocityY = Phaser.Math.Between(80, 150);
    } else if (spawnSide === 1) {
      // Spawn from left
      x = -50;
      y = Phaser.Math.Between(50, 450);
      velocityX = Phaser.Math.Between(80, 150);
      velocityY = Phaser.Math.Between(-30, 100);
    } else {
      // Spawn from right
      x = 1450;
      y = Phaser.Math.Between(50, 450);
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

      if (this.boss.x > 1200 || this.boss.x < 200) {
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

    // AI-Generated attack patterns based on phase and player behavior
    const attackPatterns = this.generateBossAttackPattern();

    attackPatterns.forEach((pattern) => {
      const bullet = this.enemyBullets.get(
        this.boss.x + pattern.offsetX,
        this.boss.y + 60
      );

      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setScale(pattern.scale);

        if (pattern.aimAtPlayer) {
          // AI prediction: Aim at predicted player position
          const predictedPos = this.predictPlayerPosition();
          const angle = Phaser.Math.Angle.Between(
            this.boss.x,
            this.boss.y,
            predictedPos.x,
            predictedPos.y
          );
          bullet.setVelocity(
            Math.cos(angle) * pattern.speed,
            Math.sin(angle) * pattern.speed
          );
        } else {
          bullet.setVelocity(pattern.velocityX, pattern.velocityY);
        }
      }
    });

    this.soundGenerator.playEnemyShootSound();
  }

  generateBossAttackPattern(): Array<{
    offsetX: number;
    offsetY: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    scale: number;
    aimAtPlayer: boolean;
  }> {
    const patterns: any[] = [];

    // AI adapts pattern based on boss phase and player position
    if (this.bossPhase === 1) {
      // Phase 1: Predictive aimed shots
      patterns.push({
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 200,
        speed: 220,
        scale: 1.2,
        aimAtPlayer: true
      });

      // Add side shots if player moves too much
      if (this.playerMovementHistory.length > 20) {
        const avgMovement = this.calculateAverageMovement();
        if (Math.abs(avgMovement.x) > 2) {
          patterns.push(
            {
              offsetX: -40,
              offsetY: 0,
              velocityX: -60,
              velocityY: 180,
              speed: 200,
              scale: 1.0,
              aimAtPlayer: false
            },
            {
              offsetX: 40,
              offsetY: 0,
              velocityX: 60,
              velocityY: 180,
              speed: 200,
              scale: 1.0,
              aimAtPlayer: false
            }
          );
        }
      }
    } else if (this.bossPhase === 2) {
      // Phase 2: Spread + Predictive
      for (let i = -1; i <= 1; i++) {
        patterns.push({
          offsetX: i * 40,
          offsetY: 0,
          velocityX: i * 80,
          velocityY: 200,
          speed: 210,
          scale: 1.2,
          aimAtPlayer: false
        });
      }

      // Add predicted shot
      patterns.push({
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
        speed: 240,
        scale: 1.3,
        aimAtPlayer: true
      });
    } else {
      // Phase 3: Maximum chaos - AI generates complex pattern
      // Wide spread
      for (let i = -2; i <= 2; i++) {
        patterns.push({
          offsetX: i * 30,
          offsetY: 0,
          velocityX: i * 60,
          velocityY: 220,
          speed: 220,
          scale: 1.1,
          aimAtPlayer: false
        });
      }

      // Multiple predicted shots
      patterns.push(
        {
          offsetX: 0,
          offsetY: 0,
          velocityX: 0,
          velocityY: 0,
          speed: 260,
          scale: 1.5,
          aimAtPlayer: true
        },
        {
          offsetX: -20,
          offsetY: 0,
          velocityX: 0,
          velocityY: 0,
          speed: 240,
          scale: 1.3,
          aimAtPlayer: true
        },
        {
          offsetX: 20,
          offsetY: 0,
          velocityX: 0,
          velocityY: 0,
          speed: 240,
          scale: 1.3,
          aimAtPlayer: true
        }
      );
    }

    return patterns;
  }

  calculateAverageMovement(): { x: number; y: number } {
    if (this.playerMovementHistory.length < 2) {
      return { x: 0, y: 0 };
    }

    const recent = this.playerMovementHistory.slice(-20);
    let totalDeltaX = 0;
    let totalDeltaY = 0;

    for (let i = 1; i < recent.length; i++) {
      totalDeltaX += recent[i].x - recent[i - 1].x;
      totalDeltaY += recent[i].y - recent[i - 1].y;
    }

    return {
      x: totalDeltaX / (recent.length - 1),
      y: totalDeltaY / (recent.length - 1)
    };
  }

  hitBoss(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _boss: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const b = bullet as Phaser.Physics.Arcade.Sprite;

    // Don't allow hits during intro animation
    if (!this.boss.active || this.introAnimationPlaying) return;

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
    const warning = this.add.text(700, 450, text, {
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
    this.add.rectangle(700, 450, 1400, 900, 0x000000, 0.85);

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x001a00, 0.95);
    menuBg.fillRoundedRect(450, 180, 500, 360, 12);
    menuBg.lineStyle(3, 0x00ff00, 1);
    menuBg.strokeRoundedRect(450, 180, 500, 360, 12);

    const winText = this.add.text(700, 240, 'VICTORY!', {
      fontSize: '72px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    winText.setOrigin(0.5);
    winText.setStroke('#003300', 6);

    const congratsText = this.add.text(700, 320, 'You completed all 5 levels!', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    congratsText.setOrigin(0.5);

    const statsPanel = this.add.graphics();
    statsPanel.fillStyle(0x002200, 0.8);
    statsPanel.fillRoundedRect(500, 360, 400, 80, 8);
    statsPanel.lineStyle(2, 0x00ff00, 0.5);
    statsPanel.strokeRoundedRect(500, 360, 400, 80, 8);

    const finalScoreText = this.add.text(700, 380, `Final Score: ${this.score}`, {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    finalScoreText.setOrigin(0.5);

    const resourcesCollected = this.add.text(700, 415, `Resources Collected: ${this.resources}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    resourcesCollected.setOrigin(0.5);

    // Play Again button
    const playAgainButton = this.add.rectangle(700, 480, 350, 60, 0x003300, 0.95);
    playAgainButton.setStrokeStyle(3, 0x00ff00, 1);
    playAgainButton.setInteractive({ useHandCursor: true });
    playAgainButton.on('pointerdown', () => {
      // Reset all game state before restart
      this.score = 0;
      this.lives = 3;
      this.resources = 0;
      this.currentLevel = 1;
      this.gameOver = false;
      this.enemySpeed = 0.3;
      this.baseEnemySpeed = 0.3;
      this.combo = 0;
      this.comboTimer = 0;
      this.scene.restart();
    });
    playAgainButton.on('pointerover', () => {
      playAgainButton.setFillStyle(0x004400, 1);
      playAgainButton.setStrokeStyle(4, 0x00ff00, 1);
    });
    playAgainButton.on('pointerout', () => {
      playAgainButton.setFillStyle(0x003300, 0.95);
      playAgainButton.setStrokeStyle(3, 0x00ff00, 1);
    });

    const playAgainText = this.add.text(700, 480, 'PLAY AGAIN', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    playAgainText.setOrigin(0.5);

    // Main Menu button
    const menuButton = this.add.rectangle(700, 560, 350, 60, 0x330000, 0.95);
    menuButton.setStrokeStyle(3, 0xff6666, 1);
    menuButton.setInteractive({ useHandCursor: true });
    menuButton.on('pointerdown', () => {
      if (this.music) {
        this.music.stop();
      }
      this.scene.start('MenuScene');
    });
    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x440000, 1);
      menuButton.setStrokeStyle(4, 0xff6666, 1);
    });
    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x330000, 0.95);
      menuButton.setStrokeStyle(3, 0xff6666, 1);
    });

    const menuText = this.add.text(700, 560, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ff6666',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    menuText.setOrigin(0.5);

    // Animate win text with glow effect
    this.tweens.add({
      targets: winText,
      scale: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  endGame() {
    this.gameOver = true;
    this.physics.pause();

    // Stop background music
    if (this.music) {
      this.music.stop();
    }

    // Play game over sound
    this.sound.play('gameOverSound', { volume: 0.5 });

    // Create game over screen background
    this.add.rectangle(700, 450, 1400, 900, 0x000000, 0.85);

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x1a0000, 0.95);
    menuBg.fillRoundedRect(450, 225, 500, 300, 12);
    menuBg.lineStyle(3, 0xff0000, 1);
    menuBg.strokeRoundedRect(450, 225, 500, 300, 12);

    const gameOverText = this.add.text(700, 295, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setStroke('#330000', 6);

    const statsPanel = this.add.graphics();
    statsPanel.fillStyle(0x220000, 0.8);
    statsPanel.fillRoundedRect(500, 355, 400, 80, 8);
    statsPanel.lineStyle(2, 0xff0000, 0.5);
    statsPanel.strokeRoundedRect(500, 355, 400, 80, 8);

    const finalScoreText = this.add.text(700, 375, `Final Score: ${this.score}`, {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    finalScoreText.setOrigin(0.5);

    const levelReached = this.add.text(700, 410, `Level Reached: ${this.currentLevel}`, {
      fontSize: '20px',
      color: '#ff6666',
      fontFamily: 'monospace'
    });
    levelReached.setOrigin(0.5);

    // Restart button
    const restartButton = this.add.rectangle(700, 470, 350, 60, 0x003300, 0.95);
    restartButton.setStrokeStyle(3, 0x00ff00, 1);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => {
      // Reset all game state before restart
      this.score = 0;
      this.lives = 3;
      this.resources = 0;
      this.currentLevel = 1;
      this.gameOver = false;
      this.enemySpeed = 0.3;
      this.baseEnemySpeed = 0.3;
      this.combo = 0;
      this.comboTimer = 0;
      this.scene.restart();
    });
    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0x004400, 1);
      restartButton.setStrokeStyle(4, 0x00ff00, 1);
    });
    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0x003300, 0.95);
      restartButton.setStrokeStyle(3, 0x00ff00, 1);
    });

    const restartText = this.add.text(700, 470, 'TRY AGAIN', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    restartText.setOrigin(0.5);

    // Main Menu button
    const menuButton = this.add.rectangle(700, 550, 350, 60, 0x330000, 0.95);
    menuButton.setStrokeStyle(3, 0xff6666, 1);
    menuButton.setInteractive({ useHandCursor: true });
    menuButton.on('pointerdown', () => {
      if (this.music) {
        this.music.stop();
      }
      this.scene.start('MenuScene');
    });
    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x440000, 1);
      menuButton.setStrokeStyle(4, 0xff6666, 1);
    });
    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x330000, 0.95);
      menuButton.setStrokeStyle(3, 0xff6666, 1);
    });

    const menuText = this.add.text(700, 550, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ff6666',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    menuText.setOrigin(0.5);

    // Animate game over text
    this.tweens.add({
      targets: gameOverText,
      scale: 1.1,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createAIAssistant() {
    this.aiAssistant = this.add.container(1150, 100);

    // AI Icon (robot head)
    this.aiAssistantIcon = this.add.graphics();
    this.aiAssistantIcon.fillStyle(0x00ffff, 1);
    this.aiAssistantIcon.fillCircle(0, 0, 20);
    this.aiAssistantIcon.fillStyle(0x001a33, 1);
    this.aiAssistantIcon.fillCircle(-5, -5, 4); // Left eye
    this.aiAssistantIcon.fillCircle(5, -5, 4); // Right eye
    this.aiAssistantIcon.lineStyle(2, 0x001a33, 1);
    this.aiAssistantIcon.strokeRect(-8, 5, 16, 4); // Mouth

    // Pulsing animation for AI icon
    this.tweens.add({
      targets: this.aiAssistantIcon,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x001a33, 0.9);
    panel.fillRoundedRect(-120, 30, 240, 80, 8);
    panel.lineStyle(2, 0x00ffff, 0.8);
    panel.strokeRoundedRect(-120, 30, 240, 80, 8);

    // AI Label
    const label = this.add.text(0, 45, 'AI CO-PILOT', {
      fontSize: '12px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    // AI Tip Text
    this.aiAssistantText = this.add.text(0, 75, 'Analyzing...', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    });
    this.aiAssistantText.setOrigin(0.5);
    this.aiAssistantText.setWordWrapWidth(220);

    this.aiAssistant.add([panel, this.aiAssistantIcon, label, this.aiAssistantText]);
    this.aiAssistant.setDepth(100);
  }

  updateAIAssistant(time: number, delta: number) {
    this.aiTipTimer += delta;

    // Track player movement for AI analysis
    this.playerMovementHistory.push({
      x: this.player.x,
      y: this.player.y,
      time: time
    });

    // Keep only last 2 seconds of history
    if (this.playerMovementHistory.length > 120) {
      this.playerMovementHistory.shift();
    }

    // Give tips every 5 seconds
    if (this.aiTipTimer > 5000) {
      this.aiTipTimer = 0;
      this.giveAITip();
    }
  }

  giveAITip() {
    const tips: string[] = [];

    // Analyze situation and give contextual tips
    const enemyCount = this.enemies.countActive();
    const healthPercentage = this.lives / 3;

    if (healthPercentage < 0.34 && this.resources >= this.shieldCost) {
      tips.push('⚠️ Low health!\nActivate Shield [2]');
    }

    if (enemyCount > 15 && this.resources >= this.rapidFireCost) {
      tips.push('💡 Many enemies!\nUse Rapid Fire [1]');
    }

    if (this.player.y < 300) {
      tips.push('⚠️ Too close to\nenemies! Move back');
    }

    if (this.resources > 50) {
      tips.push('💎 Use power-ups!\nYou have resources');
    }

    if (this.combo > 5) {
      tips.push('🔥 Great combo!\nKeep it up!');
    }

    if (this.enemies.countActive() < 5 && !this.isBossLevel) {
      tips.push('✓ Almost clear!\nStay focused');
    }

    if (this.isBossLevel && this.bossHealth < this.bossMaxHealth * 0.3) {
      tips.push('🎯 Boss low health!\nFinal push!');
    }

    if (tips.length === 0) {
      tips.push('👍 Good positioning\nKeep moving!');
    }

    // Select random tip from available ones
    const selectedTip = tips[Math.floor(Math.random() * tips.length)];

    if (selectedTip !== this.lastAITip) {
      this.lastAITip = selectedTip;
      this.aiAssistantText.setText(selectedTip);

      // Flash animation
      this.tweens.add({
        targets: this.aiAssistantText,
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        repeat: 1
      });
    }
  }
}
