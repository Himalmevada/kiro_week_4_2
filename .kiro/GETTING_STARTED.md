# Getting Started with Space Shooter Game Development

Welcome to the Space Shooter Game project! This guide will help you get started with development using the `.kiro` project structure.

## What You're Building

A modern arcade-style space shooter game with:
- 5 progressive levels with increasing difficulty
- AI-powered hand gesture recognition for hands-free gameplay
- 16 customizable ships and 8 laser variants
- 3 power-up types (Rapid Fire, Shield, Speed Boost)
- Procedurally generated audio effects
- Real-time hand tracking visualization

## Project Structure Overview

```
Space Shooter Game/
├── .kiro/                          # Project management (YOU ARE HERE)
│   ├── specs/                      # Specifications & design
│   ├── steering/                   # Development guidelines
│   └── settings/                   # Project configuration
├── src/                            # Source code
│   ├── components/                 # React components
│   ├── game/                       # Phaser game logic
│   └── assets/                     # Game assets
├── README.md                       # Project overview
└── package.json                    # Dependencies
```

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173`

### 4. Test Gesture Control
- Click "🤖 Enable AI Gestures" button
- Grant camera permissions
- Move your hand left/right to steer
- Open your palm to shoot

## Understanding the Project (30 Minutes)

### Read These Files in Order

1. **[README.md](../README.md)** (5 min)
   - Project overview
   - Features and controls
   - Technologies used

2. **[.kiro/README.md](README.md)** (5 min)
   - .kiro folder guide
   - Document overview
   - Development workflow

3. **[specs/space-shooter-game/requirements.md](specs/space-shooter-game/requirements.md)** (10 min)
   - 10 requirements
   - What the game should do
   - Acceptance criteria

4. **[specs/space-shooter-game/design.md](specs/space-shooter-game/design.md)** (10 min)
   - System architecture
   - Components and interfaces
   - Correctness properties

## Development Workflow

### For Each Feature

1. **Find the Requirement**
   - Open `specs/space-shooter-game/requirements.md`
   - Find the requirement number
   - Read the user story and acceptance criteria

2. **Understand the Design**
   - Open `specs/space-shooter-game/design.md`
   - Find the related component
   - Review the data models and interfaces

3. **Find the Tasks**
   - Open `specs/space-shooter-game/tasks.md`
   - Find the related tasks
   - Understand task dependencies

4. **Review Standards**
   - Open `steering/project-standards.md`
   - Check code style for your language
   - Review naming conventions

5. **Implement**
   - Write code following standards
   - Write tests as specified
   - Test in browser

6. **Verify**
   - Run linter: `npm run lint`
   - Run tests: `npm run test`
   - Check browser console for errors

## Key Concepts

### Requirements (10 Total)
Each requirement has:
- User story (who, what, why)
- Acceptance criteria (how to verify)
- EARS format (structured language)

Example:
```
Requirement 1: Core Gameplay Mechanics
User Story: As a player, I want to control a spaceship and destroy enemy formations...
Acceptance Criteria:
1. WHEN the game starts THEN the system SHALL display a player ship...
2. WHEN the player presses arrow keys THEN the system SHALL move the ship...
```

### Correctness Properties (12 Total)
Formal statements about what the system should do:

Example:
```
Property 1: Enemy Destruction Consistency
For any enemy in the formation, when a player bullet collides with that enemy,
the enemy shall be removed and the player's score shall increase by exactly 10 points.
```

### Implementation Tasks (39 Core + 25 Optional)
Organized in 15 phases:

Example:
```
Phase 1: Project Setup
- [ ] 1. Initialize project structure and dependencies
- [ ] 2. Create Phaser game configuration and boot scene
```

## Common Development Tasks

### Adding a New Feature

1. Add requirement to `requirements.md`
2. Add design details to `design.md`
3. Add correctness property to `design.md`
4. Add tasks to `tasks.md`
5. Implement following standards
6. Write tests
7. Update documentation

### Debugging Gesture Recognition

1. Check `steering/gesture-recognition-guide.md`
2. Enable gesture overlay (already visible)
3. Check browser console for errors
4. Verify hand is visible in camera
5. Check lighting conditions
6. Test with different hand positions

### Optimizing Performance

1. Profile with browser DevTools (F12 → Performance)
2. Check `steering/architecture-guide.md` optimization section
3. Use object pooling for frequently created objects
4. Reduce gesture detection frequency if needed
5. Use WebGL renderer (already enabled)

### Writing Tests

1. Find test file for component
2. Write unit tests for specific cases
3. Write property-based tests for general rules
4. Run tests: `npm run test`
5. Check coverage: `npm run test:coverage`

## File Reference

### Specifications
| File | Purpose | Read Time |
|------|---------|-----------|
| `requirements.md` | What to build | 15 min |
| `design.md` | How to build it | 20 min |
| `tasks.md` | Implementation plan | 10 min |

### Steering Guides
| File | Purpose | Read Time |
|------|---------|-----------|
| `project-standards.md` | Code style & conventions | 15 min |
| `architecture-guide.md` | System architecture | 20 min |
| `gesture-recognition-guide.md` | Gesture implementation | 15 min |

### Configuration
| File | Purpose |
|------|---------|
| `project.json` | Project metadata |
| `README.md` | .kiro folder guide |
| `STRUCTURE.md` | Folder structure overview |

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run linter

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

## Browser DevTools Tips

### Performance Profiling
1. Open DevTools (F12)
2. Go to Performance tab
3. Click record
4. Play game for 10 seconds
5. Stop recording
6. Analyze FPS and memory

### Console Debugging
1. Open DevTools (F12)
2. Go to Console tab
3. Check for errors (red messages)
4. Check for warnings (yellow messages)
5. Use `console.log()` for debugging

### Network Debugging
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check asset loading times
5. Verify all assets load successfully

## Troubleshooting

### Game Won't Start
- Check browser console for errors (F12)
- Verify all assets loaded in Network tab
- Try clearing browser cache
- Try different browser

### Gesture Control Not Working
- Check camera permissions
- Verify hand is visible in webcam overlay
- Check lighting conditions
- Try moving hand closer/farther from camera
- Check browser console for errors

### Low FPS
- Close other browser tabs
- Disable gesture control if not needed
- Check browser DevTools Performance tab
- Update graphics drivers
- Try different browser

### Audio Not Playing
- Check browser volume
- Check browser autoplay policies
- Try clicking on game first
- Check browser console for errors
- Verify Web Audio API is supported

## Next Steps

### Immediate (Today)
1. ✅ Read this file
2. ✅ Install dependencies: `npm install`
3. ✅ Start dev server: `npm run dev`
4. ✅ Test the game in browser
5. ✅ Try gesture control

### Short Term (This Week)
1. Read `requirements.md`
2. Read `design.md`
3. Review `project-standards.md`
4. Review `architecture-guide.md`
5. Start Phase 1 tasks

### Medium Term (This Month)
1. Complete Phase 1-5 tasks
2. Implement core gameplay
3. Implement power-up system
4. Write unit tests
5. Write property-based tests

### Long Term (This Quarter)
1. Complete all 15 phases
2. Implement gesture recognition
3. Implement audio system
4. Complete all tests
5. Optimize performance

## Learning Resources

### Game Development
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 3 Examples](https://phaser.io/examples)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

### Web Technologies
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### AI & Machine Learning
- [TensorFlow.js Documentation](https://js.tensorflow.org/)
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)
- [Hand Pose Detection](https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection)

### Testing
- [Jest Documentation](https://jestjs.io/)
- [fast-check (Property Testing)](https://github.com/dubzzz/fast-check)
- [Testing Library](https://testing-library.com/)

## Getting Help

### Debugging
1. Check browser console (F12)
2. Check relevant steering guide
3. Check design document
4. Check requirements document
5. Search GitHub issues

### Questions
1. Check `.kiro/README.md` FAQ section
2. Check relevant steering guide
3. Check design document
4. Check requirements document
5. Ask in project discussions

### Issues
1. Check existing GitHub issues
2. Create new issue with:
   - Description of problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS info
   - Console errors

## Project Statistics

### Scope
- **Requirements:** 10
- **Acceptance Criteria:** 50+
- **Components:** 8
- **Correctness Properties:** 12
- **Implementation Tasks:** 39 core + 25 optional

### Timeline
- **Core Features:** 4-6 weeks
- **Comprehensive Testing:** 6-8 weeks
- **Total:** 2-3 months

### Code
- **Source Files:** 8 main files
- **Lines of Code:** ~2500 (game logic)
- **Test Coverage:** 80%+ target

### Performance
- **Game FPS:** 60 FPS target
- **Gesture Detection:** 30 FPS minimum
- **Memory Usage:** < 100MB
- **Load Time:** < 3 seconds

## Success Criteria

### Phase 1 Complete
- [ ] Project setup done
- [ ] Phaser game running
- [ ] Assets loading
- [ ] Menu scene working

### Phase 5 Complete
- [ ] Core gameplay working
- [ ] Scoring system working
- [ ] Power-ups working
- [ ] All 5 levels playable

### Phase 10 Complete
- [ ] Gesture recognition working
- [ ] Gesture controls integrated
- [ ] Webcam overlay working
- [ ] UI complete

### Final Complete
- [ ] All 15 phases done
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance targets met
- [ ] Browser compatibility verified

## Final Checklist

Before starting development:
- [ ] Read this file
- [ ] Read `README.md`
- [ ] Read `.kiro/README.md`
- [ ] Install dependencies
- [ ] Start dev server
- [ ] Test game in browser
- [ ] Test gesture control
- [ ] Read `requirements.md`
- [ ] Read `design.md`
- [ ] Review `project-standards.md`

You're ready to start development! 🚀

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Ready for Development
