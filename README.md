# Space Shooter Game

A fully functional space shooter game built with React, TypeScript, and Phaser.js. Inspired by classic arcade games like Space Invaders with modern visuals.

## Features

- **5 Progressive Levels** with increasing difficulty
- Level-specific backgrounds with unique planet configurations
- Cinematic intro animation with enemies flying in from above
- Atmospheric background music (Mountain Trails)
- Classic space shooter gameplay with balanced difficulty
- Enemy formations with AI movement patterns
- Player shooting mechanics with smooth, responsive controls
- Precise collision detection (one bullet = one enemy)
- Score tracking and resource management
- Multiple lives system with visual indicators
- Beautiful space backgrounds with planets and stars
- Spectacular particle explosion effects with smoke and debris
- Procedurally generated sound effects (laser shots, explosions, hits)
- Web Audio API powered audio system
- Game over and restart functionality
- Victory screen when all 5 levels are completed
- Level transition screens with "LEVEL X" announcements
- Smooth "READY?" transition before gameplay starts

## Game Assets

This game uses high-quality assets from Kenney:
- Space Shooter Redux pack
- Planets pack
- Space Shooter Extension pack

## Controls

- **Arrow Keys**: Move the spaceship (Up, Down, Left, Right)
- **Spacebar**: Shoot lasers
- **Spacebar (Game Over)**: Restart the game

## Gameplay

- Destroy enemy ships to earn points and resources
- Avoid enemy bullets and collisions
- You have 3 lives - lose them all and it's game over!
- Enemy ships move faster as you progress
- Score increases by 10 points for each enemy destroyed

## Installation

Install dependencies:
```bash
npm install
```

## Running the Game

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`

## Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── game/
│   ├── config.ts          # Phaser game configuration
│   ├── utils/
│   │   └── SoundGenerator.ts  # Web Audio API sound effects
│   ├── scenes/
│   │   ├── BootScene.ts   # Asset loading scene
│   │   └── GameScene.ts   # Main game logic (400+ lines)
├── components/
│   └── Game.tsx           # React wrapper component
└── App.tsx                # Main application component
```

## Technologies Used

- React 18
- TypeScript
- Phaser 3 (Game Engine)
- Web Audio API (Procedural sound effects)
- Phaser Audio System (Background music)
- Vite (Build Tool)

## Level System

The game features 5 progressive levels, each with increasing difficulty:

**Level 1:**
- 4 rows of enemies (32 total)
- Enemy speed: 0.3
- Enemy fire rate: 1500ms
- Background: Blue/Purple planets

**Level 2:**
- 5 rows of enemies (40 total)
- Enemy speed: 0.45
- Enemy fire rate: 1350ms
- Background: Multiple planets, different positions

**Level 3:**
- 6 rows of enemies (48 total)
- Enemy speed: 0.6
- Enemy fire rate: 1200ms
- Background: Dense planet field

**Level 4:**
- 6 rows of enemies (48 total)
- Enemy speed: 0.75
- Enemy fire rate: 1050ms
- Background: Large planets closer

**Level 5 (Final):**
- 6 rows of enemies (48 total)
- Enemy speed: 0.9
- Enemy fire rate: 900ms
- Background: Epic final background with multiple large planets

## Game Balance

The game has been carefully balanced for an enjoyable experience:
- Player movement speed: 200 pixels/second
- Player bullet speed: 350 pixels/second
- Enemy bullet speed: 180 pixels/second
- Fire rate: 250ms cooldown
- Sound effects volume: Balanced for non-intrusive gameplay
- Background music volume: 50% (energetic but not overwhelming)

## Audio

**Background Music:**
- Track: "Mountain Trails"
- Format: WAV (high quality)
- Volume: 50%
- Looping: Continuous during gameplay
- Auto-stop: Stops on game over

**Sound Effects:**
- Procedurally generated using Web Audio API
- Laser shots (player and enemy)
- Explosions with filter sweeps
- Hit damage feedback

## License

This game template is licensed under the MIT-0 License.
