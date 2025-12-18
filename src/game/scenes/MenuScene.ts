import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private stars!: Phaser.GameObjects.Graphics;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Create starfield background
    this.createStarfield();

    // Create title background
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x001a33, 0.9);
    titleBg.fillRoundedRect(100, 80, 600, 100, 12);
    titleBg.lineStyle(3, 0x00ffff, 1);
    titleBg.strokeRoundedRect(100, 80, 600, 100, 12);

    // Game title
    const title = this.add.text(400, 130, 'SPACE INVADERS', {
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
    instructionsBg.fillRoundedRect(150, 220, 500, 280, 10);
    instructionsBg.lineStyle(2, 0x00ffff, 0.6);
    instructionsBg.strokeRoundedRect(150, 220, 500, 280, 10);

    // Instructions header
    const instructionsTitle = this.add.text(400, 250, 'HOW TO PLAY', {
      fontSize: '28px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    instructionsTitle.setOrigin(0.5);

    // Control instructions
    const controls = [
      { key: 'ARROW KEYS', action: 'Move your ship' },
      { key: 'SPACE', action: 'Fire lasers' },
      { key: '1/2/3', action: 'Activate power-ups' },
      { key: 'ESC', action: 'Pause game' }
    ];

    let yOffset = 300;
    controls.forEach((control) => {
      const keyText = this.add.text(200, yOffset, control.key, {
        fontSize: '16px',
        color: '#00ffff',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      });

      const actionText = this.add.text(340, yOffset, `- ${control.action}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace'
      });

      yOffset += 30;
    });

    // Game objective
    const objective = this.add.text(400, 430, 'Destroy enemies, collect energy ⚡, survive 5 levels!', {
      fontSize: '15px',
      color: '#ffff00',
      fontFamily: 'monospace',
      align: 'center'
    });
    objective.setOrigin(0.5);

    const asteroidWarning = this.add.text(400, 455, 'Watch out for asteroids!', {
      fontSize: '13px',
      color: '#ff6666',
      fontFamily: 'monospace',
      align: 'center'
    });
    asteroidWarning.setOrigin(0.5);

    const powerUpHint = this.add.text(400, 475, 'Use energy for power-ups: Rapid Fire, Shield, Speed!', {
      fontSize: '12px',
      color: '#9900ff',
      fontFamily: 'monospace',
      align: 'center'
    });
    powerUpHint.setOrigin(0.5);

    // Start button
    const startButton = this.add.graphics();
    startButton.fillStyle(0x003300, 0.9);
    startButton.fillRoundedRect(275, 520, 250, 60, 8);
    startButton.lineStyle(3, 0x00ff00, 1);
    startButton.strokeRoundedRect(275, 520, 250, 60, 8);

    const startText = this.add.text(400, 550, 'PRESS SPACE TO START', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    startText.setOrigin(0.5);

    // Animate start button
    this.tweens.add({
      targets: [startButton, startText],
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Setup space key
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.scene.start('GameScene');
    }
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
}
