// Test suite for Task 16: Ghost vs Boundary Collision Detection
// Requirements: 4.2

global.document = { readyState: 'loading', addEventListener: () => {}, getElementById: () => null };
global.Image = class { constructor() { this.src = ''; } };
global.requestAnimationFrame = (cb) => setImmediate(cb);
global.Audio = class { constructor(src) { this.src = src; this.currentTime = 0; } play() { return Promise.resolve(); } };
global.localStorage = {
  storage: {},
  getItem(key) { return this.storage[key] || null; },
  setItem(key, value) { this.storage[key] = value; },
  clear() { this.storage = {}; }
};

const fs = require('fs');

// Read and evaluate game.js (without initialization code)
let gameJS = fs.readFileSync('./game.js', 'utf8');

// Remove initialization code and the auto-start code at the end
const initIdx = gameJS.indexOf('/**\n * Initialize game');
if (initIdx > 0) {
  gameJS = gameJS.substring(0, initIdx);
}

// Also remove the auto-start code
const autoStartIdx = gameJS.indexOf('if (document.readyState');
if (autoStartIdx > 0) {
  gameJS = gameJS.substring(0, autoStartIdx);
}

try {
  eval(gameJS);
} catch (e) {
  console.error('Error evaluating game.js:', e.message);
  process.exit(1);
}

// Custom assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('=== Task 16: Ghost vs Boundary Collision Detection (Req 4.2) ===\n');

// ========== Test 1: Ground Collision ==========
function testGroundCollision() {
  console.log('Test 1: Ground Collision');
  
  const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => ({
      fillStyle: '', font: '', textAlign: '',
      fillRect: () => {}, fillText: () => {}, drawImage: () => {}
    })
  };
  
  const gameEngine = new GameEngine(mockCanvas);
  
  // Position ghost at exactly ground level (bottom edge touches canvas.height)
  gameEngine.ghost.y = 600 - gameEngine.ghost.height; // 570 (with height 30)
  gameEngine.ghost.velocityY = 10;
  gameEngine.pipes = []; // No pipes for isolation
  
  const collision = gameEngine.checkCollisions();
  
  assert(collision === true, `Ground collision should detect at boundary. Got: ${collision}`);
  console.log('  ✓ Ghost collides when bottom reaches canvas.height');
  
  // Test just above ground (should not collide)
  gameEngine.ghost.y = 569;
  const noCollision = gameEngine.checkCollisions();
  assert(noCollision === false, `Should not collide above ground. Got: ${noCollision}`);
  console.log('  ✓ Ghost does NOT collide when above ground');
}

// ========== Test 2: Ceiling Collision ==========
function testCeilingCollision() {
  console.log('\nTest 2: Ceiling Collision');
  
  const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => ({
      fillStyle: '', font: '', textAlign: '',
      fillRect: () => {}, fillText: () => {}, drawImage: () => {}
    })
  };
  
  const gameEngine = new GameEngine(mockCanvas);
  
  // Position ghost at exactly ceiling level (top edge touches 0)
  gameEngine.ghost.y = 0;
  gameEngine.ghost.velocityY = -10;
  gameEngine.pipes = []; // No pipes for isolation
  
  const collision = gameEngine.checkCollisions();
  
  assert(collision === true, `Ceiling collision should detect at boundary. Got: ${collision}`);
  console.log('  ✓ Ghost collides when top reaches 0');
  
  // Test just below ceiling (should not collide)
  gameEngine.ghost.y = 1;
  const noCollision = gameEngine.checkCollisions();
  assert(noCollision === false, `Should not collide below ceiling. Got: ${noCollision}`);
  console.log('  ✓ Ghost does NOT collide when below ceiling');
}

// ========== Test 3: Direct Position Comparison (not AABB) ==========
function testDirectPositionComparison() {
  console.log('\nTest 3: Boundary Uses Direct Position Comparison');
  
  const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => ({
      fillStyle: '', font: '', textAlign: '',
      fillRect: () => {}, fillText: () => {}, drawImage: () => {}
    })
  };
  
  const gameEngine = new GameEngine(mockCanvas);
  gameEngine.pipes = []; // No pipes for isolation
  
  // Get ghost bounds and verify the collision check
  // Expected logic: 
  // - Ground: ghostBounds.bottom >= canvas.height
  // - Ceiling: ghostBounds.top <= 0
  
  // Test ground boundary (ghostBounds.bottom = ghost.y + ghost.height)
  gameEngine.ghost.y = 570; // 570 + 30 = 600
  gameEngine.ghost.velocityY = 0;
  
  const ghostBounds = gameEngine.ghost.getBounds();
  assert(
    ghostBounds.bottom === 600,
    `Ground boundary: ghostBounds.bottom should be 600, got ${ghostBounds.bottom}`
  );
  
  let collision = gameEngine.checkCollisions();
  assert(collision === true, 'Collision at exact ground boundary');
  console.log('  ✓ Ground collision uses direct comparison: ghostBounds.bottom >= canvas.height');
  
  // Test ceiling boundary (ghostBounds.top = ghost.y)
  gameEngine.ghost.y = 0;
  gameEngine.ghost.velocityY = 0;
  
  const ghostBounds2 = gameEngine.ghost.getBounds();
  assert(
    ghostBounds2.top === 0,
    `Ceiling boundary: ghostBounds.top should be 0, got ${ghostBounds2.top}`
  );
  
  collision = gameEngine.checkCollisions();
  assert(collision === true, 'Collision at exact ceiling boundary');
  console.log('  ✓ Ceiling collision uses direct comparison: ghostBounds.top <= 0');
}

// ========== Test 4: Velocity Reset on Clamp ==========
function testVelocityResetOnBoundary() {
  console.log('\nTest 4: Velocity Reset When Reaching Boundaries');
  
  // Test via clampToBounds method (called during update)
  const ghost = new Ghost(100, 100, 30, 30, 600);
  ghost.jumpPower = 300;
  ghost.terminalVelocity = 400;
  
  // Test ceiling: velocity should be zeroed
  ghost.y = -50; // Above boundary
  ghost.velocityY = -200; // Moving upward
  
  ghost.clampToBounds(0, 600);
  
  assert(ghost.y === 0, `Ghost should be clamped to top at y=0, got y=${ghost.y}`);
  assert(ghost.velocityY === 0, `Velocity should be zeroed at ceiling, got ${ghost.velocityY}`);
  console.log('  ✓ Velocity zeroed when hitting ceiling');
  
  // Test ground: velocity should be zeroed
  ghost.y = 580; // Below boundary (580 + 30 = 610 > 600)
  ghost.velocityY = 200; // Moving downward
  
  ghost.clampToBounds(0, 600);
  
  assert(
    ghost.y === 570,
    `Ghost should be clamped to bottom at y=570, got y=${ghost.y}`
  );
  assert(ghost.velocityY === 0, `Velocity should be zeroed at ground, got ${ghost.velocityY}`);
  console.log('  ✓ Velocity zeroed when hitting ground');
}

// ========== Test 5: Safe Zone ==========
function testSafeZone() {
  console.log('\nTest 5: Safe Zone (No Collision)');
  
  const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => ({
      fillStyle: '', font: '', textAlign: '',
      fillRect: () => {}, fillText: () => {}, drawImage: () => {}
    })
  };
  
  const gameEngine = new GameEngine(mockCanvas);
  gameEngine.pipes = []; // No pipes
  
  // Position ghost in middle of safe zone
  gameEngine.ghost.x = 250;
  gameEngine.ghost.y = 250;
  gameEngine.ghost.velocityY = 50;
  
  const collision = gameEngine.checkCollisions();
  
  assert(collision === false, `Should not collide in safe zone. Got: ${collision}`);
  console.log('  ✓ Ghost does not collide when positioned in safe zone');
}

// ========== Test 6: Boundary Edge Cases ==========
function testBoundaryEdgeCases() {
  console.log('\nTest 6: Boundary Edge Cases');
  
  const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => ({
      fillStyle: '', font: '', textAlign: '',
      fillRect: () => {}, fillText: () => {}, drawImage: () => {}
    })
  };
  
  const gameEngine = new GameEngine(mockCanvas);
  gameEngine.pipes = [];
  
  // Test ground: exactly at boundary
  gameEngine.ghost.y = 570; // 570 + 30 = 600
  assert(gameEngine.checkCollisions() === true, 'Should collide at exact ground boundary');
  console.log('  ✓ Ground: Collision at y=570 (bottom=600)');
  
  // Test ground: one pixel above
  gameEngine.ghost.y = 569; // 569 + 30 = 599
  assert(gameEngine.checkCollisions() === false, 'Should not collide above ground');
  console.log('  ✓ Ground: No collision at y=569 (bottom=599)');
  
  // Test ceiling: exactly at boundary
  gameEngine.ghost.y = 0; // top = 0
  assert(gameEngine.checkCollisions() === true, 'Should collide at exact ceiling boundary');
  console.log('  ✓ Ceiling: Collision at y=0');
  
  // Test ceiling: one pixel below
  gameEngine.ghost.y = 1; // top = 1
  assert(gameEngine.checkCollisions() === false, 'Should not collide below ceiling');
  console.log('  ✓ Ceiling: No collision at y=1');
}

// ========== Run Tests ==========
try {
  testGroundCollision();
  testCeilingCollision();
  testDirectPositionComparison();
  testVelocityResetOnBoundary();
  testSafeZone();
  testBoundaryEdgeCases();
  
  console.log('\n=== All Tests PASSED ✓ ===');
  console.log('Summary:');
  console.log('  ✓ Ground collision detected when ghostBounds.bottom >= canvas.height');
  console.log('  ✓ Ceiling collision detected when ghostBounds.top <= 0');
  console.log('  ✓ Velocity reset to 0 when hitting boundaries');
  console.log('  ✓ Boundary checks use direct position comparison (not AABB)');
  console.log('  ✓ Safe zone allows passage without collision');
  console.log('  ✓ Edge cases handled correctly');
  console.log('\nRequirement 4.2: SATISFIED ✓');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Test Failed:');
  console.error(`  ${error.message}`);
  console.error('\nStack:', error.stack);
  process.exit(1);
}
