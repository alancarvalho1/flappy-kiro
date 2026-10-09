# Visual Effects Testing Guide

## Quick Start

### How to Test the Visual Effects

#### 1. **Open the Game**
- Navigate to the project directory
- Open `index.html` in a web browser
- The game will start automatically

#### 2. **Test Jump Effect (Orange Particles)**
Steps:
1. The game is running with the ghost visible
2. Press **SPACEBAR** to make the ghost jump
3. **Observe**: Orange particles should appear below the ghost
4. **Expected behavior**: 
   - 8 orange particles spread radially
   - Particles fall downward due to gravity
   - Fade out completely after ~0.6 seconds
5. Repeat several times to confirm consistent behavior

#### 3. **Test Gap Pass Effect (Light Blue Particles)**
Steps:
1. Play the game normally
2. Navigate the ghost through a pipe gap and score a point
3. **Observe**: Light blue particles burst at the gap center
4. **Expected behavior**:
   - 12 light blue particles burst outward
   - Particles spread in a ring pattern
   - Fade out completely after ~0.4 seconds
5. Score multiple points to see the effect multiple times

#### 4. **Test Collision Effect (Red Explosion)**
Steps:
1. Play the game
2. Intentionally collide with:
   - A pipe (upper or lower)
   - The ground (bottom)
   - The ceiling (top)
3. **Observe**: Red particles explode at the collision point
4. **Expected behavior**:
   - 20 red particles burst outward
   - Particles spread in random directions
   - Larger spread than other effects
   - Fade out completely after ~0.7 seconds

## Automated Testing

### Running Unit Tests

1. Open `test-visual-effects.html` in a web browser
2. Click the **"Run All Tests"** button
3. Tests will run and display results:
   - ✅ Green text = Test passed
   - ❌ Red text = Test failed
4. Review results in the output box

### Test Coverage

The automated tests verify:

**Particle Class:**
- ✅ Particle creation and initialization
- ✅ Lifetime tracking and countdown
- ✅ Death detection (isAlive() returns false when lifetime <= 0)
- ✅ Physics simulation (gravity acceleration)
- ✅ Position updates with velocity

**ParticleSystem Class:**
- ✅ System initialization and empty state
- ✅ Jump effect emission (8 orange particles)
- ✅ Gap pass effect emission (12 light blue particles)
- ✅ Collision effect emission (20 red particles)
- ✅ Particle update and lifecycle
- ✅ Dead particle removal
- ✅ System clear functionality

**Effect Specifications:**
- ✅ Correct particle colors
- ✅ Correct particle counts
- ✅ Correct particle lifetimes
- ✅ Color RGB values match specifications

## Visual Quality Checklist

### Jump Effect Quality
- [ ] Orange color is vibrant and recognizable
- [ ] Particles spread evenly around ghost
- [ ] Downward bias is subtle and natural
- [ ] Fade-out is smooth and continuous
- [ ] No visible "popping" of particles
- [ ] Size variation looks natural (3-5 pixels)

### Gap Pass Effect Quality
- [ ] Light blue color is distinct from surroundings
- [ ] Particles burst in clear ring pattern
- [ ] Effect is centered on gap
- [ ] Fade-out is quick but smooth
- [ ] Effect doesn't overwhelm the game visually
- [ ] Size variation is minimal (2-3.5 pixels)

### Collision Effect Quality
- [ ] Red color indicates danger/collision clearly
- [ ] Particles spread in all directions (explosion-like)
- [ ] Effect originates from collision point
- [ ] Longer lifetime (0.7s) feels impactful
- [ ] Larger particle count feels significant
- [ ] Size variation (3-5 pixels) looks appropriate

## Performance Testing

### Frame Rate Impact

1. Start the game
2. Open browser Developer Tools (F12)
3. Go to **Performance** tab
4. Record performance while:
   - Jumping frequently (triggering jump effects)
   - Scoring multiple times quickly
   - Allowing collisions
5. **Expected**: Consistent 60 FPS with minimal impact
6. **Maximum particles**: Should rarely exceed 150 at once

### Memory Usage

1. Open browser Developer Tools (F12)
2. Go to **Memory** tab
3. Take initial heap snapshot
4. Play for 5-10 minutes with frequent effects
5. Take final heap snapshot
6. Compare snapshots
7. **Expected**: No significant memory growth (< 5 MB increase)

## Edge Cases to Test

### 1. Rapid Jump Spam
- Press SPACEBAR repeatedly and rapidly
- Multiple jump effects should render simultaneously
- No performance degradation
- Particles should not interfere with each other

### 2. Simultaneous Effects
- Jump while passing through gap
- Effects should both display correctly
- Colors should be distinct
- No visual corruption

### 3. Collision During Jump
- Jump and immediately collide (e.g., with ceiling)
- Both jump particles and collision particles should display
- Collision effect should take precedence visually

### 4. Rapid Scoring
- Navigate through multiple gaps quickly
- Multiple gap pass effects should render
- Particles should not cause performance issues

### 5. Theme Changes
- Start game with Light theme
- During gameplay, change theme (T key or dropdown)
- Particles should still render correctly
- Particle visibility should not be affected

## Customization Testing

### Modifying Effect Parameters

To test customization, edit `game.js`:

#### Change Jump Effect Count
```javascript
// In emitJumpEffect, change:
for (let i = 0; i < count; i++) {
  // Was: 8 particles
  // Try: 16 for double particles
}
```

#### Change Particle Colors
```javascript
// In emitJumpEffect:
'rgb(255, 200, 100)' // Orange
// Try: 'rgb(255, 255, 0)' for yellow
```

#### Change Particle Lifetime
```javascript
// In Particle constructor:
0.6 // Jump lifetime
// Try: 1.0 for longer trails
```

## Comparison with Specification

### Jump Effect
- **Specification**: Efeito visual de partículas ao saltar
- **Implementation**: ✅ Orange particles emit on spacebar press
- **Matches**: Yes - clear jump feedback

### Gap Pass Effect
- **Specification**: Efeito visual ao passar por gap
- **Implementation**: ✅ Light blue particles burst at gap center
- **Matches**: Yes - feedback on successful navigation

### Collision Effect
- **Specification**: Efeito visual ao colidir
- **Implementation**: ✅ Red particles explode on collision
- **Matches**: Yes - clear end-game feedback

## Troubleshooting

### Problem: No particles appear

**Solutions:**
1. Check browser console (F12 → Console) for errors
2. Verify `assets/` folder exists with game files
3. Check that `game.js` loaded successfully (no red X on scripts)
4. Try refreshing the page (Ctrl+F5)
5. Try different browser

### Problem: Particles appear but don't move

**Solutions:**
1. Check if game physics are working (press spacebar, does ghost jump?)
2. Physics engine may be paused
3. Check browser console for errors
4. Verify deltaTime calculation is correct

### Problem: Particles disappear too quickly

**Solutions:**
1. This is likely correct behavior (0.4-0.7s lifetimes)
2. To verify: Open `test-visual-effects.html` and run tests
3. If tests pass, behavior is correct

### Problem: Frame rate drops during effects

**Solutions:**
1. Close other browser tabs to free memory
2. Try a different browser
3. Reduce particle counts (edit `game.js`)
4. Run on a more powerful machine

### Problem: Particles look wrong (wrong color, size, etc.)

**Solutions:**
1. Check browser's color accuracy settings
2. Verify RGB values in code match specification
3. Check that canvas rendering context is correct
4. Try on different display

## Success Criteria

You have successfully implemented visual effects if:

1. ✅ Jump effect (orange) appears when pressing spacebar
2. ✅ Gap pass effect (light blue) appears when scoring
3. ✅ Collision effect (red) appears on impact
4. ✅ All particles fade smoothly over their lifetime
5. ✅ Physics apply correctly (gravity pulls particles down)
6. ✅ No performance degradation (maintains 60 FPS)
7. ✅ All automated tests pass
8. ✅ Visual quality matches specification
9. ✅ No memory leaks over extended gameplay
10. ✅ Effects work with all themes

## Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review VISUAL_EFFECTS.md for technical details
3. Run automated tests in test-visual-effects.html
4. Check browser console for JavaScript errors
5. Verify game.js syntax: `node -c game.js`

---

**Last Updated:** 2024
**Status:** Ready for testing
