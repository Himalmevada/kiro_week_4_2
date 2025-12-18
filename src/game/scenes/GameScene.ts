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

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();

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
    const enemyTypes = ['enemy1', 'enemy2', 'enemy4', 'enemy5', 'enemy6', 'enemy8'];
    this.introAnimationPlaying = true;

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
    // Lives display
    this.livesText = this.add.text(20, 20, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.updateLivesDisplay();

    // Level display
    this.levelText = this.add.text(400, 20, `LEVEL ${this.currentLevel}`, {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5, 0);

    // Resources display
    this.resourcesText = this.add.text(250, 20, `⚡ × ${this.resources.toString().padStart(3, '0')}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });

    // Score display
    this.scoreText = this.add.text(700, 20, `⭐ ${this.score.toString().padStart(4, '0')}`, {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
  }

  updateLivesDisplay() {
    let livesStr = '';
    for (let i = 0; i < this.lives; i++) {
      livesStr += '🚀 ';
    }
    for (let i = this.lives; i < 3; i++) {
      livesStr += '🔲 ';
    }
    this.livesText.setText(livesStr);
  }

  update(time: number) {
    if (this.gameOver || this.introAnimationPlaying) {
      return;
    }

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // Shooting
    if (this.cursors.space.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
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

    // Check if all enemies are destroyed
    if (this.enemies.countActive() === 0 && !this.introAnimationPlaying) {
      if (this.currentLevel < this.maxLevel) {
        // Progress to next level
        this.nextLevel();
      } else {
        // Won the game!
        this.winGame();
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

    this.score += 10;
    this.resources += 1;
    this.scoreText.setText(`⭐ ${this.score.toString().padStart(4, '0')}`);
    this.resourcesText.setText(`⚡ × ${this.resources.toString().padStart(3, '0')}`);

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

  loseLife() {
    if (this.gameOver) return;

    this.lives -= 1;
    this.updateLivesDisplay();

    // Play hit sound
    this.soundGenerator.playHitSound();

    // Flash effect
    this.cameras.main.flash(200, 255, 0, 0);

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
      this.scoreText.setText(`⭐ ${this.score.toString().padStart(4, '0')}`);

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

    const winText = this.add.text(400, 200, 'VICTORY!', {
      fontSize: '72px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    winText.setOrigin(0.5);

    const congratsText = this.add.text(400, 280, 'You completed all 5 levels!', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    congratsText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 340, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    finalScoreText.setOrigin(0.5);

    const restartText = this.add.text(400, 420, 'Press SPACE to Play Again', {
      fontSize: '24px',
      color: '#00ffff',
      fontFamily: 'monospace'
    });
    restartText.setOrigin(0.5);

    // Animate win text
    this.tweens.add({
      targets: winText,
      scale: 1.2,
      duration: 500,
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

    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 330, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    finalScoreText.setOrigin(0.5);

    const restartText = this.add.text(400, 400, 'Press SPACE to Restart', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    restartText.setOrigin(0.5);

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

      // Restart the scene
      this.scene.restart();
    });
  }
}
