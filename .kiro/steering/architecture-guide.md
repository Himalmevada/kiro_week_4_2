# Space Shooter Game - Architecture Guide

## System Architecture Overview

The Space Shooter Game follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  React Components (Game.tsx, WebcamOverlay.tsx)             │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Game Engine Layer                         │
│  Phaser 3 (Scenes, Physics, Rendering)                      │
│  - BootScene (Asset Loading)                                │
│  - MenuScene (UI & Selection)                               │
│  - GameScene (Core Logic)                                   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Game Logic Layer                          │
│  - Player Movement & Shooting                               │
│  - Enemy AI & Behavior                                      │
│  - Collision Detection                                      │
│  - Power-Up System                                          │
│  - Score & Resource Management                             │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Utility Layer                             │
│  - HandGestureController (AI Hand Detection)                │
│  - SoundGenerator (Web Audio API)                           │
│  - Physics & Collision Helpers                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### React Layer (src/components/)

#### Game.tsx
**Purpose:** React wrapper for Phaser game and gesture controller

**Responsibilities:**
- Initialize Phaser game instance
- Manage gesture controller lifecycle
- Handle gesture toggle button
- Manage camera permissions
- Display webcam overlay
- Handle errors gracefully

**Key State:**
- `isGestureEnabled`: Boolean for gesture control state
- `isInitializing`: Boolean for initialization loading state

**Key Methods:**
- `toggleGestureControl()`: Initialize or cleanup gesture detection
- `useEffect()`: Manage component lifecycle

#### WebcamOverlay.tsx
**Purpose:** Real-time visualization of hand tracking

**Responsibilities:**
- Display live video feed
- Draw hand position indicator
- Draw direction zones
- Display gesture state information
- Show confidence scores
- Mirror video for user perspective

**Key Props:**
- `gestureController`: HandGestureController instance
- `isEnabled`: Boolean for visibility

**Key Methods:**
- `drawHandTracking()`: Render hand visualization
- `drawArrow()`: Draw direction indicators

### Phaser Layer (src/game/)

#### config.ts
**Purpose:** Phaser game configuration

**Responsibilities:**
- Define game resolution (1400x900)
- Configure physics (Arcade, no gravity)
- Register scenes (Boot → Menu → Game)
- Set rendering options

#### BootScene.ts
**Purpose:** Asset preloading

**Responsibilities:**
- Load all sprite assets
- Load audio files
- Display loading progress
- Transition to MenuScene

**Key Methods:**
- `preload()`: Load all assets
- `create()`: Transition to next scene

#### MenuScene.ts
**Purpose:** Ship and laser selection

**Responsibilities:**
- Display 16 ship variants
- Display 8 laser variants
- Handle keyboard navigation
- Handle mouse clicks
- Display instructions
- Animate UI elements

**Key Methods:**
- `changeShip(direction)`: Cycle through ships
- `changeLaser(direction)`: Cycle through lasers
- `startGame()`: Begin gameplay
- `createStarfield()`: Generate background

#### GameScene.ts
**Purpose:** Main game logic (2300+ lines)

**Responsibilities:**
- Player movement and shooting
- Enemy formation and AI
- Collision detection
- Power-up system
- Score and resource management
- UI rendering
- Audio management
- Pause/resume functionality

**Key Methods:**
- `create()`: Initialize game
- `update()`: Game loop
- `fireBullet()`: Player shooting
- `createEnemyFormation()`: Enemy setup
- `hitEnemy()`: Enemy destruction
- `hitPlayer()`: Player damage
- `activateRapidFire()`: Power-up activation
- `nextLevel()`: Level progression

### Utility Layer (src/game/utils/)

#### HandGestureController.ts
**Purpose:** AI-powered hand pose detection

**Responsibilities:**
- Initialize TensorFlow.js and MediaPipe
- Manage webcam stream
- Detect hand landmarks
- Calculate gesture state
- Provide gesture data to game

**Key Methods:**
- `initialize()`: Load model and setup webcam
- `startDetection()`: Begin hand tracking
- `stopDetection()`: Stop hand tracking
- `getGestureState()`: Return current gesture
- `cleanup()`: Release resources

**Key Properties:**
- `detector`: MediaPipe hand detector
- `video`: Webcam video element
- `currentGesture`: Current gesture state

#### SoundGenerator.ts
**Purpose:** Procedural audio generation

**Responsibilities:**
- Generate sound effects using Web Audio API
- Manage audio context
- Create various sound types
- Handle browser autoplay policies

**Key Methods:**
- `playShootSound()`: Laser fire effect
- `playExplosionSound()`: Enemy destruction
- `playHitSound()`: Player damage
- `playEnemyShootSound()`: Enemy laser

## Data Flow Patterns

### Input Processing Flow
```
User Input (Keyboard/Gesture)
    ↓
Input Handler (Keyboard or Gesture)
    ↓
Game Logic (Movement, Shooting)
    ↓
Physics Update (Velocity, Position)
    ↓
Collision Detection
    ↓
Game State Update (Score, Lives)
    ↓
Rendering (Phaser)
```

### Gesture Recognition Flow
```
Webcam Stream
    ↓
MediaPipe Hand Detection
    ↓
Hand Landmark Extraction (21 points)
    ↓
Gesture Analysis (Direction, Palm, Fingers)
    ↓
Gesture State Update
    ↓
Game Logic Application
    ↓
Visual Feedback (Overlay)
```

### Collision Detection Flow
```
Physics Update
    ↓
Overlap Check (Arcade Physics)
    ↓
Collision Callback
    ↓
Damage Calculation
    ↓
Game State Update
    ↓
Audio Feedback
    ↓
Visual Feedback
```

## State Management

### Game State
```typescript
interface GameState {
  score: number;           // Player score
  lives: number;           // Remaining lives (0-3)
  resources: number;       // Energy resources
  currentLevel: number;    // Current level (1-5)
  gameOver: boolean;       // Game over flag
  isPaused: boolean;       // Pause state
}
```

### Player State
```typescript
interface PlayerState {
  x: number;              // X position
  y: number;              // Y position
  vx: number;             // X velocity
  vy: number;             // Y velocity
  health: number;         // Lives remaining
  selectedShip: string;   // Ship variant key
  selectedLaser: string;  // Laser variant key
}
```

### Gesture State
```typescript
interface GestureState {
  moveDirection: 'left' | 'right' | 'center';
  isPalmOpen: boolean;
  handHeight: 'high' | 'middle' | 'low';
  handX: number;          // 0-1 normalized
  handY: number;          // 0-1 normalized
  isHandDetected: boolean;
  confidence: number;     // 0-1
  fingersExtended: number; // 0-5
}
```

### Power-Up State
```typescript
interface PowerUpState {
  rapidFireActive: boolean;
  rapidFireTimer: number;
  shieldActive: boolean;
  shieldTimer: number;
  speedBoostActive: boolean;
  speedBoostTimer: number;
}
```

## Communication Patterns

### React to Phaser
- Use Phaser registry to pass data
- Store gesture controller in registry
- Store gesture enabled flag in registry
- Store selected ship/laser in registry

### Phaser to React
- Use React state for UI updates
- Use callbacks for user interactions
- Use event emitters for game events

### Gesture Controller to Game
- Poll gesture state in game update loop
- Apply gesture input to player movement
- Apply gesture input to shooting
- Apply gesture input to power-ups

## Extension Points

### Adding New Power-Ups
1. Add power-up state variable to GameScene
2. Implement activation method
3. Implement effect application in update loop
4. Implement deactivation logic
5. Add UI display
6. Add keyboard/gesture activation

### Adding New Enemy Types
1. Add sprite asset to BootScene
2. Create enemy variant in enemy group
3. Implement unique behavior in update loop
4. Adjust difficulty scaling
5. Test collision detection

### Adding New Levels
1. Add level configuration to GameScene
2. Create planet configuration
3. Adjust enemy count and speed
4. Implement level-specific challenges
5. Add level transition animation

### Adding New Gestures
1. Implement gesture detection in HandGestureController
2. Add gesture state property
3. Apply gesture in GameScene update loop
4. Add visual feedback in WebcamOverlay
5. Test gesture recognition accuracy

## Performance Optimization Strategies

### Object Pooling
- Reuse bullet objects instead of creating/destroying
- Reuse enemy objects for new levels
- Reuse particle effects

### Spatial Partitioning
- Use Phaser physics groups for efficient collision detection
- Leverage built-in spatial hashing

### Gesture Detection Optimization
- Run at 30 FPS instead of 60 FPS
- Use WebGL backend for TensorFlow.js
- Cache hand landmarks between frames

### Rendering Optimization
- Use WebGL renderer (hardware acceleration)
- Batch sprite rendering
- Use texture atlases for sprites

### Memory Management
- Clean up off-screen objects
- Dispose of unused resources
- Avoid memory leaks in event listeners

## Testing Strategy

### Unit Testing
- Test individual game mechanics
- Test gesture recognition logic
- Test power-up calculations
- Test collision detection
- Test score calculations

### Integration Testing
- Test scene transitions
- Test gesture controller with game
- Test audio playback
- Test pause/resume
- Test level progression

### Property-Based Testing
- Generate random game states
- Verify properties hold across variations
- Test gesture recognition with varied inputs
- Test power-up combinations
- Run 100+ iterations per property

### Performance Testing
- Profile FPS during gameplay
- Measure memory usage
- Measure gesture detection latency
- Test on multiple browsers
- Test on mobile devices

## Debugging Tips

### Console Logging
- Log gesture state for debugging hand detection
- Log collision events for physics debugging
- Log state changes for game logic debugging
- Use console.time() for performance profiling

### Browser DevTools
- Use Performance tab to profile FPS
- Use Memory tab to check for leaks
- Use Network tab to verify asset loading
- Use Console for error messages

### Phaser Debug Mode
- Enable physics debug rendering
- Enable collision visualization
- Enable sprite bounds visualization

### Gesture Debugging
- Check confidence scores in overlay
- Verify hand landmarks in console
- Test with different lighting conditions
- Test with different hand positions

## Deployment Considerations

### Build Optimization
- Minify JavaScript and CSS
- Compress images (PNG → WebP)
- Tree-shake unused code
- Use code splitting for scenes

### Asset Optimization
- Compress sprite sheets
- Use appropriate image formats
- Cache assets in service worker
- Use CDN for large files

### Browser Compatibility
- Test on Chrome, Firefox, Safari, Edge
- Verify WebGL support
- Check Web Audio API support
- Test gesture on mobile browsers

### Performance Monitoring
- Monitor FPS in production
- Track error rates
- Monitor memory usage
- Track gesture detection accuracy
