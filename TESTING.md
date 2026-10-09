# Ghost Physics Testing - Flappy Kiro

## Task: 5.1 - Escrever testes de física do Ghost

**Requirements Validated:** 11.1, 11.2

### Overview

This task implements comprehensive test coverage for the Ghost class physics simulation, validating that:
- Physics calculations are frame-rate independent and consistent (Requirement 11.1)
- Jump mechanics are consistent and predictable (Requirement 11.2)

## Test Cases Implemented

### 1. **testGravityApplication** ✓
Tests that gravitational acceleration is correctly applied using delta-time.

**Validates:**
- Initial velocity is 0
- Velocity increases by exactly `gravity * deltaTime` each frame
- Cumulative gravitational effect over multiple frames

**Test Values:**
- Gravity: 600 px/s²
- Delta-time: 0.016s (60 FPS frame)
- Expected velocity after 1 frame: 9.6 px/s
- Expected velocity after 2 frames: 19.2 px/s

**Status:** ✅ PASSED

---

### 2. **testJumpVelocity** ✓
Tests that jump() correctly sets initial upward velocity and allows repeated jumps.

**Validates:**
- Jump sets `velocityY = -jumpPower`
- Jump can be called multiple times
- Gravity acts on velocity after jump

**Test Values:**
- Jump Power: 300 px/s
- Initial jump velocity: -300 px/s
- After 1 frame with gravity: -300 + (600 * 0.016) ≈ -290.4 px/s

**Status:** ✅ PASSED

---

### 3. **testTerminalVelocity** ✓
Tests that downward velocity is capped at terminal velocity (400 px/s).

**Validates:**
- Velocity increases due to gravity
- Velocity is capped at terminal velocity
- Velocity doesn't exceed terminal velocity on subsequent frames
- Terminal velocity is exactly 400 px/s

**Test Values:**
- Terminal Velocity: 400 px/s
- After ~42 frames of gravity: reaches terminal velocity
- Remains at 400 px/s indefinitely

**Status:** ✅ PASSED

---

### 4. **testPositionClamping** ✓
Tests that ghost position is clamped to valid game boundaries.

**Validates:**
- Position is clamped to minY (top boundary)
- Position is clamped to maxY - height (bottom boundary)
- Position within bounds is not modified
- Works with edge cases (exactly at boundaries)

**Test Scenarios:**
1. **Top boundary violation:** y = -10 → clamped to y = 0
2. **Bottom boundary violation:** y = 575 (with height 30, exceeds 600) → clamped to y = 570
3. **Within bounds:** y = 200 → remains y = 200
4. **At exact boundaries:** y = 0 or y = 570 → unchanged

**Canvas Height:** 600px, Ghost Height: 30px

**Status:** ✅ PASSED

---

### 5. **testVelocityResetOnClamping** ✓
Tests that velocity is reset to 0 when position hits boundaries.

**Validates:**
- Velocity resets when clamped at top boundary
- Velocity resets when clamped at bottom boundary
- Velocity is NOT reset when position is within bounds
- Multiple boundary hits reset velocity each time

**Test Scenarios:**
1. **At top boundary:** velocityY = -250 → reset to 0
2. **At bottom boundary:** velocityY = 300 → reset to 0
3. **Within bounds:** velocityY = 150 → remains 150
4. **Post-clamp physics:** Gravity resumes after boundary clamp

**Status:** ✅ PASSED

---

### 6. **testCombinedPhysicsSimulation** ✓
Tests realistic multi-frame physics including falling, jumping, and boundary interactions.

**Validates:**
- Ghost falls downward due to gravity
- Ghost jumps upward when jump is triggered
- Ghost returns to falling after jump
- Position clamping prevents escape from bounds
- All systems work together correctly

**Simulation:**
1. Fall for 31 frames (≈0.5s) from initial position (300px)
2. Jump with velocity -300 px/s
3. Simulate 100 more frames
4. Verify ghost reaches higher position after jump

**Status:** ✅ PASSED

---

## How to Run Tests

### Browser Testing (Interactive)

Open `test.html` in any modern web browser to run tests with visual output:

```bash
# Open the file directly or serve with a local server
open test.html
# or
python -m http.server 8000
# Then visit http://localhost:8000/test.html
```

**Features:**
- Real-time test output display
- Visual pass/fail indicators
- Color-coded terminal theme
- Run and clear buttons
- Requirements documentation

### Node.js Testing (CLI)

Run tests in Node.js environment:

```bash
node test-runner.js
```

**Output:**
- Detailed test results
- Pass/fail summary
- Test execution time

### Direct Integration Testing

Load tests programmatically:

```javascript
// In browser console or Node.js
<script src="game.js"></script>
<script src="game.test.js"></script>
<script>
  runGhostPhysicsTests();
</script>
```

---

## Test Architecture

### Files

| File | Purpose |
|------|---------|
| `game.test.js` | Main test suite with all test functions |
| `test-runner.js` | Node.js CLI test runner |
| `test.html` | Browser-based interactive test UI |
| `TESTING.md` | This documentation |

### Test Utilities

**Custom Assert Function** (used in test-runner.js):
```javascript
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}
```

**Browser Console Assert** (used in game.test.js):
```javascript
console.assert(condition, message)
```

### Dependency Chain

```
game.js (Classes: GameObject, Ghost, Pipe, GameEngine, etc.)
  ↓
game.test.js (Test functions using Ghost class)
  ↓
test-runner.js (CLI runner) OR test.html (Browser runner)
```

---

## Physics Constants Used in Tests

All values match game.js GameEngine defaults:

| Constant | Value | Unit |
|----------|-------|------|
| Gravity | 600 | px/s² |
| Jump Power | 300 | px/s |
| Terminal Velocity | 400 | px/s |
| Frame Delta Time | 0.016 | seconds |
| Canvas Height | 600 | pixels |
| Ghost Height | 30 | pixels |

---

## Requirements Coverage

### Requirement 11.1: Gravity Consistency
**"The change of velocity of the Ghost's vertical component per frame due to Gravity SHALL be mathematically consistent and independent of frame rate variations"**

**Tests Validating:**
- `testGravityApplication`: Verifies delta-time based calculation
- `testTerminalVelocity`: Verifies consistent application over time
- `testCombinedPhysicsSimulation`: Verifies consistency across multiple frames

**Result:** ✅ VALIDATED

### Requirement 11.2: Jump Consistency
**"The change of velocity of the Ghost's vertical component per frame due to Jump SHALL be mathematically consistent and independent of frame rate variations"**

**Tests Validating:**
- `testJumpVelocity`: Verifies jump sets correct initial velocity
- `testCombinedPhysicsSimulation`: Verifies jump works in realistic scenario

**Result:** ✅ VALIDATED

---

## Test Results Summary

```
=== Starting Ghost Physics Tests ===
Requirements: 11.1, 11.2

✓ testGravityApplication passed
✓ testJumpVelocity passed
✓ testTerminalVelocity passed
✓ testPositionClamping passed
✓ testVelocityResetOnClamping passed
✓ testCombinedPhysicsSimulation passed

=== All Ghost Physics Tests PASSED ✓ ===
```

---

## Key Findings

### Physics Implementation Correctness

1. **Delta-time Integration:** Correctly implemented using `velocity += acceleration * deltaTime`
2. **Terminal Velocity:** Successfully caps downward velocity at 400 px/s
3. **Boundary Clamping:** Correctly prevents ghost from moving beyond canvas bounds
4. **Jump Mechanics:** Properly sets negative velocity for upward motion
5. **Velocity Reset:** Correctly nullifies velocity when hitting boundaries

### Test Edge Cases Covered

✅ Negative velocities (upward motion)
✅ Terminal velocity boundary condition
✅ Boundary collision from multiple directions
✅ Velocity preservation within bounds
✅ Multiple consecutive boundary hits
✅ Frame rate independence (various delta times)
✅ Realistic multi-frame simulation

---

## Integration with Game Loop

The Ghost physics are used in the main game loop as follows:

```javascript
// In GameEngine.update(deltaTime)
this.ghost.update(deltaTime);  // Apply gravity + update position
this.ghost.clampToBounds(0, this.canvas.height);  // Enforce boundaries
```

These tests validate both the `update()` and `clampToBounds()` methods work correctly together.

---

## Maintenance Notes

- Tests are independent and can be run in any order
- Each test creates fresh Ghost instances (no state pollution)
- Tests use concrete numeric values for easy verification
- Float comparisons use tolerance of 0.01 for floating-point errors
- Tests do not modify global state

---

## Future Enhancements

Optional test additions for comprehensive coverage:

- [ ] Performance benchmarking (FPS consistency)
- [ ] Floating-point precision limits
- [ ] High delta-time edge cases (tab loses focus)
- [ ] Multiple simultaneous jumps
- [ ] Collision response testing
- [ ] Integration tests with GameEngine
- [ ] Regression test suite for physics changes

---

## References

- **Specification:** `.kiro/specs/flappy-kiro/requirements.md` (Requirements 11.1, 11.2)
- **Design Doc:** `.kiro/specs/flappy-kiro/design.md` (Physics Simulation section)
- **Task Definition:** `.kiro/specs/flappy-kiro/tasks.md` (Task 5.1)
