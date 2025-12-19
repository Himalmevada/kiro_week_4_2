# Space Invaders Game - Requirements Document

## Introduction

The Space Invaders Game is a modern take on classic arcade space invaders games. Built with React, TypeScript, and Phaser.js, it combines traditional gameplay mechanics with cutting-edge AI gesture recognition technology. Players can control their spaceship using either keyboard controls or hand gestures detected via webcam, destroy enemy formations across 5 progressive levels, collect resources to activate power-ups, and compete for high scores. The game features customizable ships and lasers, procedurally generated audio, and a balanced difficulty curve that increases engagement throughout the gameplay experience.

## Glossary

- **Player Ship**: The user-controlled spaceship that can move and shoot lasers
- **Enemy Formation**: A grid of enemy ships that move in coordinated patterns and fire at the player
- **Gesture Recognition**: AI-powered hand pose detection using TensorFlow.js and MediaPipe
- **Power-Up**: Temporary gameplay enhancement (Rapid Fire, Shield, Speed Boost) activated by spending energy resources
- **Energy (⚡)**: In-game currency earned by destroying enemies, used to activate power-ups
- **Level**: A game stage with increasing difficulty, enemy count, and speed
- **Collision Detection**: Physics-based system that determines when bullets hit targets or enemies hit the player
- **Hand Landmarks**: 21 key points on a detected hand used for gesture analysis
- **Dead Zone**: Center area of the screen where hand movement doesn't trigger steering to prevent accidental input
- **Confidence Score**: Numerical value (0-1) indicating the reliability of hand detection

## Requirements

### Requirement 1: Core Gameplay Mechanics

**User Story:** As a player, I want to control a spaceship and destroy enemy formations, so that I can engage in classic arcade-style gameplay with modern visuals.

#### Acceptance Criteria

1. WHEN the game starts THEN the system SHALL display a player ship at the bottom center of the screen with 3 lives
2. WHEN the player presses arrow keys THEN the system SHALL move the ship left, right, up, or down at 200 pixels per second
3. WHEN the player presses spacebar THEN the system SHALL fire a laser from the ship's center at 350 pixels per second
4. WHEN a laser collides with an enemy THEN the system SHALL destroy the enemy and award 10 points
5. WHEN an enemy laser collides with the player THEN the system SHALL reduce lives by 1 and display updated health bar
6. WHEN lives reach 0 THEN the system SHALL display game over screen with final score

### Requirement 2: Progressive Level System

**User Story:** As a player, I want to progress through increasingly difficult levels, so that the game maintains challenge and engagement throughout gameplay.

#### Acceptance Criteria

1. WHEN the game starts THEN the system SHALL load Level 1 with 4 rows of 8 enemies (32 total)
2. WHEN all enemies in a level are destroyed THEN the system SHALL advance to the next level with increased difficulty
3. WHEN advancing to a new level THEN the system SHALL increase enemy speed by 0.15 pixels per second
4. WHEN advancing to a new level THEN the system SHALL decrease enemy fire delay by 150 milliseconds
5. WHEN the player completes Level 5 THEN the system SHALL display victory screen with final statistics
6. WHILE a level is loading THEN the system SHALL display "LEVEL X" and "READY?" animations before gameplay begins

### Requirement 3: AI Gesture Recognition System

**User Story:** As a player, I want to control my spaceship using hand gestures detected by my webcam, so that I can play hands-free without a keyboard.

#### Acceptance Criteria

1. WHEN the player clicks "Enable AI Gestures" button THEN the system SHALL request camera permissions and initialize hand detection
2. WHEN a hand is detected THEN the system SHALL display real-time hand tracking visualization in the top-right corner
3. WHEN the player moves their hand left of center THEN the system SHALL move the ship left (accounting for mirror view)
4. WHEN the player moves their hand right of center THEN the system SHALL move the ship right (accounting for mirror view)
5. WHEN the player opens their palm (3+ fingers extended) THEN the system SHALL fire lasers continuously
6. WHEN the player closes their fist (fewer than 3 fingers) THEN the system SHALL stop firing lasers
7. WHEN the player shows 1 finger THEN the system SHALL activate Rapid Fire power-up if sufficient energy exists
8. WHEN the player shows 2 fingers THEN the system SHALL activate Shield power-up if sufficient energy exists
9. WHEN the player shows 3 fingers THEN the system SHALL activate Speed Boost power-up if sufficient energy exists
10. WHEN hand detection confidence drops below threshold THEN the system SHALL display warning in overlay

### Requirement 4: Power-Up System

**User Story:** As a player, I want to collect energy resources and activate temporary power-ups, so that I can enhance my abilities during challenging moments.

#### Acceptance Criteria

1. WHEN an enemy is destroyed THEN the system SHALL award 1-3 energy resources randomly
2. WHEN the player presses key 1 and has 15+ energy THEN the system SHALL activate Rapid Fire for 10 seconds and deduct 15 energy
3. WHEN the player presses key 2 and has 20+ energy THEN the system SHALL activate Shield for 8 seconds and deduct 20 energy
4. WHEN the player presses key 3 and has 10+ energy THEN the system SHALL activate Speed Boost for 12 seconds and deduct 10 energy
5. WHILE Rapid Fire is active THEN the system SHALL reduce fire rate cooldown from 250ms to 125ms
6. WHILE Shield is active THEN the system SHALL prevent damage from enemy lasers and display shield graphics around ship
7. WHILE Speed Boost is active THEN the system SHALL increase movement speed from 200 px/s to 300 px/s
8. WHEN a power-up duration expires THEN the system SHALL deactivate the power-up and restore normal values

### Requirement 5: Ship and Laser Customization

**User Story:** As a player, I want to customize my ship and laser appearance before starting the game, so that I can personalize my gameplay experience.

#### Acceptance Criteria

1. WHEN the game loads THEN the system SHALL display menu scene with ship and laser selection panels
2. WHEN the player presses up/down arrows THEN the system SHALL cycle through 16 available ship variants with live preview
3. WHEN the player presses left/right arrows THEN the system SHALL cycle through 8 available laser variants with live preview
4. WHEN the player selects a ship THEN the system SHALL display ship name and class (Scout, Fighter, Interceptor, UFO)
5. WHEN the player selects a laser THEN the system SHALL display laser name and color variant
6. WHEN the player presses spacebar or clicks start button THEN the system SHALL start game with selected ship and laser

### Requirement 6: Audio System

**User Story:** As a player, I want to hear immersive sound effects and background music, so that the game provides engaging audio feedback for all actions.

#### Acceptance Criteria

1. WHEN the game starts THEN the system SHALL play background music at 50% volume in a continuous loop
2. WHEN the player fires a laser THEN the system SHALL play laser sound effect (frequency sweep 900Hz to 400Hz)
3. WHEN an enemy is destroyed THEN the system SHALL play explosion sound with multi-layer synthesis
4. WHEN the player takes damage THEN the system SHALL play hit feedback sound (square wave decay)
5. WHEN an enemy fires THEN the system SHALL play enemy laser sound (triangle wave variant)
6. WHEN the game ends THEN the system SHALL stop background music with fade-out effect
7. WHEN the browser autoplay policy blocks audio THEN the system SHALL resume audio context on first user interaction

### Requirement 7: User Interface and Menus

**User Story:** As a player, I want intuitive menus and clear visual feedback, so that I can easily navigate the game and understand my current status.

#### Acceptance Criteria

1. WHEN the game loads THEN the system SHALL display main menu with animated title and control instructions
2. WHEN the player is in game THEN the system SHALL display HUD with health bar, lives, level, energy, and score
3. WHEN the player presses ESC THEN the system SHALL display pause menu with Resume, Restart, and Main Menu options
4. WHEN the player resumes from pause THEN the system SHALL continue gameplay from the paused state
5. WHEN the game ends THEN the system SHALL display game over screen with final score and restart option
6. WHEN the player completes all levels THEN the system SHALL display victory screen with completion statistics

### Requirement 8: Collision and Physics System

**User Story:** As a player, I want accurate collision detection and physics, so that the game feels responsive and fair.

#### Acceptance Criteria

1. WHEN a player laser collides with an enemy THEN the system SHALL immediately destroy the enemy and remove the laser
2. WHEN an enemy laser collides with the player THEN the system SHALL reduce lives unless shield is active
3. WHEN the player collides with an enemy ship THEN the system SHALL reduce lives unless shield is active
4. WHEN the player moves THEN the system SHALL keep the ship within world bounds (1400x900 viewport)
5. WHEN a bullet travels off-screen THEN the system SHALL remove it from memory to prevent memory leaks
6. WHEN shield is active THEN the system SHALL prevent all collision damage and display shield visual effect

### Requirement 9: Hand Gesture Detection and Calibration

**User Story:** As a player using gesture controls, I want accurate hand detection with visual feedback, so that I can trust the gesture recognition system.

#### Acceptance Criteria

1. WHEN hand detection initializes THEN the system SHALL load MediaPipe Hands model and set up WebGL backend
2. WHEN a hand is detected THEN the system SHALL extract 21 hand landmarks and calculate palm center position
3. WHEN the player's hand is in the left zone (beyond 15% dead zone) THEN the system SHALL set move direction to "left"
4. WHEN the player's hand is in the right zone (beyond 15% dead zone) THEN the system SHALL set move direction to "right"
5. WHEN the player's hand is in center zone (within 15% dead zone) THEN the system SHALL set move direction to "center"
6. WHEN fingers are counted THEN the system SHALL analyze each finger's extension state independently
7. WHEN hand detection confidence is high (>0.7) THEN the system SHALL display green indicator in overlay
8. WHEN hand detection confidence is low (<0.5) THEN the system SHALL display red indicator and warning message

### Requirement 10: Game State Management

**User Story:** As a player, I want the game to properly manage state across scenes and handle transitions smoothly, so that the experience feels polished and responsive.

#### Acceptance Criteria

1. WHEN the game initializes THEN the system SHALL load all assets in BootScene with progress bar
2. WHEN assets finish loading THEN the system SHALL transition to MenuScene
3. WHEN the player starts game THEN the system SHALL transition to GameScene with selected customizations
4. WHEN the player pauses THEN the system SHALL freeze all game logic and display pause menu
5. WHEN the player resumes THEN the system SHALL resume all game logic from paused state
6. WHEN the player restarts THEN the system SHALL reset all game variables and return to MenuScene
7. WHEN the player returns to menu THEN the system SHALL clean up all game resources and reset gesture controller
