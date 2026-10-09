# Technical Stack & Build System

## Tech Stack

### Core Technologies
- **Language**: JavaScript (ES6+ with classes)
- **Graphics**: HTML5 Canvas 2D API
- **Audio**: HTML5 `<audio>` element or Web Audio API
- **Storage**: Browser localStorage (JSON serialization)
- **Runtime**: Browser (modern browsers with ES6 support)

### Key Libraries & Dependencies
- **None**: This is vanilla JavaScript with no framework or build dependencies
- **Asset Format**: PNG for sprites, WAV for audio files

### Browser Requirements
- ES6 class syntax support
- Canvas 2D context
- localStorage API
- requestAnimationFrame
- HTML5 Audio element

## Project Structure

```
kiro-introduction/
├── assets/
│   ├── ghosty.png          # Ghost sprite
│   ├── jump.wav            # Jump sound effect
│   └── game_over.wav       # Game over sound effect
├── .kiro/
│   ├── specs/              # Specification documents
│   │   └── flappy-kiro/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/           # This folder (guidance docs)
├── img/
│   └── example-ui.png      # UI reference screenshot
├── index.html              # Main HTML entry point
├── game.js                 # Main game implementation
├── README.md               # Project readme
└── LICENCE.md              # License information
```

## Build & Run

### Setup
No build step required. This is a vanilla JavaScript project.

### Running the Game
1. Open `index.html` in a web browser
2. Game starts immediately on page load
3. Use spacebar to control ghost character

### Development Workflow
- Edit `game.js` or `index.html` directly
- Refresh browser to see changes
- Use browser DevTools (F12) for debugging:
  - Console tab for error messages
  - Sources tab for breakpoints
  - Network tab for asset loading verification

### Testing
- **Manual Testing**: Play the game and verify each requirement
- **DevTools Console**: Check for errors or warnings
- **localStorage Inspection**: DevTools → Application → localStorage to verify high score persistence
- **Performance**: DevTools → Performance tab to verify 60 FPS target

## Key Implementation Details

### Physics Simulation
- **Delta-time based**: All physics calculations use frame delta time for consistency
- **Frame-rate independent**: Physics remain consistent regardless of actual FPS
- **Constants** (adjustable via GameEngine class):
  - Gravity: 600 px/s²
  - Jump Power: 300 px/s
  - Terminal Velocity: 400 px/s (max fall speed)
  - Pipe Speed: 200 px/s

### Game Architecture
- **Object-Oriented**: Classes for GameObject, Ghost, Pipe, GameEngine, AudioManager, InputHandler
- **Component Pattern**: Each entity (ghost, pipes) extends GameObject with specialized behavior
- **State Machine**: Game uses three states (INITIAL, PLAYING, GAME_OVER)
- **Event-Driven Input**: Keyboard events trigger jump via InputHandler

### Rendering
- **Canvas 2D**: Direct drawing commands (fillRect, drawImage, fillText)
- **Render Order**: Background → Pipes → Ghost → UI Text → Game Over Overlay
- **Double-buffering**: requestAnimationFrame handles frame synchronization

### Data Persistence
- **Storage**: Browser localStorage
- **Key**: `"flappyKiroHighScore"`
- **Format**: JSON-serialized integer
- **Validation**: Handles missing data, corrupted data, and out-of-range values

## Common Tasks

### Adding New Features
1. Identify which class needs the feature (Ghost, Pipe, GameEngine, etc.)
2. Add method or property
3. Integrate into gameLoop (update phase or render phase)
4. Test interaction with existing systems

### Debugging Physics
- Add console.log statements in Ghost.update() to track velocityY
- Check deltaTime is being calculated correctly in gameLoop
- Verify gravity constant in GameEngine constructor

### Debugging Collisions
- Enable visual debugging: Draw collision bounds as rectangles
- Verify AABB function logic matches bounds structure
- Check that Pipe getters return correct boundary values

### Debugging Audio
- Check browser console for errors loading assets
- Verify file paths in AudioManager match actual asset locations
- Test audio plays when methods called (may require user gesture)

### Debugging High Score
- Open DevTools → Application → localStorage
- Check "flappyKiroHighScore" key exists and contains valid JSON
- Clear localStorage and refresh to test fresh state
- Verify loadHighScore() returns 0 when key missing

## Asset Requirements

### Sprite
- **File**: `assets/ghosty.png`
- **Format**: PNG with transparency
- **Size**: Recommend 30×30px or scalable to game size
- **Usage**: Rendered as Ghost character sprite

### Audio
- **Files**: `assets/jump.wav`, `assets/game_over.wav`
- **Format**: WAV (uncompressed, widely supported)
- **Duration**: Jump sound <100ms, Game Over sound <500ms recommended
- **Graceful Degradation**: Game continues if audio files missing or fail to load

## Performance Targets

- **FPS**: 60 FPS (target achieved via requestAnimationFrame)
- **Input Latency**: <16ms (1 frame at 60 FPS) from spacebar press to jump
- **Memory**: Minimal; no major allocations in game loop
- **Network**: Single-page app; no external API calls

## Browser Compatibility

- Chrome/Edge: Full support (modern versions)
- Firefox: Full support (modern versions)
- Safari: Full support (modern versions)
- Mobile Browsers: Functional but not optimized (future enhancement)

## Common Browser Issues

- **Audio not playing**: May require user gesture (click) before first playback
- **localStorage disabled**: Game continues without high score persistence
- **Canvas context failed**: Indicates browser graphics limitation
- **Sprites not loading**: Verify relative file paths from HTML file location

## No External Dependencies

This project intentionally avoids:
- Framework dependencies (React, Vue, etc.)
- Build tools (Webpack, Vite, etc.)
- Package managers (npm, yarn, etc.)
- Third-party libraries

This keeps the project simple, fast, and dependency-free while maintaining all functionality.
