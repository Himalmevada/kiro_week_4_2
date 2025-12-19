# Space Invaders Game - Kiro Project Structure

This directory contains all project specifications, design documents, implementation plans, and development guidelines for the Space Invaders Game.

## Directory Structure

```
.kiro/
├── specs/                          # Project specifications
│   └── space-invaders-game/
│       ├── requirements.md         # Feature requirements & acceptance criteria
│       ├── design.md              # System design & architecture
│       └── tasks.md               # Implementation plan & task list
├── steering/                       # Development guidelines & best practices
│   ├── project-standards.md       # Code style & conventions
│   ├── architecture-guide.md      # System architecture & patterns
│   └── gesture-recognition-guide.md # Gesture recognition implementation
├── settings/                       # Project configuration
│   └── project.json               # Project metadata & settings
└── README.md                       # This file
```

## Quick Start

### 1. Understanding the Project

Start by reading these documents in order:

1. **[README.md](../README.md)** - Project overview and features
2. **[requirements.md](specs/space-invaders-game/requirements.md)** - What the game should do
3. **[design.md](specs/space-invaders-game/design.md)** - How the game is built
4. **[tasks.md](specs/space-invaders-game/tasks.md)** - Implementation tasks

### 2. Development Setup

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open browser: `http://localhost:5173`

### 3. Following Development Guidelines

Before writing code, review:

1. **[project-standards.md](steering/project-standards.md)** - Code style and conventions
2. **[architecture-guide.md](steering/architecture-guide.md)** - System architecture
3. **[gesture-recognition-guide.md](steering/gesture-recognition-guide.md)** - Gesture implementation

## Document Overview

### Specifications

#### requirements.md
- **Purpose:** Define what the game should do
- **Content:** 10 requirements with user stories and acceptance criteria
- **Format:** EARS (Easy Approach to Requirements Syntax)
- **Use:** Reference when implementing features

#### design.md
- **Purpose:** Explain how the game is built
- **Content:** Architecture, components, data models, correctness properties
- **Sections:** Overview, Architecture, Components, Data Models, Properties, Error Handling, Testing
- **Use:** Understand system design before implementation

#### tasks.md
- **Purpose:** Break down implementation into manageable tasks
- **Content:** 39 core tasks + 25 optional testing tasks
- **Organization:** 15 phases from setup to final integration
- **Use:** Track progress and execute tasks incrementally

### Steering Guides

#### project-standards.md
- **Purpose:** Establish code quality standards
- **Content:** TypeScript conventions, React patterns, Phaser standards, naming conventions
- **Sections:** Code Style, Naming, Quality, Git Workflow, Browser Support, Performance, Accessibility
- **Use:** Reference when writing code

#### architecture-guide.md
- **Purpose:** Explain system architecture and design patterns
- **Content:** Component responsibilities, data flow, state management, communication patterns
- **Sections:** Architecture, Components, Data Flow, State Management, Extension Points, Performance, Testing
- **Use:** Understand how components interact

#### gesture-recognition-guide.md
- **Purpose:** Explain gesture recognition implementation
- **Content:** Hand pose detection, gesture algorithms, integration, debugging
- **Sections:** Basics, Implementation, Integration, Visualization, Troubleshooting, Optimization
- **Use:** Implement and debug gesture features

### Settings

#### project.json
- **Purpose:** Store project metadata and configuration
- **Content:** Project info, technologies, structure, metrics
- **Use:** Reference for project overview

## Key Concepts

### Requirements (10 Total)

1. **Core Gameplay** - Player ship, enemies, shooting, collision
2. **Progressive Levels** - 5 levels with increasing difficulty
3. **Gesture Recognition** - Hand pose detection and gesture controls
4. **Power-Up System** - Rapid Fire, Shield, Speed Boost
5. **Customization** - 16 ships, 8 lasers
6. **Audio System** - Procedural sound effects and background music
7. **UI & Menus** - Menu system, HUD, pause menu
8. **Collision Detection** - Physics and collision handling
9. **Hand Detection** - Hand landmark processing and gesture analysis
10. **State Management** - Scene transitions and game state

### Correctness Properties (12 Total)

Each property is a formal statement about what the system should do:

1. Enemy Destruction Consistency
2. Lives Reduction on Damage
3. Level Progression Trigger
4. Hand Detection Gesture Mapping
5. Palm State Finger Counting
6. Power-Up Activation Energy Deduction
7. Shield Damage Prevention
8. Speed Boost Movement Multiplier
9. Rapid Fire Rate Reduction
10. Game Over Condition
11. Gesture State Confidence Threshold
12. Audio Context Resume on Interaction

### Implementation Phases (15 Total)

1. Project Setup & Infrastructure
2. Menu System & Customization
3. Core Game Scene & Player Mechanics
4. Game Logic & Scoring
5. Power-Up System
6. Audio System
7. Gesture Recognition System
8. Gesture-Based Game Controls
9. Webcam Overlay & Visualization
10. UI & Game State Management
11. Gesture Control UI & Integration
12. Enemy AI & Firing
13. Level Transitions & Animations
14. Testing & Validation
15. Final Integration & Polish

## Development Workflow

### Before Starting a Task

1. Read the task description in `tasks.md`
2. Review related requirements in `requirements.md`
3. Check design details in `design.md`
4. Review relevant steering guide
5. Check project standards for code style

### While Implementing

1. Follow code style from `project-standards.md`
2. Follow architecture patterns from `architecture-guide.md`
3. Write tests as specified in task
4. Update HUD/UI as needed
5. Test in browser frequently

### After Completing a Task

1. Run linter: `npm run lint`
2. Run tests: `npm run test`
3. Test in browser: `npm run dev`
4. Check for console errors
5. Commit with descriptive message

## Testing Strategy

### Unit Tests
- Test individual game mechanics
- Test gesture recognition logic
- Test power-up calculations
- Target: 80%+ coverage

### Property-Based Tests
- Generate random game states
- Verify properties hold across variations
- Run 100+ iterations per property
- Use fast-check library

### Integration Tests
- Test scene transitions
- Test gesture controller with game
- Test audio playback
- Test pause/resume

## Performance Targets

- **Game FPS:** 60 FPS on modern devices
- **Gesture Detection:** 30 FPS minimum
- **Memory Usage:** < 100MB during gameplay
- **Load Time:** < 3 seconds initial load
- **Level Transition:** < 1 second

## Browser Support

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+ (limited gesture support)

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Phaser 3** - Game engine
- **TensorFlow.js** - Machine learning
- **MediaPipe Hands** - Hand pose detection
- **Web Audio API** - Procedural sound
- **Vite** - Build tool

## Common Tasks

### Adding a New Feature

1. Add requirement to `requirements.md`
2. Add design details to `design.md`
3. Add correctness property to `design.md`
4. Add tasks to `tasks.md`
5. Implement following standards
6. Write tests
7. Update documentation

### Debugging Gesture Recognition

1. Check `gesture-recognition-guide.md` troubleshooting section
2. Enable gesture overlay visualization
3. Check console for errors
4. Verify hand landmarks in console
5. Test with different lighting/hand positions

### Optimizing Performance

1. Profile with browser DevTools
2. Check `architecture-guide.md` optimization strategies
3. Use object pooling for frequently created objects
4. Optimize gesture detection frequency
5. Use WebGL renderer

### Adding a New Power-Up

1. Add to requirements
2. Add to design
3. Add state variables to GameScene
4. Implement activation method
5. Implement effect in update loop
6. Add UI display
7. Add keyboard/gesture activation
8. Write tests

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Resources

### External Documentation
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TensorFlow.js Documentation](https://js.tensorflow.org/)
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Game Assets
- [Kenney Space Invaders Redux](https://kenney.nl/assets/space-invaders-redux)
- [Kenney Planets](https://kenney.nl/assets/planets)
- [Kenney Space Invaders Extension](https://kenney.nl/assets/space-invaders-extension)

## Support and Questions

### Debugging
- Check browser console for errors
- Use browser DevTools for profiling
- Enable Phaser debug mode for physics visualization
- Check gesture overlay for hand detection issues

### Common Issues
- **Gesture not working:** Check camera permissions and lighting
- **Low FPS:** Disable gesture control or close other tabs
- **Audio not playing:** Check browser autoplay policies
- **Assets not loading:** Verify asset paths in BootScene

## Next Steps

1. Read `requirements.md` to understand features
2. Read `design.md` to understand architecture
3. Review `project-standards.md` for code style
4. Start with Phase 1 tasks in `tasks.md`
5. Follow development workflow for each task

---

**Last Updated:** December 2024
**Project Version:** 1.0.0
**Status:** In Development
