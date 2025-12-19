# Space Invaders Game - Design Document

## Overview

The Space Invaders Game is a modern arcade-style space invaders game that combines classic gameplay with AI-powered gesture recognition. The architecture is built on React for UI management, Phaser 3 for game engine capabilities, and TensorFlow.js with MediaPipe for hand pose detection. The system is designed to be modular, maintainable, and extensible, with clear separation between game logic, rendering, input handling, and AI systems.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Game Component (Game.tsx)               │   │
│  │  - Manages Phaser game instance                      │   │
│  │  - Handles gesture controller lifecycle              │   │
│  │  - Manages gesture toggle state                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Phaser Game     │ │ Hand Gesture     │ │ Webcam Overlay   │
│  Engine          │ │ Controller       │ │ Component        │
│                  │ │                  │ │                  │
│ - BootScene      │ │ - TensorFlow.js  │ │ - Real-time      │
│ - MenuScene      │ │ - MediaPipe      │ │   visualization  │
│ - GameScene      │ │ - Hand tracking  │ │ - Gesture state  │
│                  │ │ - Gesture state  │ │   display        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Data Flow

```
User Input (Keyboard/Gesture)
        │
        ▼
┌─────────────────────────────────┐
│  Input Processing Layer         │
│  - Keyboard handler             │
│  - Gesture state reader         │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Game Logic Layer               │
│  - Player movement              │
│  - Shooting mechanics           │
│  - Power-up system              │
│  - Enemy AI                     │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Physics & Collision Layer      │
│  - Arcade physics               │
│  - Overlap detection            │
│  - Damage calculation           │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Rendering Layer (Phaser)       │
│  - Sprite rendering             │
│  - Animation updates            │
│  - UI rendering                 │
└─────────────────────────────────┘
```

## Components and Interfaces

### Core Components

#### 1. Game Component (React)
- **File:** `src/components/Game.tsx`
- **Responsibility:** React wrapper for Phaser game, gesture controller lifecycle management
- **Key Methods:**
  - `toggleGestureControl()`: Initialize/cleanup gesture detection
  - `useEffect()`: Manage game and gesture controller lifecycle

#### 2. Phaser Game Configuration
- **File:** `src/game/config.ts`
- **Responsibility:** Phaser game configuration and scene setup
- **Properties:**
  - Resolution: 1400x900
  - Physics: Arcade (no gravity)
  - Scenes: BootScene → MenuScene → GameScene

#### 3. Boot Scene
- **File:** `src/game/scenes/BootScene.ts`
- **Responsibility:** Asset preloading with progress bar
- **Assets Loaded:**
  - 12 player ship variants
  - 8 laser variants
  - 8 enemy types
  - 4 planet types
  - 6 asteroid types
  - 4 UFO variants
  - Audio files

#### 4. Menu Scene
- **File:** `src/game/scenes/MenuScene.ts`
- **Responsibility:** Ship and laser selection with live preview
- **Features:**
  - 16 ship variants (3 classes × 4 colors + 4 UFOs)
  - 8 laser variants (4 blue + 4 red)
  - Arrow key navigation
  - Mouse click support
  - Animated UI elements

#### 5. Game Scene
- **File:** `src/game/scenes/GameScene.ts`
- **Responsibility:** Main game logic (2300+ lines)
- **Key Systems:**
  - Player movement and shooting
  - Enemy formation and AI
  - Collision detection
  - Power-up system
  - UI rendering
  - Audio management
  - Pause/resume functionality

#### 6. Hand Gesture Controller
- **File:** `src/game/utils/HandGestureController.ts`
- **Responsibility:** AI-powered hand pose detection and gesture recognition
- **Key Methods:**
  - `initialize()`: Load MediaPipe model and setup webcam
  - `startDetection()`: Begin hand tracking loop
  - `stopDetection()`: Stop hand tracking
  - `getGestureState()`: Return current gesture state
  - `cleanup()`: Release resources

#### 7. Sound Generator
- **File:** `src/game/utils/SoundGenerator.ts`
- **Responsibility:** Procedural audio generation using Web Audio API
- **Sound Effects:**
  - `playShootSound()`: Laser fire effect
  - `playExplosionSound()`: Multi-layer explosion
  - `playHitSound()`: Damage feedback
  - `playEnemyShootSound()`: Enemy laser variant

#### 8. Webcam Overlay Component
- **File:** `src/components/WebcamOverlay.tsx`
- **Responsibility:** Real-time hand tracking visualization
- **Features:**
  - Live video feed with mirror effect
  - Hand position indicator
  - Direction zones visualization
  - Gesture state display
  - Confidence scoring

### Key Interfaces

```typescript
// Gesture State Interface
interface GestureState {
  moveDirection: 'left' | 'right' | 'center';
  isPalmOpen: boolean;
  handHeight: 'high' | 'middle' | 'low';
  handX: number;           // 0-1 normalized
  handY: number;           // 0-1 normalized
  isHandDetected: boolean;
  confidence: number;      // 0-1
  fingersExtended: number; // 0-5
}

// Power-Up State
interface PowerUpState {
  rapidFireActive: boolean;
  rapidFireTimer: number;
  shieldActive: boolean;
  shieldTimer: number;
  speedBoostActive: boolean;
  speedBoostTimer: number;
}

// Game State
interface GameState {
  score: number;
  lives: number;
  resources: number;
  currentLevel: number;
  gameOver: boolean;
  isPaused: boolean;
}
```

## Data Models

### Player Ship
- **Position:** x, y coordinates
- **Velocity:** vx, vy (pixels per second)
- **Health:** 3 lives
- **Appearance:** Selected ship variant
- **Weapons:** Selected laser type
- **State:** Active, paused, dead

### Enemy
- **Position:** x, y coordinates
- **Velocity:** vx, vy (movement pattern)
- **Type:** 8 different enemy sprites
- **Health:** 1 hit to destroy
- **Behavior:** Formation movement, random firing
- **Reward:** 10 points + 1-3 energy

### Bullet
- **Position:** x, y coordinates
- **Velocity:** Fixed speed (350 px/s for player, 180 px/s for enemies)
- **Owner:** Player or Enemy
- **Lifetime:** Removed when off-screen

### Power-Up
- **Type:** Rapid Fire, Shield, Speed Boost
- **Duration:** 10s, 8s, 12s respectively
- **Cost:** 15⚡, 20⚡, 10⚡
- **Effect:** Modifies game parameters

### Level Configuration
```typescript
interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  enemySpeed: number;
  enemyFireDelay: number;
  planetConfiguration: PlanetConfig[];
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Enemy Destruction Consistency
*For any* enemy in the formation, when a player bullet collides with that enemy, the enemy shall be removed from the active enemies group and the player's score shall increase by exactly 10 points.

**Validates: Requirements 1.4**

### Property 2: Lives Reduction on Damage
*For any* player state with lives > 0, when an enemy bullet collides with the player and shield is not active, the lives count shall decrease by exactly 1 and the health bar shall update to reflect the new lives value.

**Validates: Requirements 1.5**

### Property 3: Level Progression Trigger
*For any* level, when all enemies in that level are destroyed and the level is less than 5, the system shall automatically advance to the next level with enemy speed increased by 0.15 and fire delay decreased by 150ms.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 4: Hand Detection Gesture Mapping
*For any* detected hand with normalized X position, if the hand X position is less than (0.5 - 0.15), the move direction shall be set to "left"; if greater than (0.5 + 0.15), the move direction shall be set to "right"; otherwise "center".

**Validates: Requirements 3.3, 3.4, 3.5**

### Property 5: Palm State Finger Counting
*For any* detected hand, the palm shall be considered open (isPalmOpen = true) if and only if the number of extended fingers is 3 or greater.

**Validates: Requirements 3.5, 3.6**

### Property 6: Power-Up Activation Energy Deduction
*For any* power-up activation request, if the player has sufficient energy (≥ cost), the power-up shall activate, the energy shall be reduced by exactly the cost amount, and the power-up timer shall be set to the specified duration.

**Validates: Requirements 4.2, 4.3, 4.4**

### Property 7: Shield Damage Prevention
*For any* collision between an enemy bullet and the player while shield is active, the collision shall not reduce lives and the shield timer shall continue counting down.

**Validates: Requirements 4.7, 6.2**

### Property 8: Speed Boost Movement Multiplier
*For any* player movement input while speed boost is active, the resulting velocity shall be 1.5 times the normal movement speed (300 px/s instead of 200 px/s).

**Validates: Requirements 4.8**

### Property 9: Rapid Fire Rate Reduction
*For any* bullet fired while rapid fire is active, the fire rate cooldown shall be 125ms instead of the normal 250ms.

**Validates: Requirements 4.5**

### Property 10: Game Over Condition
*For any* game state, when lives reach 0, the system shall set gameOver flag to true and display the game over screen with the current score.

**Validates: Requirements 1.6**

### Property 11: Gesture State Confidence Threshold
*For any* hand detection frame, if the confidence score is below 0.5, the system shall display a warning indicator in the gesture overlay.

**Validates: Requirements 3.10**

### Property 12: Audio Context Resume on Interaction
*For any* user interaction (click, key press) when audio context is in suspended state, the system shall resume the audio context to enable sound playback.

**Validates: Requirements 6.7**

## Error Handling

### Camera Permission Errors
- **Scenario:** User denies camera access
- **Handling:** Display alert message, disable gesture control button
- **Recovery:** User can retry by clicking button again

### Hand Detection Failures
- **Scenario:** MediaPipe model fails to load
- **Handling:** Log error to console, disable gesture features
- **Recovery:** Gesture control remains unavailable until page refresh

### Audio Context Errors
- **Scenario:** Web Audio API not supported
- **Handling:** Game continues without sound effects
- **Recovery:** Background music from audio file still plays if supported

### Physics Collision Errors
- **Scenario:** Collision detection misses or double-counts
- **Handling:** Validate collision state before applying damage
- **Recovery:** Retry collision check in next frame

### Memory Leaks
- **Scenario:** Off-screen bullets not cleaned up
- **Handling:** Actively remove bullets beyond world bounds
- **Recovery:** Periodic garbage collection

## Testing Strategy

### Unit Testing Approach
- Test individual game mechanics in isolation
- Test gesture recognition with mock hand data
- Test power-up activation and duration
- Test collision detection logic
- Test score and resource calculations

### Property-Based Testing Approach
- Use fast-check library for JavaScript
- Generate random game states and verify properties hold
- Test gesture recognition with varied hand positions
- Test power-up combinations and edge cases
- Run minimum 100 iterations per property test
- Each property test tagged with requirement reference

### Integration Testing
- Test scene transitions (Boot → Menu → Game)
- Test gesture controller lifecycle with game scene
- Test audio playback across different browsers
- Test pause/resume functionality
- Test level progression and difficulty scaling

### Test Coverage Goals
- Core game mechanics: 100% coverage
- Gesture recognition: 95% coverage
- Power-up system: 100% coverage
- Collision detection: 100% coverage
- Audio system: 80% coverage (browser-dependent)

## Performance Considerations

### Optimization Strategies
- **Object Pooling:** Reuse bullet and enemy objects instead of creating/destroying
- **Spatial Partitioning:** Use Phaser's built-in physics groups for efficient collision detection
- **Gesture Detection:** Run at 30 FPS instead of 60 FPS to reduce CPU load
- **Audio:** Use Web Audio API for procedural sounds (no file I/O)
- **Rendering:** Leverage Phaser's WebGL renderer for hardware acceleration

### Performance Targets
- Game FPS: 60 FPS on modern devices
- Gesture detection: 30 FPS minimum
- Memory usage: < 100MB
- Initial load time: < 3 seconds
- Level transition time: < 1 second

## Security Considerations

### Camera Access
- Request camera permission explicitly
- Only access camera when gesture control is enabled
- Stop camera stream when gesture control is disabled
- No recording or storage of video data

### Audio Context
- Resume audio context only on user interaction
- Respect browser autoplay policies
- No audio data transmission

### Game State
- Store only non-sensitive game data (score, level)
- No personal data collection
- No analytics or tracking

## Deployment Considerations

### Browser Compatibility
- Chrome/Edge: Full support (WebGL, Web Audio, MediaPipe)
- Firefox: Full support
- Safari: Partial support (may have WebGL limitations)
- Mobile browsers: Limited gesture support (camera access varies)

### Asset Optimization
- Compress PNG sprites
- Use WebP format where supported
- Lazy load non-critical assets
- Cache assets in service worker

### CDN Considerations
- Host MediaPipe model on CDN
- Cache Kenney assets
- Use gzip compression for JavaScript
