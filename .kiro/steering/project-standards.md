# Space Invaders Game - Project Standards and Guidelines

## Code Style and Conventions

### TypeScript Standards
- Use strict mode: `"strict": true` in tsconfig.json
- Use explicit type annotations for function parameters and return types
- Avoid `any` type; use `unknown` if necessary and narrow the type
- Use interfaces for object shapes, types for unions and primitives
- Use `const` by default, `let` only when reassignment is needed
- Use arrow functions for callbacks and short functions
- Use PascalCase for class and interface names
- Use camelCase for variable and function names
- Use UPPER_SNAKE_CASE for constants

### React Component Standards
- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components focused and single-responsibility
- Extract complex logic into custom hooks
- Use React.FC<Props> for component typing
- Memoize expensive computations with useMemo
- Use useCallback for event handlers passed to children

### Phaser Scene Standards
- Extend Phaser.Scene for all game scenes
- Use scene key as string identifier
- Initialize all properties in constructor or create()
- Use private for internal properties
- Use public for properties accessed by other scenes
- Use descriptive method names (createEnemyFormation, updatePlayerMovement)
- Keep scene files under 2000 lines (split if larger)

### File Organization
```
src/
├── components/          # React components
│   ├── Game.tsx        # Main game wrapper
│   └── WebcamOverlay.tsx # Gesture visualization
├── game/
│   ├── config.ts       # Phaser configuration
│   ├── scenes/         # Phaser scenes
│   │   ├── BootScene.ts
│   │   ├── MenuScene.ts
│   │   └── GameScene.ts
│   └── utils/          # Utility classes
│       ├── HandGestureController.ts
│       └── SoundGenerator.ts
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Naming Conventions

### Game Objects
- Player ship: `player`
- Enemy group: `enemies`
- Bullets: `bullets` (player), `enemyBullets` (enemies)
- Asteroids: `asteroids`
- Power-ups: `rapidFireActive`, `shieldActive`, `speedBoostActive`

### Methods
- Getters: `get<Property>()`
- Setters: `set<Property>(value)`
- Creators: `create<Object>()`
- Updaters: `update<Object>()`
- Handlers: `handle<Event>()`
- Checkers: `is<Condition>()`, `has<Property>()`

### Constants
- Game dimensions: `GAME_WIDTH`, `GAME_HEIGHT`
- Physics values: `PLAYER_SPEED`, `BULLET_SPEED`, `ENEMY_SPEED`
- Timings: `FIRE_RATE`, `POWER_UP_DURATION`
- Costs: `RAPID_FIRE_COST`, `SHIELD_COST`, `SPEED_BOOST_COST`

## Code Quality Standards

### Comments and Documentation
- Use JSDoc for public methods and complex logic
- Add inline comments for non-obvious code
- Keep comments up-to-date with code changes
- Use TODO comments for future improvements
- Document magic numbers with named constants

### Error Handling
- Always handle promise rejections
- Validate user input before processing
- Provide meaningful error messages
- Log errors to console in development
- Gracefully degrade when features unavailable

### Performance Guidelines
- Use object pooling for frequently created/destroyed objects
- Avoid creating objects in update loops
- Use spatial partitioning for collision detection
- Minimize DOM updates in React components
- Profile code before optimizing

### Testing Standards
- Write tests for all public methods
- Use descriptive test names
- Test both happy path and error cases
- Aim for 80%+ code coverage
- Use property-based testing for game logic

## Git Workflow

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be specific: "Add rapid fire power-up" not "Update game"
- Reference requirements: "Implement gesture controls (Req 3.1)"
- Keep messages under 72 characters

### Branch Naming
- Feature branches: `feature/gesture-controls`
- Bug fixes: `fix/collision-detection`
- Refactoring: `refactor/game-scene`
- Documentation: `docs/readme-update`

## Browser Support

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+ (limited gesture support)

### Required APIs
- WebGL (for Phaser rendering)
- Web Audio API (for sound effects)
- MediaDevices API (for webcam access)
- Canvas API (for gesture visualization)

## Performance Targets

### Frame Rate
- Game: 60 FPS on modern devices
- Gesture detection: 30 FPS minimum
- Menu: 60 FPS

### Memory Usage
- Initial load: < 50MB
- During gameplay: < 100MB
- Peak memory: < 150MB

### Load Times
- Initial page load: < 3 seconds
- Asset loading: < 2 seconds
- Scene transitions: < 1 second

## Accessibility Standards

### Keyboard Support
- All menu options accessible via keyboard
- Game playable with keyboard controls
- ESC key for pause/menu
- Clear visual feedback for all actions

### Visual Clarity
- High contrast colors for UI elements
- Clear font sizes (minimum 12px)
- Readable color combinations
- Avoid color-only information

### Audio
- Sound effects optional (can be disabled)
- Visual feedback for all audio events
- No auto-playing audio on page load

## Security Best Practices

### Camera Access
- Request permission explicitly
- Only access when gesture control enabled
- Stop stream when disabled
- No recording or storage

### Data Handling
- No personal data collection
- No analytics or tracking
- Game state stored locally only
- No server communication

### Dependencies
- Keep dependencies up-to-date
- Review security advisories
- Use npm audit regularly
- Pin versions in package-lock.json

## Documentation Standards

### README
- Clear project description
- Installation instructions
- Usage examples
- Feature list
- Technology stack
- Troubleshooting guide

### Code Comments
- Explain "why" not "what"
- Document complex algorithms
- Note performance considerations
- Reference requirements

### Commit Messages
- Describe changes clearly
- Reference related issues
- Explain reasoning when non-obvious

## Development Workflow

### Before Committing
1. Run linter: `npm run lint`
2. Run tests: `npm run test`
3. Test in browser: `npm run dev`
4. Check for console errors
5. Verify no breaking changes

### Before Pushing
1. Ensure all tests pass
2. Verify no console warnings
3. Check code coverage
4. Review changes for quality
5. Update documentation if needed

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Security best practices followed
- [ ] Accessibility standards met
