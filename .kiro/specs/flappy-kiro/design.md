# ThemeManager Missing - Bugfix Design

## Overview

The GameEngine class references a ThemeManager instance throughout its lifecycle (constructor, init, render, and public methods like cycleTheme and setTheme), but this instance is never created, causing a ReferenceError on game startup. The fix requires implementing the ThemeManager class with support for multiple themes (light, dark, forest, sunset) and integrating it into the GameEngine constructor. This will allow the game to initialize successfully, load the correct ghost sprite for the current theme, and support theme switching during gameplay.

## Glossary

- **Bug_Condition (C)**: When GameEngine.constructor() executes without initializing this.themeManager, causing all subsequent calls to this.themeManager methods to throw ReferenceError
- **Property (P)**: The GameEngine should successfully initialize with a ThemeManager instance that provides theme data (colors, sprite paths) and theme switching capabilities
- **Preservation**: All existing game mechanics (physics, collisions, scoring, rendering) must continue to function identically, only applying theme colors and sprites
- **GameEngine**: The main game controller class in game.js that manages game state, objects, and the game loop
- **loadGhostImage()**: The method that loads the ghost sprite image at line 937 of game.js
- **render()**: The method that renders the game each frame, accessing theme.skyColor and theme.textColor
- **ThemeManager**: The new class needed to store theme data and provide methods to get, set, and cycle through themes
- **Theme Object**: A data structure containing: name (string), skyColor (hex/rgba), textColor (hex/rgba), pipeColor (hex/rgba), ghostSprite (path string)

## Bug Details

### Bug Condition

The bug manifests when the GameEngine is instantiated during page load. The constructor initializes several sub-systems (AudioManager, InputHandler, ParticleSystem, UIController) but does NOT initialize this.themeManager. The init() method is called at the end of the constructor, which calls loadGhostImage(), which immediately tries to access this.themeManager.getTheme(), causing a ReferenceError because this.themeManager is undefined.

**Formal Specification:**
```
FUNCTION isBugCondition(gameEngineState)
  INPUT: gameEngineState of type GameEngineConstructorState
  OUTPUT: boolean
  
  RETURN gameEngineState.themeManager = undefined
         AND (loadGhostImage_called OR render_called OR cycleTheme_called)
END FUNCTION
```

### Examples

- **Example 1**: Page load → GameEngine constructor runs → init() called → loadGhostImage() called → attempts `this.themeManager.getTheme()` → throws ReferenceError "Cannot read property 'getTheme' of undefined"

- **Example 2**: Game initializes with themeManager = undefined → render() called on first frame → attempts `const theme = this.themeManager.getTheme()` → throws ReferenceError

- **Example 3**: User calls cycleTheme() from pause menu (if implemented) → attempts `this.themeManager.getAvailableThemes()` → throws ReferenceError

- **Edge Case - Preservation Example**: With themeManager properly initialized, ghost.render(ctx) is called and renders the sprite without any theme data (ghost rendering is theme-independent) → image renders correctly with proper rotation and positioning (existing behavior preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Ghost physics (gravity, jumping, falling) must continue to work exactly as before
- Collision detection (AABB with pipes, ground, ceiling) must continue to work exactly as before
- Scoring system must continue to work exactly as before (one point per pipe passage)
- Input handling (spacebar for jump) must continue to work exactly as before
- Pipe generation and movement must continue to work exactly as before
- Particle effects (jump, collision, gap pass) must continue to work exactly as before
- High score persistence (localStorage) must continue to work exactly as before
- Audio playback (jump sound, game over sound) must continue to work exactly as before
- Game state transitions (INITIAL → PLAYING → GAME_OVER) must continue to work exactly as before
- Ghost rendering (sprite, rotation, position) must continue to work exactly as before

**Scope:**
All game mechanics that do not depend on theme selection should be completely unaffected by this fix. The ThemeManager is purely a data provider for visual styling (colors and sprite selection). The introduction of ThemeManager should not alter:
- Any physics calculations
- Any collision logic
- Any state management
- Any input handling
- Any object pooling or recycling
- Any particle system behavior
- Any animation timings

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Incomplete Implementation**: The theme switching feature was partially implemented. Methods like cycleTheme(), setTheme(), and getCurrentTheme() were added to GameEngine, along with render() modifications to use theme colors, but the ThemeManager class itself was never created and the constructor never instantiated it.

2. **Missing Class Definition**: The ThemeManager class is referenced in multiple places (loadGhostImage, render, cycleTheme, setTheme, getCurrentTheme) but the class definition does not exist anywhere in game.js.

3. **Constructor Initialization Gap**: Other sub-systems like AudioManager, InputHandler, ParticleSystem, and UIController are initialized in the constructor (lines 819-821), but ThemeManager is missing from this initialization sequence.

4. **Late Feature Addition**: The theme methods were added to GameEngine and the render method was modified to use themes, but the supporting ThemeManager class implementation was not completed before the code was run.

## Correctness Properties

Property 1: Bug Condition - ThemeManager Initialization

_For any_ GameEngine instantiation where this.themeManager is not initialized (isBugCondition returns true), the fixed GameEngine constructor SHALL create and assign a ThemeManager instance to this.themeManager, allowing all subsequent theme-related method calls (loadGhostImage, render, cycleTheme, setTheme, getCurrentTheme) to execute without throwing ReferenceError.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Game Mechanics Unchanged

_For any_ game action or state that does not involve theme selection or theme-dependent rendering (physics updates, collision checks, scoring, input handling, particle effects, audio playback), the fixed code SHALL produce exactly the same behavior as the original code, with no changes to timing, logic, or results.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the fix requires creating the ThemeManager class and integrating it into GameEngine:

**File**: `game.js`

**New Class**: `ThemeManager` (add before GameEngine class definition at line 784)

**Specific Changes**:

1. **Create ThemeManager Class**: Define a new class that:
   - Stores available themes as a private property
   - Tracks the current active theme
   - Provides getTheme() method returning the current theme object
   - Provides getAvailableThemes() method returning array of theme names
   - Provides setTheme(themeName) method to change the current theme
   - Provides currentTheme property (getter) returning the name of the active theme
   - Defines theme objects with properties: name, skyColor, textColor, pipeColor, ghostSprite

2. **Initialize ThemeManager in Constructor**: Add line in GameEngine constructor (after line 820, with other sub-system initializations):
   - `this.themeManager = new ThemeManager();`

3. **Define Theme Data Structure**: Each theme object should contain:
   - name: string (e.g., "light", "dark", "forest", "sunset")
   - skyColor: CSS color string for background
   - textColor: CSS color string for text and UI
   - pipeColor: CSS color string for pipes
   - ghostSprite: path to ghost image file (e.g., "assets/ghosty.png")

4. **Theme Defaults**: Set "light" as the default theme on initialization

5. **Sprite Path Consistency**: Ensure the ghostSprite path for the default theme matches the existing sprite used in the current game

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that GameEngine initialization fails when ThemeManager is missing.

**Test Plan**: Write tests that create a GameEngine instance and verify it crashes with ReferenceError when attempting to access this.themeManager. Run these tests on the UNFIXED code to observe the failure.

**Test Cases**:
1. **GameEngine Initialization Test**: Instantiate GameEngine → expect ReferenceError when init() calls loadGhostImage() (will fail on unfixed code)
2. **Render Method Test**: Call GameEngine.render() → expect ReferenceError when accessing this.themeManager.getTheme() (will fail on unfixed code)
3. **Theme Method Test**: Call GameEngine.cycleTheme() → expect ReferenceError when accessing this.themeManager.getAvailableThemes() (will fail on unfixed code)
4. **Get Theme Test**: Call GameEngine.getCurrentTheme() → expect ReferenceError when accessing this.themeManager.currentTheme (will fail on unfixed code)

**Expected Counterexamples**:
- GameEngine constructor throws ReferenceError "Cannot read property 'getTheme' of undefined"
- Render method throws ReferenceError "Cannot read property 'getTheme' of undefined"
- Possible cause: this.themeManager is undefined because it's never initialized

### Fix Checking

**Goal**: Verify that after implementing ThemeManager, GameEngine initializes successfully and all theme-related methods work correctly.

**Pseudocode:**
```
FOR ALL method IN [loadGhostImage, render, cycleTheme, setTheme, getCurrentTheme] DO
  result := gameEngine.method()
  ASSERT no_error_thrown(result)
  ASSERT this.themeManager IS DEFINED
  ASSERT method_returns_correct_data(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that with ThemeManager properly initialized, all existing game mechanics continue to work identically.

**Pseudocode:**
```
FOR ALL gameAction IN [physics_update, collision_check, score_update, input_handling] DO
  ASSERT gameEngine_original.gameAction() = gameEngine_fixed.gameAction()
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many game scenarios automatically
- It catches edge cases in physics and collision calculations
- It provides strong guarantees that behavior is unchanged

**Test Plan**: Observe behavior on UNFIXED code first (without theme features), then write property-based tests capturing that behavior across many game states and scenarios.

**Test Cases**:
1. **Physics Preservation**: Run ghost physics update 1000 times with random deltaTime values → verify identical velocities and positions as original code
2. **Collision Preservation**: Test collision detection with random ghost and pipe positions → verify identical collision results as original code
3. **Scoring Preservation**: Run game through multiple pipe passages → verify score calculation matches original code
4. **Particle Preservation**: Emit particles and verify they update and render identically to original code
5. **Audio Preservation**: Verify jump and game over sounds play on correct events

### Unit Tests

- Test ThemeManager initialization with default theme
- Test getTheme() returns correct theme object for current theme
- Test getAvailableThemes() returns array of all available themes
- Test setTheme() changes current theme successfully
- Test currentTheme getter returns string name of active theme
- Test theme object structure (contains all required properties)
- Test GameEngine accepts initialized ThemeManager without errors
- Test loadGhostImage() successfully loads sprite after ThemeManager initialization

### Property-Based Tests

- Generate random theme selections and verify getTheme() returns correct theme data
- Generate random game states (various deltaTime values, pipe positions, ghost positions) and verify physics and collisions remain unchanged
- Generate sequence of theme changes and verify game continues to function correctly
- Test that theme colors are applied to rendering without affecting game logic

### Integration Tests

- Start game, verify it initializes without crashes
- Play full game round with theme initialized, verify all features work
- Switch themes during gameplay, verify visual update and game continues working
- Verify high score persists across theme changes
- Test theme cycling through all available themes
