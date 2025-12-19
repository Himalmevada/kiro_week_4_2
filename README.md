# Space Shooter Game

A fully functional space shooter game built with React, TypeScript, and Phaser.js. Inspired by classic arcade games like Space Invaders with modern visuals and cutting-edge AI gesture recognition for hands-free gameplay.

## 🎮 Features

### Core Gameplay
- **5 Progressive Levels** with increasing difficulty and unique visual themes
- **Level-specific backgrounds** with unique planet configurations
- **Cinematic intro animation** with enemies flying in from above
- **Atmospheric background music** (Mountain Trails)
- **Classic space shooter gameplay** with balanced difficulty
- **Enemy formations** with AI movement patterns
- **Smooth, responsive controls** with keyboard and gesture support
- **Precise collision detection** (one bullet = one enemy)
- **Score tracking** and resource management system
- **Multiple lives system** with visual health indicators
- **Beautiful space backgrounds** with planets and stars
- **Spectacular explosion effects** with visual feedback
- **Game over and restart** functionality
- **Victory screen** when all 5 levels are completed

### AI Gesture Recognition (🤖 NEW!)
- **Hand Pose Detection** using TensorFlow.js and MediaPipe
- **Real-time hand tracking** with visual overlay
- **Gesture-based controls:**
  - Move hand **LEFT/RIGHT** to steer the ship
  - **OPEN PALM** to shoot lasers
  - **CLOSE FIST** to stop shooting
- **Finger counting** for power-up activation:
  - **1 finger** = Rapid Fire power-up
  - **2 fingers** = Shield power-up
  - **3 fingers** = Speed Boost power-up
- **Live gesture visualization** with hand position tracking
- **Confidence scoring** for gesture detection
- **Dead zone detection** to prevent accidental steering
- **Webcam overlay** showing real-time hand tracking

### Power-Up System
- **Rapid Fire** (Cost: 15⚡) - Increases fire rate for 10 seconds
- **Shield** (Cost: 20⚡) - Protects from damage for 8 seconds
- **Speed Boost** (Cost: 10⚡) - Increases movement speed for 12 seconds
- **Keyboard activation:** Press 1, 2, or 3 keys
- **Gesture activation:** Show 1, 2, or 3 fingers

### Customization
- **16 Ship Variants** to choose from:
  - Scout, Fighter, and Interceptor classes
  - Blue, Green, Orange, and Red color options
  - UFO variants for unique gameplay
- **8 Laser Types** with different visual styles:
  - Blue and Red laser variants
  - Different beam patterns and effects
- **Menu-based selection** with live preview

### Audio System
- **Procedurally generated sound effects** using Web Audio API
- **Laser shots** (player and enemy variants)
- **Explosions** with multi-layer synthesis
- **Hit feedback** sounds
- **Background music** with atmospheric ambience
- **Volume balancing** for immersive gameplay

## 🎯 Game Assets

This game uses high-quality assets from Kenney:
- Space Shooter Redux pack
- Planets pack
- Space Shooter Extension pack

## 🕹️ Controls

### Keyboard Controls
- **Arrow Keys**: Move the spaceship (Up, Down, Left, Right)
- **Spacebar**: Shoot lasers
- **1/2/3 Keys**: Activate power-ups (Rapid Fire, Shield, Speed Boost)
- **ESC**: Pause/Resume game
- **↑↓ Arrows (Menu)**: Select ship
- **←→ Arrows (Menu)**: Select laser type

### Gesture Controls (AI-Powered)
1. Click **"🤖 Enable AI Gestures"** button in top-left
2. Grant camera permissions when prompted
3. **Move hand LEFT/RIGHT** to steer
4. **Open palm** to shoot
5. **Show fingers** (1-3) to activate power-ups
6. Watch the **webcam overlay** for real-time feedback

## 🎮 Gameplay

- Destroy enemy ships to earn points and resources (⚡)
- Avoid enemy bullets and collisions
- You have 3 lives - lose them all and it's game over!
- Enemy ships move faster as you progress through levels
- Score increases by 10 points for each enemy destroyed
- Collect energy (⚡) to activate power-ups
- Survive all 5 levels to achieve victory

## 📦 Installation

Install dependencies:
```bash
npm install
```

## 🚀 Running the Game

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`

### Browser Requirements
- Modern browser with WebGL support (for TensorFlow.js)
- Webcam access (for gesture recognition)
- JavaScript enabled

## 🏗️ Building for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── game/
│   ├── config.ts                    # Phaser game configuration
│   ├── utils/
│   │   ├── HandGestureController.ts # AI hand pose detection & gesture recognition
│   │   └── SoundGenerator.ts        # Web Audio API sound effects
│   ├── scenes/
│   │   ├── BootScene.ts             # Asset loading scene
│   │   ├── MenuScene.ts             # Main menu with ship/laser selection
│   │   └── GameScene.ts             # Main game logic (2300+ lines)
├── components/
│   ├── Game.tsx                     # React wrapper with gesture control
│   └── WebcamOverlay.tsx            # Real-time hand tracking visualization
└── App.tsx                          # Main application component
```

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Phaser 3** - Game engine
- **TensorFlow.js** - Machine learning framework
- **MediaPipe Hands** - Hand pose detection model
- **Web Audio API** - Procedural sound effects
- **Vite** - Build tool and dev server
- **AWS Amplify** - Backend infrastructure (optional)

## 📊 Level System

The game features 5 progressive levels, each with increasing difficulty:

| Level | Rows | Enemies | Speed | Fire Rate | Background |
|-------|------|---------|-------|-----------|------------|
| 1 | 4 | 32 | 0.30 | 1500ms | Blue/Purple planets |
| 2 | 5 | 40 | 0.45 | 1350ms | Multiple planets |
| 3 | 6 | 48 | 0.60 | 1200ms | Dense planet field |
| 4 | 6 | 48 | 0.75 | 1050ms | Large planets |
| 5 | 6 | 48 | 0.90 | 900ms | Epic final scene |

## ⚖️ Game Balance

The game has been carefully balanced for an enjoyable experience:
- **Player movement speed:** 200 px/s (300 px/s with Speed Boost)
- **Player bullet speed:** 350 px/s
- **Enemy bullet speed:** 180 px/s
- **Fire rate:** 250ms cooldown (125ms with Rapid Fire)
- **Shield duration:** 8 seconds
- **Rapid Fire duration:** 10 seconds
- **Speed Boost duration:** 12 seconds

## 🎵 Audio System

### Background Music
- **Track:** Mountain Trails
- **Format:** WAV (high quality)
- **Volume:** 50%
- **Looping:** Continuous during gameplay
- **Auto-stop:** Stops on game over

### Sound Effects
- **Laser shots** - Frequency sweep from 900Hz to 400Hz
- **Explosions** - Multi-layer synthesis with filter sweeps
- **Hit feedback** - Square wave with exponential decay
- **Enemy shots** - Triangle wave variant
- **All effects:** Procedurally generated in real-time

## 🤖 AI Hand Gesture Recognition

### How It Works
1. **Hand Detection:** Uses MediaPipe Hands model to detect hand landmarks
2. **Gesture Recognition:** Analyzes hand position and finger extension
3. **Real-time Processing:** Runs at 30+ FPS for smooth gameplay
4. **Visual Feedback:** Shows hand position and gesture state in overlay

### Gesture States
- **Hand Position:** Normalized X/Y coordinates (0-1 range)
- **Move Direction:** Left, Right, or Center (with dead zone)
- **Palm State:** Open (3+ fingers) or Closed (fist)
- **Hand Height:** High, Middle, or Low
- **Finger Count:** 0-5 extended fingers
- **Confidence Score:** 0-1 detection confidence

### Technical Details
- **Model:** MediaPipe Hands (Full model)
- **Backend:** WebGL (TensorFlow.js)
- **Input:** 640x480 video stream
- **Output:** 21 hand landmarks per hand
- **Max hands:** 1 (single-hand control)

## 🎨 Menu System

### Main Menu Features
- **Ship Selection:** 16 variants with live preview
- **Laser Selection:** 8 types with visual preview
- **Keyboard Navigation:** Arrow keys to select
- **Mouse Support:** Click to select or start
- **Animated UI:** Smooth transitions and effects
- **Instructions:** Built-in control guide

## 🏆 Game States

- **Boot Scene:** Asset loading with progress bar
- **Menu Scene:** Ship/laser selection and instructions
- **Game Scene:** Main gameplay with all mechanics
- **Pause Menu:** Resume, Restart, or Main Menu options
- **Game Over:** Score display and restart option
- **Victory Screen:** Completion message and stats

## 🐛 Troubleshooting

### Gesture Control Not Working
- Ensure camera permissions are granted
- Check browser console for errors
- Verify WebGL support in your browser
- Try a different browser (Chrome/Firefox recommended)

### Audio Issues
- Check browser volume settings
- Ensure Web Audio API is supported
- Try refreshing the page
- Check browser autoplay policies

### Performance Issues
- Disable gesture control if experiencing lag
- Close other browser tabs
- Update your graphics drivers
- Try a different browser

## 📝 License

This game template is licensed under the MIT-0 License.

## 🙏 Credits

- **Game Assets:** Kenney (kenney.nl)
- **Game Engine:** Phaser (phaser.io)
- **Hand Detection:** MediaPipe (google.com/mediapipe)
- **ML Framework:** TensorFlow.js (tensorflow.org/js)
- **Audio:** Web Audio API (MDN)
