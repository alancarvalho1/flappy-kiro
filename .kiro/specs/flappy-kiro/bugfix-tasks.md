# ThemeManager Missing - Implementation Plan

## Workflow Overview

This bugfix follows the exploratory methodology:
1. **Write Bug Condition Test** (BEFORE fix) - Demonstrate the bug exists on unfixed code
2. **Write Preservation Tests** (BEFORE fix) - Observe and verify existing behavior
3. **Implement ThemeManager** - Apply the fix
4. **Verify Fix Works** - Run bug condition test, should now pass
5. **Verify No Regressions** - Run preservation tests, should still pass

---

## Phase 1: Exploration (BEFORE Implementing Fix)

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - ThemeManager Missing Causes ReferenceError
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **IMPORTANT**: Write this test BEFORE implementing the fix
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case: GameEngine instantiation with the expectation that it succeeds
  - Test that GameEngine can be instantiated successfully without throwing ReferenceError
  - The test assertions should verify:
    - GameEngine constructor completes without error
    - GameEngine.init() completes without error
    - GameEngine.render() can be called without error
    - this.themeManager is defined and is an object
    - this.themeManager.getTheme() returns a valid theme object
    - Theme object contains properties: name, skyColor, textColor, pipeColor, ghostSprite
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS with ReferenceError "Cannot read property 'getTheme' of undefined" (this proves the bug exists)
  - Document counterexamples found to understand the exact failure point
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Game Mechanics Work Without Theme Features
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: On unfixed code, create a minimal GameEngine-like object WITHOUT theme support
  - Observe: Verify physics calculations (gravity, jumping, falling) work correctly
  - Observe: Verify collision detection works correctly
  - Observe: Verify scoring logic works correctly
  - Write property-based tests that verify these mechanics continue to work after ThemeManager is added
  - Property-based testing generates many test cases for stronger preservation guarantees
  - Test cases should cover:
    - Ghost physics: verify velocity and position calculations with various deltaTime values
    - Collision detection: verify AABB function returns same results for ghost and pipe bounds
    - Scoring: verify score increments only when ghost passes pipe gap correctly
    - Pipe generation: verify pipes are created at correct intervals
    - Input handling: verify jump action updates velocity correctly
  - Run tests on reference implementation (may be external or mock-based)
  - **EXPECTED OUTCOME**: Tests establish baseline behavior to preserve
  - Mark task complete when tests are written and baseline behavior is documented
  - _Requirements: 3.1, 3.2, 3.3_

---

## Phase 2: Implementation (Apply the Fix)

- [ ] 3. Fix for ThemeManager Missing Bug

  - [ ] 3.1 Implement ThemeManager class
    - Create ThemeManager class in game.js (insert before GameEngine class at line 784)
    - Constructor initializes available themes with properties for each:
      - light theme: skyColor="#87CEEB", textColor="#000000", pipeColor="#00AA00", ghostSprite="assets/ghosty.png"
      - dark theme: skyColor="#1a1a1a", textColor="#FFFFFF", pipeColor="#00FF00", ghostSprite="assets/ghosty.png"
      - forest theme: skyColor="#2d5016", textColor="#FFFFFF", pipeColor="#006600", ghostSprite="assets/ghosty.png"
      - sunset theme: skyColor="#ff6b6b", textColor="#FFFFFF", pipeColor="#ff9500", ghostSprite="assets/ghosty.png"
    - Implement getTheme() method returning current theme object
    - Implement getAvailableThemes() method returning array of theme names
    - Implement setTheme(themeName) method changing current theme
    - Implement currentTheme getter returning name of active theme
    - Set "light" as default theme on initialization
    - _Bug_Condition: isBugCondition(state) where state.themeManager = undefined_
    - _Expected_Behavior: After fix, this.themeManager is defined and provides all theme data_
    - _Preservation: Game mechanics that don't use themes remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.2 Initialize ThemeManager in GameEngine constructor
    - Add `this.themeManager = new ThemeManager();` in GameEngine constructor
    - Insert after line 820 (with other sub-system initializations like AudioManager, InputHandler)
    - Verify initialization happens before init() is called
    - _Requirements: 2.1_

  - [ ] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - ThemeManager Initialization Success
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify that:
      - GameEngine constructor completes without error
      - this.themeManager is defined
      - this.themeManager.getTheme() returns valid theme object
      - loadGhostImage() can access theme data successfully
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Document test results
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - No Regressions in Game Mechanics
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify that:
      - Physics calculations produce identical results
      - Collision detection behaves identically
      - Scoring logic produces identical results
      - Pipe generation timing is unchanged
      - Input handling works identically
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions introduced)
    - Document any observations about preservation

---

## Phase 3: Validation

- [ ] 4. Checkpoint - All Tests Pass and Game Launches
  - [ ] 4.1 Verify all exploration and preservation tests pass
    - Run all tests from task 1 and task 2
    - Verify zero test failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

  - [ ] 4.2 Manual smoke test - Game launches successfully
    - Open index.html in browser
    - Verify game initializes without ReferenceError
    - Verify ghost sprite is loaded and visible
    - Verify game responds to spacebar (jump)
    - Verify pipes are generated and move correctly
    - Verify collision detection works (game over on collision)
    - Verify score increments on successful pipe passage
    - Verify high score persists
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

  - [ ] 4.3 Verify theme methods are callable (if theme UI exists)
    - If there's a UI for theme switching, test:
      - cycleTheme() rotates through available themes
      - setTheme("dark") successfully changes theme
      - getCurrentTheme() returns correct theme name
      - Ghost sprite updates when theme changes
    - If no UI exists yet, verify methods don't throw errors when called directly

---

## Test Implementation Details

### Test 1: Bug Condition Exploration Test

**File to create**: `test-thememanager-bug.js`

```javascript
// This test demonstrates the bug on unfixed code
// Expected: FAIL on unfixed code with ReferenceError
// Expected: PASS on fixed code

function testGameEngineInitialization() {
  try {
    // This should fail on unfixed code when init() calls loadGhostImage()
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    const gameEngine = new GameEngine(canvas);
    
    // If we get here on unfixed code, something is wrong with test setup
    // (unfixed code should have crashed in the constructor)
    
    // Verify ThemeManager was initialized
    if (!gameEngine.themeManager) {
      throw new Error("themeManager is not initialized");
    }
    
    // Verify we can access theme data
    const theme = gameEngine.themeManager.getTheme();
    if (!theme || !theme.name || !theme.skyColor || !theme.ghostSprite) {
      throw new Error("Invalid theme object");
    }
    
    // Verify available themes exist
    const themes = gameEngine.themeManager.getAvailableThemes();
    if (!Array.isArray(themes) || themes.length === 0) {
      throw new Error("No available themes");
    }
    
    console.log("✓ GameEngine initialized successfully");
    console.log("✓ ThemeManager available with theme:", theme.name);
    console.log("✓ Available themes:", themes);
    return true;
    
  } catch (error) {
    console.error("✗ GameEngine initialization failed:", error.message);
    throw error; // Re-throw to fail the test
  }
}
```

### Test 2: Preservation Property Tests

**File to create**: `test-preservation-mechanics.js`

```javascript
// This test verifies game mechanics work correctly
// Expected: PASS on both unfixed and fixed code
// (This test doesn't rely on themes, only core mechanics)

function testPhysicsPreservation() {
  const ghost = new Ghost(100, 100, 30, 30, 600); // gravity = 600
  ghost.jumpPower = 300;
  ghost.terminalVelocity = 400;
  
  // Test 1: Velocity should increase due to gravity
  const initialVelocity = ghost.velocityY;
  ghost.update(0.1); // 100ms
  const newVelocity = ghost.velocityY;
  const expectedVelocity = initialVelocity + 600 * 0.1; // gravity * deltaTime
  
  if (Math.abs(newVelocity - expectedVelocity) > 0.1) {
    throw new Error(`Physics failed: expected ${expectedVelocity}, got ${newVelocity}`);
  }
  console.log("✓ Gravity physics working correctly");
  
  // Test 2: Jump should set upward velocity
  ghost.velocityY = 100; // falling
  ghost.jump();
  if (ghost.velocityY >= 0) { // Should be negative (upward)
    throw new Error(`Jump failed: velocityY should be negative after jump`);
  }
  console.log("✓ Jump mechanics working correctly");
  
  // Test 3: Terminal velocity should cap fall speed
  ghost.velocityY = 500; // Exceeds terminal velocity of 400
  ghost.update(0.1);
  if (ghost.velocityY > 400) {
    throw new Error(`Terminal velocity not enforced: ${ghost.velocityY} > 400`);
  }
  console.log("✓ Terminal velocity cap working correctly");
}

function testCollisionPreservation() {
  const ghost = new Ghost(100, 100, 30, 30, 600);
  
  // Test AABB collision
  const bounds1 = { left: 0, right: 50, top: 0, bottom: 50 };
  const bounds2 = { left: 25, right: 75, top: 25, bottom: 75 };
  
  // Mock GameEngine for collision testing
  const mockEngine = {
    aabbCollision: function(b1, b2) {
      return !(b1.right < b2.left || b1.left > b2.right || 
               b1.bottom < b2.top || b1.top > b2.bottom);
    }
  };
  
  if (!mockEngine.aabbCollision(bounds1, bounds2)) {
    throw new Error("AABB collision detection failed for overlapping bounds");
  }
  console.log("✓ Collision detection working correctly");
}
```

---

## Expected Outcomes

### Before Fix (Unfixed Code)
- Task 1: Test FAILS with ReferenceError when GameEngine tries to access this.themeManager
- Task 2: Tests may not be runnable if GameEngine initialization fails; if isolation is achieved, they establish baseline
- Game: Cannot launch; crashes on page load

### After Fix (Fixed Code)
- Task 1: Test PASSES; GameEngine initializes successfully, themeManager exists
- Task 2: Tests PASS; game mechanics verified to work correctly
- Task 3.3: Bug condition test (re-run of task 1) PASSES
- Task 3.4: Preservation tests (re-run of task 2) PASS
- Task 4: Game launches successfully, all features work

---

## Notes for Implementation

1. **Theme Data Structure**: Keep theme objects simple with just the necessary properties (name, colors, ghostSprite)
2. **Backwards Compatibility**: The default theme should use the existing ghost sprite path to maintain visual consistency
3. **Error Handling**: ThemeManager should handle invalid theme names gracefully (fallback to default)
4. **Testing Strategy**: Write tests in separate files that can run before the fix is applied to understand the bug
