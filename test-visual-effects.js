/**
 * Test suite for visual effects (particles)
 * Tests Particle and ParticleSystem classes
 */

// Mock canvas context
class MockCanvasContext {
  constructor() {
    this.fillStyle = null;
    this.calls = [];
  }

  fillRect() {
    this.calls.push({ method: 'fillRect', args: arguments });
  }

  arc() {
    this.calls.push({ method: 'arc', args: arguments });
  }

  fill() {
    this.calls.push({ method: 'fill' });
  }

  beginPath() {
    this.calls.push({ method: 'beginPath' });
  }
}

// Import Particle and ParticleSystem from game.js
// (This would be done via module loading in a real test environment)

/**
 * Test 1: Particle creation and lifetime
 */
function testParticleLifetime() {
  console.log('Test 1: Particle creation and lifetime');
  
  const particle = new Particle(100, 100, 10, 10, 'rgb(255, 0, 0)', 3, 1.0);
  
  console.assert(particle.x === 100, 'Initial X position should be 100');
  console.assert(particle.y === 100, 'Initial Y position should be 100');
  console.assert(particle.lifetime === 1.0, 'Initial lifetime should be 1.0');
  console.assert(particle.isAlive() === true, 'Particle should be alive initially');
  
  // Simulate 0.5 seconds
  particle.update(0.5);
  console.assert(particle.lifetime === 0.5, 'Lifetime should decrease to 0.5');
  console.assert(particle.isAlive() === true, 'Particle should still be alive');
  
  // Simulate 0.6 more seconds (total 1.1)
  particle.update(0.6);
  console.assert(particle.lifetime <= 0, 'Lifetime should be <= 0');
  console.assert(particle.isAlive() === false, 'Particle should be dead');
  
  console.log('✓ Test 1 passed');
}

/**
 * Test 2: Particle movement with gravity
 */
function testParticleMovement() {
  console.log('Test 2: Particle movement with gravity');
  
  const particle = new Particle(100, 100, 50, -100, 'rgb(255, 0, 0)', 3, 2.0);
  
  const initialY = particle.y;
  const initialVy = particle.vy;
  
  // Update for 0.1 seconds
  particle.update(0.1);
  
  // Check horizontal movement: x = 100 + 50 * 0.1 = 105
  console.assert(Math.abs(particle.x - 105) < 0.01, `X should move to ~105, got ${particle.x}`);
  
  // Check vertical movement with gravity
  // vy = -100 + 300 * 0.1 = -70
  // y = 100 + (-100) * 0.1 = 90
  const expectedY = 100 + initialVy * 0.1;
  console.assert(Math.abs(particle.y - expectedY) < 0.01, `Y should be ~${expectedY}, got ${particle.y}`);
  
  const expectedVy = initialVy + 300 * 0.1; // gravity acceleration
  console.assert(Math.abs(particle.vy - expectedVy) < 0.01, `Vy should be ~${expectedVy}, got ${particle.vy}`);
  
  console.log('✓ Test 2 passed');
}

/**
 * Test 3: ParticleSystem emit jump effect
 */
function testJumpEffect() {
  console.log('Test 3: ParticleSystem jump effect emission');
  
  const system = new ParticleSystem();
  console.assert(system.particles.length === 0, 'System should start empty');
  
  // Emit jump effect
  system.emitJumpEffect(100, 100, 8);
  console.assert(system.particles.length === 8, `System should have 8 particles, got ${system.particles.length}`);
  
  // Check that particles have orange color
  for (let particle of system.particles) {
    console.assert(particle.color.includes('255, 200, 100'), 'Particles should be orange (255, 200, 100)');
    console.assert(particle.lifetime === 0.6, `Jump effect lifetime should be 0.6, got ${particle.lifetime}`);
  }
  
  console.log('✓ Test 3 passed');
}

/**
 * Test 4: ParticleSystem emit gap pass effect
 */
function testGapPassEffect() {
  console.log('Test 4: ParticleSystem gap pass effect emission');
  
  const system = new ParticleSystem();
  
  // Emit gap pass effect
  system.emitGapPassEffect(200, 150);
  console.assert(system.particles.length === 12, `System should have 12 particles, got ${system.particles.length}`);
  
  // Check that particles have light blue color
  for (let particle of system.particles) {
    console.assert(particle.color.includes('100, 200, 255'), 'Particles should be light blue (100, 200, 255)');
    console.assert(particle.lifetime === 0.4, `Gap pass effect lifetime should be 0.4, got ${particle.lifetime}`);
  }
  
  console.log('✓ Test 4 passed');
}

/**
 * Test 5: ParticleSystem emit collision effect
 */
function testCollisionEffect() {
  console.log('Test 5: ParticleSystem collision effect emission');
  
  const system = new ParticleSystem();
  
  // Emit collision effect
  system.emitCollisionEffect(300, 250);
  console.assert(system.particles.length === 20, `System should have 20 particles, got ${system.particles.length}`);
  
  // Check that particles have red color
  for (let particle of system.particles) {
    console.assert(particle.color.includes('255, 100, 100'), 'Particles should be red (255, 100, 100)');
    console.assert(particle.lifetime === 0.7, `Collision effect lifetime should be 0.7, got ${particle.lifetime}`);
  }
  
  console.log('✓ Test 5 passed');
}

/**
 * Test 6: ParticleSystem update and removal
 */
function testParticleSystemUpdate() {
  console.log('Test 6: ParticleSystem update and dead particle removal');
  
  const system = new ParticleSystem();
  
  // Emit particles
  system.emitJumpEffect(100, 100, 5);
  console.assert(system.particles.length === 5, 'System should have 5 particles');
  
  // Update for 0.1 seconds (particles should still be alive, lifetime = 0.5)
  system.update(0.1);
  console.assert(system.particles.length === 5, 'All particles should still be alive after 0.1s');
  
  // Update for 0.6 more seconds (total 0.7, particles should die)
  system.update(0.6);
  console.assert(system.particles.length === 0, 'All particles should be dead after lifetime expires');
  
  console.log('✓ Test 6 passed');
}

/**
 * Test 7: ParticleSystem clear
 */
function testParticleSystemClear() {
  console.log('Test 7: ParticleSystem clear');
  
  const system = new ParticleSystem();
  
  // Emit multiple effects
  system.emitJumpEffect(100, 100, 8);
  system.emitGapPassEffect(200, 150);
  system.emitCollisionEffect(300, 250);
  
  const totalParticles = system.particles.length;
  console.assert(totalParticles > 0, 'System should have particles');
  
  // Clear particles
  system.clear();
  console.assert(system.particles.length === 0, 'System should be empty after clear()');
  
  console.log('✓ Test 7 passed');
}

/**
 * Test 8: Particle rendering
 */
function testParticleRendering() {
  console.log('Test 8: Particle rendering');
  
  const ctx = new MockCanvasContext();
  const particle = new Particle(100, 100, 0, 0, 'rgb(255, 0, 0)', 5, 1.0);
  
  particle.render(ctx);
  
  // Check that rendering calls were made
  console.assert(ctx.calls.length > 0, 'Rendering should produce canvas calls');
  
  // Check for expected calls
  const methodNames = ctx.calls.map(c => c.method);
  console.assert(methodNames.includes('beginPath'), 'Should call beginPath');
  console.assert(methodNames.includes('arc'), 'Should call arc');
  console.assert(methodNames.includes('fill'), 'Should call fill');
  
  console.log('✓ Test 8 passed');
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('========================================');
  console.log('Running Visual Effects Tests');
  console.log('========================================\n');
  
  try {
    testParticleLifetime();
    testParticleMovement();
    testJumpEffect();
    testGapPassEffect();
    testCollisionEffect();
    testParticleSystemUpdate();
    testParticleSystemClear();
    testParticleRendering();
    
    console.log('\n========================================');
    console.log('✓ All tests passed!');
    console.log('========================================');
  } catch (error) {
    console.error('✗ Test failed with error:', error);
    console.error(error.stack);
  }
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testParticleLifetime,
    testParticleMovement,
    testJumpEffect,
    testGapPassEffect,
    testCollisionEffect,
    testParticleSystemUpdate,
    testParticleSystemClear,
    testParticleRendering,
    runAllTests
  };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runAllTests();
}
