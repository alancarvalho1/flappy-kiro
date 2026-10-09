# Visual Effects Documentation - Flappy Kiro

## Overview

Flappy Kiro now includes a comprehensive particle system that provides visual feedback for key game events. Three distinct visual effects enhance the player's experience:

1. **Jump Effect** - Orange particles appear when the ghost jumps
2. **Gap Pass Effect** - Light blue particles burst when passing through a gap
3. **Collision Effect** - Red explosion particles appear on collision

## Implementation Details

### Particle Class

The `Particle` class represents individual visual elements:

```javascript
class Particle {
  constructor(x, y, vx, vy, color, size, lifetime)
}
```

**Properties:**
- `x, y` - Position on canvas
- `vx, vy` - Velocity (x and y components)
- `color` - RGB color string (e.g., "rgb(255, 200, 100)")
- `size` - Particle radius in pixels
- `lifetime` - Remaining time until particle expires (in seconds)
- `gravity` - Physics constant (300 px/s²)

**Methods:**
- `update(deltaTime)` - Updates position and lifetime with physics simulation
- `isAlive()` - Checks if particle is still active
- `render(ctx)` - Draws particle to canvas with fade-out effect

### ParticleSystem Class

The `ParticleSystem` manages all active particles and provides emission methods:

```javascript
class ParticleSystem {
  constructor()
  emitJumpEffect(x, y, count = 8)
  emitGapPassEffect(x, y)
  emitCollisionEffect(x, y)
  update(deltaTime)
  render(ctx)
  clear()
}
```

## Visual Effects Specification

### 1. Jump Effect (Orange Particles)

**Trigger:** When player presses spacebar during gameplay

**Characteristics:**
- **Count:** 8 particles
- **Color:** Orange `rgb(255, 200, 100)`
- **Lifetime:** 0.6 seconds
- **Emission Pattern:** Radial spread around ghost's center
- **Velocities:** 150-250 px/s with slight downward bias
- **Size:** 3-5 pixels
- **Gravity:** Applies during flight

**Visual Effect:** Particles spread outward from the ghost and gradually fall due to gravity while fading out.

### 2. Gap Pass Effect (Light Blue Particles)

**Trigger:** When ghost's center crosses pipe center while within gap

**Characteristics:**
- **Count:** 12 particles
- **Color:** Light blue `rgb(100, 200, 255)`
- **Lifetime:** 0.4 seconds
- **Emission Pattern:** Ring burst from gap center
- **Velocity:** 200 px/s in all directions (ring formation)
- **Size:** 2-3.5 pixels
- **Gravity:** Applies during flight

**Visual Effect:** Particles burst in all directions from the center of the gap, creating a flash/glow effect that quickly fades.

### 3. Collision Effect (Red Explosion)

**Trigger:** When ghost collides with pipes or boundaries

**Characteristics:**
- **Count:** 20 particles
- **Color:** Red `rgb(255, 100, 100)`
- **Lifetime:** 0.7 seconds
- **Emission Pattern:** Random directions (explosion)
- **Velocity:** 200-350 px/s in random directions
- **Size:** 3-5 pixels
- **Gravity:** Applies during flight

**Visual Effect:** Particles explode outward in random directions from collision point, creating a powerful impact feel as they gradually fade.

## Integration with Game Engine

### Particle System Initialization

```javascript
this.particleSystem = new ParticleSystem();
```

### Update Loop

Particles are updated every frame before rendering:

```javascript
this.particleSystem.update(deltaTime);
```

### Event Emission

**Jump Event (in `jump()` method):**
```javascript
const ghostCenterX = this.ghost.x + this.ghost.width / 2;
const ghostCenterY = this.ghost.y + this.ghost.height / 2;
this.particleSystem.emitJumpEffect(ghostCenterX, ghostCenterY);
```

**Gap Pass Event (in `updateScore()` method):**
```javascript
const ghostCenterX = this.ghost.x + this.ghost.width / 2;
const gapCenterY = pipe.gapY + pipe.gapHeight / 2;
this.particleSystem.emitGapPassEffect(ghostCenterX, gapCenterY);
```

**Collision Event (in `update()` method):**
```javascript
const ghostCenterX = this.ghost.x + this.ghost.width / 2;
const ghostCenterY = this.ghost.y + this.ghost.height / 2;
this.particleSystem.emitCollisionEffect(ghostCenterX, ghostCenterY);
```

### Rendering

Particles are rendered after pipes and ghost but before UI text:

```javascript
// Render order:
// 1. Background
// 2. Pipes
// 3. Ghost
// 4. Particles  <-- Here
// 5. Score text
// 6. Game over overlay
```

## Physics Simulation

### Particle Movement

Each frame, particles update their position and velocity:

```javascript
this.x += this.vx * deltaTime;
this.y += this.vy * deltaTime;
this.vy += this.gravity * deltaTime;  // Gravity acceleration
```

**Result:** Particles follow realistic ballistic trajectories with gravity.

### Opacity Fade

Particles fade out as they approach death:

```javascript
opacity = lifetime / maxLifetime  // 1.0 → 0.0
```

**Result:** Smooth visual fade-out over the particle's lifetime.

## Performance Considerations

### Memory Efficiency

- Particles are created only when effects are triggered
- Dead particles are removed from the array immediately
- Maximum particle count depends on effect frequency (typically <100 at any time)

### CPU Efficiency

- Update loop iterates only active particles (O(n) where n = active particles)
- Rendering uses canvas circles (no complex shapes)
- No texture loading or complex calculations

### Recommended Limits

- Typical session: 50-150 active particles at any time
- Per-effect: 8-20 particles
- No performance issues on modern browsers

## Testing

A comprehensive test suite is provided in `test-visual-effects.html`:

### Test Coverage

1. **Particle Class Tests**
   - Creation and initialization
   - Lifetime tracking
   - Death detection
   - Movement with gravity

2. **ParticleSystem Tests**
   - System initialization
   - Effect emission (all three types)
   - Particle update and removal
   - System clearing

3. **Effect Specification Tests**
   - Color verification
   - Particle count verification
   - Lifetime verification
   - Velocity patterns

### Running Tests

1. Open `test-visual-effects.html` in a web browser
2. Click "Run All Tests" to execute unit tests
3. Click "Test In-Game Effects" for manual testing instructions

### Manual Testing Checklist

- [ ] Jump Effect appears when pressing spacebar
- [ ] Orange particles emanate from ghost
- [ ] Particles fade out over ~0.6 seconds
- [ ] Gap Pass Effect appears when scoring
- [ ] Light blue particles burst from gap center
- [ ] Particles fade out over ~0.4 seconds
- [ ] Collision Effect appears on impact
- [ ] Red particles explode outward
- [ ] Particles fade out over ~0.7 seconds
- [ ] No performance degradation with multiple effects
- [ ] Effects work with different themes

## Configuration and Customization

### Adjustable Parameters

To customize effects, modify the ParticleSystem methods:

**Jump Effect:**
```javascript
emitJumpEffect(x, y, count = 8) {
  const speed = 150 + Math.random() * 100;  // Velocity range
  const particle = new Particle(x, y, vx, vy, 'rgb(255, 200, 100)', 3 + Math.random() * 2, 0.6);
}
```

**Gap Pass Effect:**
```javascript
emitGapPassEffect(x, y) {
  const speed = 200;  // Velocity
  const particle = new Particle(x, y, vx, vy, 'rgb(100, 200, 255)', 2 + Math.random() * 1.5, 0.4);
}
```

**Collision Effect:**
```javascript
emitCollisionEffect(x, y) {
  const speed = 200 + Math.random() * 150;  // Velocity range
  const particle = new Particle(x, y, vx, vy, 'rgb(255, 100, 100)', 3 + Math.random() * 2, 0.7);
}
```

### Theme Integration

Particle colors are hardcoded for consistency. To theme particles:

1. Add color properties to ThemeManager
2. Pass theme to emitEffect methods
3. Use theme colors instead of hardcoded RGB values

## Browser Compatibility

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Full support (performance may vary)

## Future Enhancements

Possible improvements for post-MVP iterations:

1. **Customizable Colors** - Theme-aware particle colors
2. **Trail Effects** - Ghost leaves particle trail while jumping
3. **Sound Integration** - Particle sounds synchronized with visuals
4. **Screen Shake** - Collision effect triggers subtle screen shake
5. **Combo Effects** - Special particles for scoring streaks
6. **Performance Metrics** - Display active particle count for debugging

## Conclusion

The particle system adds polish and visual feedback to Flappy Kiro, making the gameplay more engaging and responsive. The implementation is efficient, well-tested, and easily customizable for future enhancements.
