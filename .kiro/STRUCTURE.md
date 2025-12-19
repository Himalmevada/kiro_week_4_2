# .kiro Folder Structure - Complete Overview

## What is the .kiro Folder?

The `.kiro` folder is a project management and documentation structure that helps organize specifications, design documents, implementation plans, and development guidelines for the Space Invaders Game project.

## Complete File Structure

```
.kiro/
│
├── README.md                                    # Main guide to .kiro folder
├── STRUCTURE.md                                 # This file - folder overview
│
├── specs/                                       # Project Specifications
│   └── space-invaders-game/
│       ├── requirements.md                      # Feature requirements (10 requirements)
│       ├── design.md                            # System design & architecture
│       └── tasks.md                             # Implementation plan (39 core + 25 optional tasks)
│
├── steering/                                    # Development Guidelines
│   ├── project-standards.md                     # Code style & conventions
│   ├── architecture-guide.md                    # System architecture & patterns
│   └── gesture-recognition-guide.md             # Gesture recognition implementation
│
└── settings/                                    # Project Configuration
    └── project.json                             # Project metadata & settings
```

## File Descriptions

### Specifications (specs/space-invaders-game/)

#### requirements.md (10 Requirements)
**Purpose:** Define what the game should do

**Content:**
- Introduction and glossary
- 10 requirements with user stories
- Acceptance criteria for each requirement
- EARS (Easy Approach to Requirements Syntax) format

**Requirements:**
1. Core Gameplay Mechanics
2. Progressive Level System
3. AI Gesture Recognition System
4. Power-Up System
5. Ship and Laser Customization
6. Audio System
7. User Interface and Menus
8. Collision and Physics System
9. Hand Gesture Detection and Calibration
10. Game State Management

**Use:** Reference when implementing features, verify acceptance criteria

#### design.md (System Design)
**Purpose:** Explain how the game is built

**Content:**
- High-level architecture overview
- Component responsibilities
- Data models and interfaces
- 12 correctness properties
- Error handling strategies
- Testing strategy
- Performance considerations
- Security considerations
- Deployment considerations

**Key Sections:**
- Architecture (layered design)
- Components (8 major components)
- Data Models (Player, Enemy, Bullet, Power-Up, Level)
- Correctness Properties (12 formal properties)
- Error Handling (camera, audio, physics, memory)
- Testing Strategy (unit, property-based, integration)

**Use:** Understand system design before implementation, reference for architecture decisions

#### tasks.md (Implementation Plan)
**Purpose:** Break down implementation into manageable tasks

**Content:**
- 15 implementation phases
- 39 core tasks
- 25 optional testing tasks
- Task dependencies and ordering
- Estimated timeline

**Phases:**
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

**Use:** Track progress, execute tasks incrementally, understand task dependencies

### Steering Guides (steering/)

#### project-standards.md (Code Standards)
**Purpose:** Establish code quality standards and conventions

**Content:**
- TypeScript standards
- React component standards
- Phaser scene standards
- File organization
- Naming conventions
- Code quality standards
- Git workflow
- Browser support
- Performance targets
- Accessibility standards
- Security best practices
- Documentation standards
- Development workflow

**Use:** Reference when writing code, ensure consistency across codebase

#### architecture-guide.md (System Architecture)
**Purpose:** Explain system architecture and design patterns

**Content:**
- System architecture overview (layered design)
- Component responsibilities (8 components)
- Data flow patterns (input, gesture, collision)
- State management (game, player, gesture, power-up)
- Communication patterns (React to Phaser, Phaser to React, Gesture to Game)
- Extension points (new power-ups, enemies, levels, gestures)
- Performance optimization strategies
- Testing strategy
- Debugging tips
- Deployment considerations

**Use:** Understand how components interact, make architectural decisions, extend system

#### gesture-recognition-guide.md (Gesture Implementation)
**Purpose:** Explain gesture recognition implementation details

**Content:**
- Hand pose detection basics (MediaPipe Hands)
- Hand landmarks (21 points)
- Gesture recognition implementation (4 algorithms)
- Implementation details (initialization, detection loop, landmark processing)
- Integration with game (reading state, applying movement, shooting, power-ups)
- Visualization and debugging
- Troubleshooting guide (6 common issues)
- Performance optimization
- Testing gesture recognition
- Future improvements

**Use:** Implement gesture features, debug gesture issues, optimize gesture detection

### Settings (settings/)

#### project.json (Project Configuration)
**Purpose:** Store project metadata and configuration

**Content:**
- Project name and description
- Version and language
- Framework and features
- Technologies used
- Team information
- Development setup
- Project structure
- Requirements summary
- Implementation phases
- Testing configuration
- Performance targets
- Browser support
- Deployment commands
- Documentation references
- Key features
- Quality metrics

**Use:** Quick reference for project overview, configuration details

### Root Files

#### README.md (Main Guide)
**Purpose:** Guide to using the .kiro folder

**Content:**
- Directory structure
- Quick start guide
- Document overview
- Key concepts
- Development workflow
- Testing strategy
- Performance targets
- Browser support
- Technologies
- Common tasks
- Useful commands
- Resources
- Support and questions

**Use:** First file to read when starting work on project

#### STRUCTURE.md (This File)
**Purpose:** Complete overview of .kiro folder structure

**Content:**
- What is .kiro folder
- Complete file structure
- File descriptions
- How to use each file
- Quick reference guide

**Use:** Understand folder organization, find specific documents

## How to Use the .kiro Folder

### For New Developers

1. Start with `.kiro/README.md` - Get oriented
2. Read `specs/space-invaders-game/requirements.md` - Understand features
3. Read `specs/space-invaders-game/design.md` - Understand architecture
4. Review `steering/project-standards.md` - Learn code style
5. Review `steering/architecture-guide.md` - Understand system design
6. Start with Phase 1 tasks in `specs/space-invaders-game/tasks.md`

### For Implementing Features

1. Find requirement in `requirements.md`
2. Check design details in `design.md`
3. Find related tasks in `tasks.md`
4. Review relevant steering guide
5. Follow code standards from `project-standards.md`
6. Implement and test

### For Debugging Issues

1. Check `steering/gesture-recognition-guide.md` for gesture issues
2. Check `steering/architecture-guide.md` for architecture issues
3. Check `steering/project-standards.md` for code style issues
4. Check `specs/space-invaders-game/design.md` for design issues

### For Adding New Features

1. Add requirement to `requirements.md`
2. Add design details to `design.md`
3. Add correctness property to `design.md`
4. Add tasks to `tasks.md`
5. Implement following standards
6. Write tests
7. Update documentation

## Key Statistics

### Requirements
- **Total:** 10 requirements
- **Acceptance Criteria:** 50+ criteria
- **Format:** EARS (Easy Approach to Requirements Syntax)

### Design
- **Components:** 8 major components
- **Data Models:** 5 core models
- **Correctness Properties:** 12 formal properties
- **Error Handling Scenarios:** 5 categories

### Implementation
- **Phases:** 15 phases
- **Core Tasks:** 39 tasks
- **Optional Testing Tasks:** 25 tasks
- **Estimated Timeline:** 4-6 weeks (core), 6-8 weeks (comprehensive)

### Testing
- **Unit Tests:** Comprehensive coverage
- **Property-Based Tests:** 12 properties, 100+ iterations each
- **Integration Tests:** Scene transitions, gesture integration, audio
- **Target Coverage:** 80%+

### Performance
- **Game FPS:** 60 FPS target
- **Gesture Detection:** 30 FPS minimum
- **Memory Usage:** < 100MB
- **Load Time:** < 3 seconds

## Quick Reference

### Finding Information

| Topic | File |
|-------|------|
| What should the game do? | `requirements.md` |
| How is the game built? | `design.md` |
| What tasks need to be done? | `tasks.md` |
| How should I write code? | `project-standards.md` |
| How do components interact? | `architecture-guide.md` |
| How does gesture recognition work? | `gesture-recognition-guide.md` |
| Project overview? | `project.json` |

### Common Questions

**Q: Where do I start?**
A: Read `.kiro/README.md` first, then `requirements.md`

**Q: How do I implement a feature?**
A: Find requirement → check design → find tasks → follow standards → implement

**Q: How do I debug gesture issues?**
A: Check `gesture-recognition-guide.md` troubleshooting section

**Q: What are the code standards?**
A: See `project-standards.md` for TypeScript, React, and Phaser conventions

**Q: How do I know if my code is correct?**
A: Check correctness properties in `design.md` and write tests

**Q: What's the project timeline?**
A: 4-6 weeks for core features, 6-8 weeks with comprehensive testing

## Integration with Development

### Before Coding
1. Read relevant specification
2. Review design details
3. Check steering guides
4. Understand task requirements

### While Coding
1. Follow code standards
2. Reference architecture guide
3. Write tests as specified
4. Check for console errors

### After Coding
1. Run linter and tests
2. Verify in browser
3. Update documentation
4. Commit with reference to requirements

## Maintenance

### Updating Documentation
- Update requirements when features change
- Update design when architecture changes
- Update tasks when implementation plan changes
- Update steering guides when standards change

### Version Control
- Keep .kiro folder in git
- Commit documentation changes with code changes
- Reference requirements in commit messages
- Use descriptive commit messages

## Related Files

### In Project Root
- `README.md` - Project overview and features
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration

### In src/
- `components/` - React components
- `game/` - Phaser game logic
- `game/scenes/` - Game scenes
- `game/utils/` - Utility classes

## Summary

The `.kiro` folder provides a complete project management structure with:

- **Specifications:** Clear requirements and acceptance criteria
- **Design:** System architecture and correctness properties
- **Implementation Plan:** 39 core tasks organized in 15 phases
- **Development Guidelines:** Code standards, architecture patterns, gesture implementation
- **Project Configuration:** Metadata and settings

This structure ensures:
- Clear understanding of requirements
- Consistent code quality
- Organized implementation
- Comprehensive testing
- Easy onboarding for new developers
- Maintainable codebase

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Complete
