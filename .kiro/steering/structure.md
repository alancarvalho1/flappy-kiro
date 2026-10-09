# Project Structure & Organization

## Directory Layout

```
kiro-introduction/
│
├── .kiro/                          # Kiro IDE configuration and specs
│   ├── specs/
│   │   └── flappy-kiro/            # Flappy Kiro specification files
│   │       ├── requirements.md     # Detailed user requirements (Portuguese)
│   │       ├── design.md           # Architecture and design patterns (Portuguese)
│   │       └── tasks.md            # Implementation tasks with dependencies
│   └── steering/                   # Guidance documents for LLM agents
│       ├── product.md              # Product overview and vision
│       ├── tech.md                 # Technical stack and build info
│       └── structure.md            # This file
│
├── assets/                         # Game assets (sprites, audio)
│   ├── ghosty.png                  # Ghost character sprite
│   ├── jump.wav                    # Jump sound effect
│   └── game_over.wav               # Game over sound effect
│
├── img/                            # Reference images and screenshots
│   └── example-ui.png              # Example UI screenshot for styling reference
│
├── index.html                      # Main HTML entry point (to be created)
├── game.js                         # Main game implementation (to be created)
├── README.md                       # Project overview and resources
├── LICENCE.md                      # License information
└── .gitignore                      # Git ignore rules
```

## File Descriptions

### Root Files

#### `index.html` (To be created)
- Single HTML page serving the game
- Should contain:
  - Canvas element with ID `gameCanvas` (800×600px)
  - Script tag loading `game.js`
  - Basic CSS for page layout
  - No external dependencies

#### `game.js` (To be created)
- Main game implementation
- Contains all classes:
  - `GameObject` - Base class for game objects
  - `Ghost` - Player character with physics
  - `Pipe` - Obstacles with gaps
  - `GameEngine` - Core game loop and state manager
  - `AudioManager` - Sound effects
  - `InputHandler` - Keyboard input handling
- Initialization code to start game on page load

### `.kiro/specs/flappy-kiro/`

#### `requirements.md`
- **Language**: Portuguese (pt-BR)
- **Purpose**: Formal requirements specification
- **Contains**:
  - 12 detailed requirement categories (Req 1-12)
  - User stories with acceptance criteria
  - Glossary of game terms
  - Serialization/deserialization requirements
- **Who Reads**: Product managers, QA engineers, specification reviewers

#### `design.md`
- **Language**: Portuguese (pt-BR)
- **Purpose**: Comprehensive design and architecture document
- **Contains**:
  - High-level architecture diagram
  - Component descriptions and class structures
  - Physics simulation details with formulas
  - Collision detection algorithms (AABB)
  - Audio management strategy
  - Data persistence mechanism
  - Render pipeline ordering
  - Game loop architecture
  - Error handling and edge cases
  - Testing strategy
  - Implementation notes and recommendations
- **Who Reads**: Architects, senior developers, implementation leads

#### `tasks.md`
- **Language**: Portuguese with English headers
- **Purpose**: Implementation task breakdown
- **Contains**:
  - 13 implementation phases (Phases 1-13)
  - 38 individual tasks with checklists
  - Task dependencies and ordering
  - Requirement mappings (which task satisfies which requirement)
  - Constants and configuration values
  - Checkpoint validation criteria
  - Optional vs. required features (marked with *)
  - Task dependency graph (JSON)
- **Who Reads**: Developers, project managers, task trackers

### `.kiro/steering/`

#### `product.md` (This set)
- **Purpose**: High-level product overview for context
- **Contains**:
  - What the product is
  - Core gameplay experience
  - Game states
  - Key features
  - Target audience
  - Project status
- **Who Reads**: New team members, context-gathering agents

#### `tech.md` (This set)
- **Purpose**: Technical guidance and development workflow
- **Contains**:
  - Technology stack (vanilla JS, Canvas)
  - No external dependencies
  - Project structure
  - Build and run instructions
  - Testing approach
  - Common tasks and debugging tips
  - Performance targets
  - Browser compatibility
- **Who Reads**: Developers, debugging agents

#### `structure.md` (This set)
- **Purpose**: Project organization and file navigation
- **Contains**:
  - Directory tree and layout
  - File purpose descriptions
  - Where to find specific information
  - Code organization principles
  - Documentation locations
- **Who Reads**: New developers, code explorers

### `assets/`

#### `ghosty.png`
- Ghost character sprite image
- Used by Ghost class in render() method
- Should be 30×30px or scalable to game dimensions
- Supports transparency

#### `jump.wav`
- Audio file played when player presses spacebar
- WAV format (simple, widely supported)
- Duration: <100ms recommended
- Loaded asynchronously by AudioManager

#### `game_over.wav`
- Audio file played when game ends (collision detected)
- WAV format
- Duration: <500ms recommended
- Loaded asynchronously by AudioManager

### `img/`

#### `example-ui.png`
- Reference screenshot showing desired visual appearance
- Shows: blue sky, green pipes, ghost sprite, score display
- Used for styling and visual design validation
- Not loaded by the game itself

## Code Organization Principles

### Object-Oriented Structure
- **Base Class**: `GameObject` provides common interface
  - Properties: x, y, width, height
  - Methods: getBounds(), update(), render()
  - Inherited by: Ghost, Pipe

- **Game Logic**: `GameEngine` manages overall game state
  - Properties: state, score, highScore, ghost, pipes[]
  - Methods: init(), update(), render(), gameLoop(), reset()
  - Initializes sub-systems on construction

- **Sub-systems**: Specialized classes for specific concerns
  - `Ghost`: Physics, jumping, boundary clamping
  - `Pipe`: Movement, bounds checking, scoring tracking
  - `AudioManager`: Audio loading and playback
  - `InputHandler`: Keyboard event listening

### Separation of Concerns
- **Physics**: Handled in Ghost.update() with delta time
- **Collision**: Separate checkCollisions() method in GameEngine
- **Rendering**: Each class has render(ctx) method
- **Audio**: Centralized in AudioManager
- **Input**: Dedicated InputHandler class
- **State**: Managed by GameEngine state property

### Data Flow
```
Input Handler
    ↓
GameEngine.jump()
    ↓
Ghost.jump() → update velocity
    ↓
GameEngine.update() → apply physics → check collisions
    ↓
GameEngine.render() → draw to canvas
```

## Where to Find Information

### For Implementing a Feature
1. Check `tasks.md` for the specific task description
2. Look in `design.md` for architecture and algorithm details
3. Reference `requirements.md` for acceptance criteria
4. Examine `example-ui.png` for visual reference if UI-related

### For Understanding Game Mechanics
- **Physics**: `design.md` → "Physics Simulation" section
- **Collisions**: `design.md` → "Collision Detection" section
- **Scoring**: `design.md` → "Collision Detection" → "Detecção de Pontuação" subsection
- **Audio**: `design.md` → "Audio Management" section
- **Persistence**: `design.md` → "High Score Persistence" section

### For Debugging Issues
1. Check `tech.md` → "Common Tasks" section for debugging tips
2. Review `design.md` → "Error Handling & Edge Cases"
3. Verify game loop in `design.md` → "Game Loop Architecture"

### For Adding New Features
1. Review `tasks.md` → "Fase 13: Melhorias Pós-MVP" for post-MVP ideas
2. Check `design.md` → "Implementation Notes" → "Oportunidades de Aprimoramento Futuro"
3. Ensure new feature doesn't violate existing architecture patterns

## Documentation Language

- **Specification Files** (`requirements.md`, `design.md`, `tasks.md`): Portuguese (pt-BR)
  - Written by product/design team
  - Used for requirements and design validation
  
- **Steering Files** (`product.md`, `tech.md`, `structure.md`): English
  - Written for LLM agents and developers
  - Technical and operational guidance

- **Code Comments**: English (recommended for team visibility)

## Implementation Phases

The project is structured in 13 phases as defined in `tasks.md`:

1. **Setup & Base Structure** (Phase 1) - Project scaffolding
2. **Physics Engine** (Phase 2) - Ghost physics implementation
3. **Base Rendering** (Phase 3) - Canvas and sprite drawing
4. **Input & Loop** (Phase 4) - Game loop and keyboard handling
5. **Pipe System** (Phase 5) - Pipe generation and rendering
6. **Collision Detection** (Phase 6) - AABB collision testing
7. **Scoring System** (Phase 7) - Score tracking and display
8. **Persistence** (Phase 8) - High score localStorage
9. **Audio** (Phase 9) - Sound effects
10. **Game Over** (Phase 10) - End game and restart
11. **MVP Checkpoint** (Phase 11) - Validation of complete feature
12. **Integration Tests** (Phase 12) - Comprehensive testing (optional)
13. **Post-MVP Enhancements** (Phase 13) - Features beyond MVP (optional)

Each phase builds on previous phases with defined dependencies.

## Key Constants

These are configured in `GameEngine` class and should be accessible for tuning:

| Constant | Value | File Location |
|----------|-------|----------------|
| Canvas Width | 800px | index.html |
| Canvas Height | 600px | index.html |
| Gravity | 600 px/s² | game.js - GameEngine |
| Jump Power | 300 px/s | game.js - GameEngine |
| Terminal Velocity | 400 px/s | game.js - GameEngine |
| Pipe Speed | 200 px/s | game.js - GameEngine |
| Gap Height | 120px | game.js - GameEngine |
| Pipe Interval | 2.5s | game.js - GameEngine |
| Ghost Size | 30x30px | game.js - GameEngine.init() |

See `design.md` → "Implementation Notes" → "Resumo de Constantes" for detailed table.
