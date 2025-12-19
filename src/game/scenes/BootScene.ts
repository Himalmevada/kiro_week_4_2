import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load player ships - multiple variants for selection
    this.load.image('playerShip1_blue', '/kenney_space-shooter-redux/PNG/playerShip1_blue.png');
    this.load.image('playerShip1_green', '/kenney_space-shooter-redux/PNG/playerShip1_green.png');
    this.load.image('playerShip1_orange', '/kenney_space-shooter-redux/PNG/playerShip1_orange.png');
    this.load.image('playerShip1_red', '/kenney_space-shooter-redux/PNG/playerShip1_red.png');
    this.load.image('playerShip2_blue', '/kenney_space-shooter-redux/PNG/playerShip2_blue.png');
    this.load.image('playerShip2_green', '/kenney_space-shooter-redux/PNG/playerShip2_green.png');
    this.load.image('playerShip2_orange', '/kenney_space-shooter-redux/PNG/playerShip2_orange.png');
    this.load.image('playerShip2_red', '/kenney_space-shooter-redux/PNG/playerShip2_red.png');
    this.load.image('playerShip3_blue', '/kenney_space-shooter-redux/PNG/playerShip3_blue.png');
    this.load.image('playerShip3_green', '/kenney_space-shooter-redux/PNG/playerShip3_green.png');
    this.load.image('playerShip3_orange', '/kenney_space-shooter-redux/PNG/playerShip3_orange.png');
    this.load.image('playerShip3_red', '/kenney_space-shooter-redux/PNG/playerShip3_red.png');

    // Keep default 'player' key for backward compatibility
    this.load.image('player', '/assets/ships/playerShip1_blue.png');

    // Load lasers - multiple variants for selection
    this.load.image('laserBlue01', '/assets/lasers/laserBlue01.png');
    this.load.image('laserBlue03', '/assets/lasers/laserBlue03.png');
    this.load.image('laserBlue08', '/assets/lasers/laserBlue08.png');
    this.load.image('laserBlue16', '/assets/lasers/laserBlue16.png');
    this.load.image('laserRed01', '/assets/lasers/laserRed01.png');
    this.load.image('laserRed03', '/assets/lasers/laserRed03.png');
    this.load.image('laserRed08', '/assets/lasers/laserRed08.png');
    this.load.image('laserRed16', '/assets/lasers/laserRed16.png');

    // Keep default laser keys for compatibility
    this.load.image('laserBlue', '/assets/lasers/laserBlue01.png');
    this.load.image('laserRed', '/assets/lasers/laserRed01.png');

    // Load enemies
    this.load.image('enemy1', '/assets/enemies/enemyBlack1.png');
    this.load.image('enemy2', '/assets/enemies/enemyBlack2.png');
    this.load.image('enemy3', '/assets/enemies/enemyBlack3.png');
    this.load.image('enemy4', '/assets/enemies/enemyGreen1.png');
    this.load.image('enemy5', '/assets/enemies/enemyGreen2.png');
    this.load.image('enemy6', '/assets/enemies/enemyRed1.png');
    this.load.image('enemy7', '/assets/enemies/enemyRed2.png');
    this.load.image('enemy8', '/assets/enemies/enemyBlue1.png');

    // Load planets
    this.load.image('planet1', '/assets/planets/planet00.png');
    this.load.image('planet2', '/assets/planets/planet01.png');
    this.load.image('planet3', '/assets/planets/planet02.png');
    this.load.image('planet4', '/assets/planets/planet03.png');

    // Load meteors/asteroids
    this.load.image('meteorBrown1', '/kenney_space-shooter-redux/PNG/Meteors/meteorBrown_big1.png');
    this.load.image('meteorBrown2', '/kenney_space-shooter-redux/PNG/Meteors/meteorBrown_med1.png');
    this.load.image('meteorBrown3', '/kenney_space-shooter-redux/PNG/Meteors/meteorBrown_small1.png');
    this.load.image('meteorGrey1', '/kenney_space-shooter-redux/PNG/Meteors/meteorGrey_big1.png');
    this.load.image('meteorGrey2', '/kenney_space-shooter-redux/PNG/Meteors/meteorGrey_med1.png');
    this.load.image('meteorGrey3', '/kenney_space-shooter-redux/PNG/Meteors/meteorGrey_small1.png');

    // Load UFOs (as player ships)
    this.load.image('ufoRed', '/kenney_space-shooter-redux/PNG/ufoRed.png');
    this.load.image('ufoGreen', '/kenney_space-shooter-redux/PNG/ufoGreen.png');
    this.load.image('ufoBlue', '/kenney_space-shooter-redux/PNG/ufoBlue.png');
    this.load.image('ufoYellow', '/kenney_space-shooter-redux/PNG/ufoYellow.png');

    // Load background
    this.load.image('background', '/assets/backgrounds/darkPurple.png');

    // Load audio
    this.load.audio('bgMusic', '/assets/audio/background-music.wav');
    this.load.audio('gameOverSound', '/assets/audio/game-over.wav');

    // Loading progress
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}
