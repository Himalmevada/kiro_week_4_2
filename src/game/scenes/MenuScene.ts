import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private stars!: Phaser.GameObjects.Graphics;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private selectedShip = 'playerShip1_blue';
  private selectedLaser = 'laserBlue01';
  private shipOptions = [
    { key: 'playerShip1_blue', name: 'Scout', color: 'Blue' },
    { key: 'playerShip1_green', name: 'Scout', color: 'Green' },
    { key: 'playerShip1_orange', name: 'Scout', color: 'Orange' },
    { key: 'playerShip1_red', name: 'Scout', color: 'Red' },
    { key: 'playerShip2_blue', name: 'Fighter', color: 'Blue' },
    { key: 'playerShip2_green', name: 'Fighter', color: 'Green' },
    { key: 'playerShip2_orange', name: 'Fighter', color: 'Orange' },
    { key: 'playerShip2_red', name: 'Fighter', color: 'Red' },
    { key: 'playerShip3_blue', name: 'Interceptor', color: 'Blue' },
    { key: 'playerShip3_green', name: 'Interceptor', color: 'Green' },
    { key: 'playerShip3_orange', name: 'Interceptor', color: 'Orange' },
    { key: 'playerShip3_red', name: 'Interceptor', color: 'Red' }
  ];
  private laserOptions = [
    { key: 'laserBlue01', name: 'Blue Beam', color: 0x00ffff },
    { key: 'laserBlue03', name: 'Blue Bolt', color: 0x00aaff },
    { key: 'laserBlue08', name: 'Blue Wave', color: 0x4444ff },
    { key: 'laserBlue16', name: 'Blue Pulse', color: 0x8888ff },
    { key: 'laserRed01', name: 'Red Beam', color: 0xff0000 },
    { key: 'laserRed03', name: 'Red Bolt', color: 0xff4444 },
    { key: 'laserRed08', name: 'Red Wave', color: 0xff6666 },
    { key: 'laserRed16', name: 'Red Pulse', color: 0xff8888 }
  ];
  private currentShipIndex = 0;
  private currentLaserIndex = 0;
  private laserPreview!: Phaser.GameObjects.Image;
  private laserNameText!: Phaser.GameObjects.Text;
  private shipPreview!: Phaser.GameObjects.Image;
  private shipNameText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Create starfield background
    this.createStarfield();

    // Create title background
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x001a33, 0.9);
    titleBg.fillRoundedRect(400, 120, 600, 100, 12);
    titleBg.lineStyle(3, 0x00ffff, 1);
    titleBg.strokeRoundedRect(400, 120, 600, 100, 12);

    // Game title
    const title = this.add.text(700, 170, 'SPACE INVADERS', {
      fontSize: '56px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    title.setStroke('#003333', 6);

    // Animate title
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Instructions panel
    const instructionsBg = this.add.graphics();
    instructionsBg.fillStyle(0x001a1a, 0.85);
    instructionsBg.fillRoundedRect(400, 280, 600, 280, 10);
    instructionsBg.lineStyle(2, 0x00ffff, 0.6);
    instructionsBg.strokeRoundedRect(400, 280, 600, 280, 10);

    // Instructions header
    const instructionsTitle = this.add.text(700, 310, 'HOW TO PLAY', {
      fontSize: '28px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    instructionsTitle.setOrigin(0.5);

    // Control instructions
    const controls = [
      { key: 'ARROW KEYS', action: 'Move ship in game' },
      { key: 'SPACE', action: 'Fire lasers' },
      { key: '1/2/3', action: 'Activate power-ups' },
      { key: 'ESC', action: 'Pause game' },
      { key: '↑↓ ARROWS', action: 'Select ship (menu)' },
      { key: '←→ ARROWS', action: 'Select laser (menu)' }
    ];

    let yOffset = 360;
    controls.forEach((control) => {
      const keyText = this.add.text(450, yOffset, control.key, {
        fontSize: '14px',
        color: '#00ffff',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      });

      const actionText = this.add.text(610, yOffset, `- ${control.action}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace'
      });

      yOffset += 26;
    });

    // Game objective
    // const objective = this.add.text(700, 490, 'Destroy enemies, collect energy ⚡, survive 5 levels!', {
    //   fontSize: '15px',
    //   color: '#ffff00',
    //   fontFamily: 'monospace',
    //   align: 'center'
    // });
    // objective.setOrigin(0.5);

    const asteroidWarning = this.add.text(700, 515, 'Watch out for asteroids!', {
      fontSize: '13px',
      color: '#ff6666',
      fontFamily: 'monospace',
      align: 'center'
    });
    asteroidWarning.setOrigin(0.5);

    const powerUpHint = this.add.text(700, 535, 'Use energy for power-ups: Rapid Fire, Shield, Speed!', {
      fontSize: '12px',
      color: '#9900ff',
      fontFamily: 'monospace',
      align: 'center'
    });
    powerUpHint.setOrigin(0.5);

    // Ship Customization Section (LEFT) - Perfectly centered
    const shipBg = this.add.graphics();
    shipBg.fillStyle(0x001a33, 0.85);
    shipBg.fillRoundedRect(150, 600, 340, 220, 12);
    shipBg.lineStyle(3, 0x00ffff, 0.8);
    shipBg.strokeRoundedRect(150, 600, 340, 220, 12);

    const shipTitle = this.add.text(320, 630, 'YOUR SHIP', {
      fontSize: '24px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    shipTitle.setOrigin(0.5);

    // Arrow buttons for ship selection
    const shipLeftArrow = this.add.text(210, 710, '<', {
      fontSize: '42px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    shipLeftArrow.setOrigin(0.5);
    shipLeftArrow.setInteractive({ useHandCursor: true });
    shipLeftArrow.on('pointerdown', () => this.changeShip(-1));

    this.shipPreview = this.add.image(320, 710, this.shipOptions[this.currentShipIndex].key);
    this.shipPreview.setScale(1.0);

    const shipRightArrow = this.add.text(430, 710, '>', {
      fontSize: '42px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    shipRightArrow.setOrigin(0.5);
    shipRightArrow.setInteractive({ useHandCursor: true });
    shipRightArrow.on('pointerdown', () => this.changeShip(1));

    this.shipNameText = this.add.text(320, 775, `${this.shipOptions[this.currentShipIndex].color} ${this.shipOptions[this.currentShipIndex].name}`, {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.shipNameText.setOrigin(0.5);

    const shipHint = this.add.text(320, 798, 'Use ↑ ↓ arrows', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace'
    });
    shipHint.setOrigin(0.5);

    // Start button (CENTER) - Perfectly centered at x:700 - Interactive rectangle
    const startButton = this.add.rectangle(700, 690, 320, 120, 0x003300, 0.95);
    startButton.setStrokeStyle(4, 0x00ff00, 1);
    startButton.setInteractive({ useHandCursor: true });
    startButton.on('pointerdown', () => this.startGame());
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x004400, 1);
      startButton.setStrokeStyle(5, 0x00ff00, 1);
    });
    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x003300, 0.95);
      startButton.setStrokeStyle(4, 0x00ff00, 1);
    });

    const startText = this.add.text(700, 665, 'CLICK OR SPACE', {
      fontSize: '28px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    startText.setOrigin(0.5);

    const startSubtext = this.add.text(700, 705, 'TO START GAME', {
      fontSize: '18px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    startSubtext.setOrigin(0.5);

    // Laser Customization Section (RIGHT) - Perfectly centered
    const laserBg = this.add.graphics();
    laserBg.fillStyle(0x001a33, 0.85);
    laserBg.fillRoundedRect(910, 600, 340, 220, 12);
    laserBg.lineStyle(3, 0xff9900, 0.8);
    laserBg.strokeRoundedRect(910, 600, 340, 220, 12);

    const laserTitle = this.add.text(1080, 630, 'LASER TYPE', {
      fontSize: '24px',
      color: '#ff9900',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    laserTitle.setOrigin(0.5);

    // Arrow buttons for laser selection - bigger
    const leftArrow = this.add.text(980, 710, '<', {
      fontSize: '42px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    leftArrow.setOrigin(0.5);
    leftArrow.setInteractive({ useHandCursor: true });
    leftArrow.on('pointerdown', () => this.changeLaser(-1));

    this.laserPreview = this.add.image(1080, 710, this.laserOptions[this.currentLaserIndex].key);
    this.laserPreview.setScale(1.8);

    const rightArrow = this.add.text(1180, 710, '>', {
      fontSize: '42px',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    rightArrow.setOrigin(0.5);
    rightArrow.setInteractive({ useHandCursor: true });
    rightArrow.on('pointerdown', () => this.changeLaser(1));

    this.laserNameText = this.add.text(1080, 775, this.laserOptions[this.currentLaserIndex].name, {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.laserNameText.setOrigin(0.5);

    const laserHint = this.add.text(1080, 798, 'Use ← → arrows', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace'
    });
    laserHint.setOrigin(0.5);

    // Animate start button
    this.tweens.add({
      targets: [startButton, startText, startSubtext],
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Setup space key
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  startGame() {
    // Store selections in registry for GameScene to access
    this.registry.set('selectedShip', this.selectedShip);
    this.registry.set('selectedLaser', this.selectedLaser);
    this.scene.start('GameScene');
  }

  changeShip(direction: number) {
    this.currentShipIndex += direction;

    // Wrap around
    if (this.currentShipIndex < 0) {
      this.currentShipIndex = this.shipOptions.length - 1;
    } else if (this.currentShipIndex >= this.shipOptions.length) {
      this.currentShipIndex = 0;
    }

    // Update preview
    this.selectedShip = this.shipOptions[this.currentShipIndex].key;
    this.shipPreview.setTexture(this.selectedShip);
    this.shipNameText.setText(`${this.shipOptions[this.currentShipIndex].color} ${this.shipOptions[this.currentShipIndex].name}`);

    // Flash effect
    this.tweens.add({
      targets: this.shipPreview,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.shipPreview.setScale(1.0);
      }
    });
  }

  changeLaser(direction: number) {
    this.currentLaserIndex += direction;

    // Wrap around
    if (this.currentLaserIndex < 0) {
      this.currentLaserIndex = this.laserOptions.length - 1;
    } else if (this.currentLaserIndex >= this.laserOptions.length) {
      this.currentLaserIndex = 0;
    }

    // Update preview
    this.selectedLaser = this.laserOptions[this.currentLaserIndex].key;
    this.laserPreview.setTexture(this.selectedLaser);
    this.laserNameText.setText(this.laserOptions[this.currentLaserIndex].name);

    // Flash effect
    this.tweens.add({
      targets: this.laserPreview,
      scale: 1.5,
      duration: 100,
      yoyo: true
    });
  }

  update() {
    const cursors = this.input.keyboard!.createCursorKeys();

    // Up/Down arrow keys to change ship
    if (Phaser.Input.Keyboard.JustDown(cursors.up!)) {
      this.changeShip(-1);
    } else if (Phaser.Input.Keyboard.JustDown(cursors.down!)) {
      this.changeShip(1);
    }

    // Left/Right arrow keys to change laser
    if (Phaser.Input.Keyboard.JustDown(cursors.left!)) {
      this.changeLaser(-1);
    } else if (Phaser.Input.Keyboard.JustDown(cursors.right!)) {
      this.changeLaser(1);
    }

    // Space to start game
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startGame();
    }
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
}
