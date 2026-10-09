// Minimal test runner for Ghost physics

// Mock global objects
global.document = { readyState: 'loading', addEventListener: () => {}, getElementById: () => null };
global.Image = class { constructor() { this.src = ''; } };
global.requestAnimationFrame = (cb) => setImmediate(cb);
global.Audio = class { constructor(src) { this.src = src; this.currentTime = 0; } play() { return Promise.resolve(); } };

const fs = require('fs');
const vm = require('vm');

// Read game.js and remove initialization
let gameJS = fs.readFileSync('./game.js', 'utf8');
const initIdx = gameJS.indexOf('/**\n * Initialize game');
if (initIdx > 0) {
  gameJS = gameJS.substring(0, initIdx);
}

// Create a context with necessary globals
const context = Object.assign({}, global);
vm.runInThisContext(gameJS);

// Now the classes should be in global scope
// Test that classes exist
if (typeof Ghost === 'undefined') {
  console.error('ERROR: Ghost class not defined');
  console.log('Trying alternative approach...');
  eval(gameJS);
}

// Custom assertion helper that throws
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ============= TEST SUITE =============

function testGravityApplication() {
  const gravity = 600;
  const ghost = new Ghost(100, 100, 30, 30, gravity);
  ghost.jumpPower = 300;
  ghost.terminalVelocity = 400;

  assert(ghost.velocityY === 0, 'Initial velocityY should be 0');

  const deltaTime1 = 0.016;
  ghost.update(deltaTime1);
  const expectedVelocity1 = gravity * deltaTime1;
  assert(
    Math.abs(ghost.velocityY - expectedVelocity1) < 0.01,
    `After 1 frame: expected ${expectedVelocity1}, got ${ghost.velocityY}`
  );

  ghost.update(deltaTime1);
  const expectedVelocity2 = expectedVelocity1 + gravity * deltaTime1;
  assert(
    Math.abs(ghost.velocityY - expectedVelocity2) < 0.01,
    `After 2 frames: expected ${expectedVelocity2}, got ${ghost.velocityY}`
  );

  console.log('✓ testGravityApplication passed');
}

function testJumpVelocity() {
  const ghost = new Ghost(100, 100, 30, 30, 600);
  ghost.jumpPower = 300;
  ghost.terminalVelocity = 400;

  assert(ghost.velocityY === 0, 'Initial velocityY should be 0');

  ghost.jump();
  assert(ghost.velocityY === -300, `After jump: expected -300, got ${ghost.velocityY}`);

  ghost.update(0.016);
  const expectedAfterGravity = -300 + 600 * 0.016;
  assert(
    Math.abs(ghost.velocityY - expectedAfterGravity) < 0.01,
    `After gravity: expected ${expectedAfterGravity}, got ${ghost.velocityY}`
  );

  ghost.jump();
  assert(ghost.velocityY === -300, `After second jump: expected -300, got ${ghost.velocityY}`);

  console.log('✓ testJumpVelocity passed');
}

function testTerminalVelocity() {
  const ghost = new Ghost(100, 100, 30, 30, 600);
  ghost.jumpPower = 300;
  ghost.terminalVelocity = 400;

  let deltaTime = 0.016;
  for (let i = 0; i < 42; i++) {
    ghost.update(deltaTime);
  }

  assert(
    ghost.velocityY === ghost.terminalVelocity,
    `After 42 frames: expected ${ghost.terminalVelocity}, got ${ghost.velocityY}`
  );

  ghost.update(deltaTime);
  assert(
    ghost.velocityY === ghost.terminalVelocity,
    `Should stay at terminal velocity: got ${ghost.velocityY}`
  );

  console.log('✓ testTerminalVelocity passed');
}

function testPositionClamping() {
  const ghost = new Ghost(100, 100, 30, 30, 600);
  ghost.jumpPower = 300;
  ghost.terminalVelocity = 400;

  // Test top boundary - ghost goes above top (y becomes negative)
  ghost.y = -10;  // Out of bounds (negative)
  ghost.velocityY = -100;
  ghost.clampToBounds(0, 600);

  assert(ghost.y === 0, `At top: expected y=0, got y=${ghost.y}`);
  assert(ghost.velocityY === 0, `At top: expected velocityY=0, got ${ghost.velocityY}`);

  // Test bottom boundary - ghost goes below bottom
  ghost.y = 575; // y + height (30) = 605, exceeds 600
  ghost.velocityY = 100;
  ghost.clampToBounds(0, 600);

  assert(ghost.y === 570, `At bottom: expected y=570, got y=${ghost.y}`);
  assert(ghost.velocityY === 0, `At bottom: expected velocityY=0, got ${ghost.velocityY}`);

  // Test within bounds - no clamping needed
  ghost.y = 200;
  ghost.velocityY = 50;
  ghost.clampToBounds(0, 600);

  assert(ghost.y === 200, `Within bounds: y should not change, got ${ghost.y}`);
  assert(ghost.velocityY === 50, `Within bounds: velocityY should not change, got ${ghost.velocityY}`);

  // Test edge case: exactly at top boundary
  ghost.y = 0;
  ghost.velocityY = 100;
  ghost.clampToBounds(0, 600);

  assert(ghost.y === 0, `At exact top: should remain 0, got ${ghost.y}`);
  assert(ghost.velocityY === 100, `At exact top: velocity should not change, got ${ghost.velocityY}`);

  // Test edge case: exactly at bottom boundary
  ghost.y = 570; // With height 30, total is 600
  ghost.velocityY = 100;
  ghost.clampToBounds(0, 600);

  assert(ghost.y === 570, `At exact bottom: should remain 570, got ${ghost.y}`);
  assert(ghost.velocityY === 100, `At exact bottom: velocity should not change, got ${ghost.velocityY}`);

  console.log('✓ testPositionClamping passed');
}

function testVelocityResetOnClamping() {
  const ghost = new Ghost(100, 100, 30, 30, 600);
  ghost.jumpPower = 300;
  ghost.terminalVelocity = 400;

  // Test velocity reset at top
  ghost.y = -10;
  ghost.velocityY = -250;
  ghost.clampToBounds(0, 600);

  assert(ghost.velocityY === 0, `At top: velocity should reset, got ${ghost.velocityY}`);

  // Test velocity reset at bottom
  ghost.y = 610;
  ghost.velocityY = 300;
  ghost.clampToBounds(0, 600);

  assert(ghost.velocityY === 0, `At bottom: velocity should reset, got ${ghost.velocityY}`);

  // Test velocity NOT reset within bounds
  ghost.y = 200;
  ghost.velocityY = 150;
  ghost.clampToBounds(0, 600);

  assert(ghost.velocityY === 150, `Within bounds: velocity should not reset, got ${ghost.velocityY}`);

  console.log('✓ testVelocityResetOnClamping passed');
}

function testCombinedPhysicsSimulation() {
  const ghost = new Ghost(100, 300, 30, 30, 600);
  ghost.jumpPower = 300;
  ghost.terminalVelocity = 400;

  const deltaTime = 0.016;
  const initialY = ghost.y;

  // Fall for 0.5 seconds
  for (let i = 0; i < 31; i++) {
    ghost.update(deltaTime);
    ghost.clampToBounds(0, 600);
  }
  const yAfterFall = ghost.y;
  assert(yAfterFall > initialY, `Ghost should fall: y went from ${initialY} to ${yAfterFall}`);

  // Jump
  ghost.jump();
  assert(ghost.velocityY === -300, `After jump: expected -300, got ${ghost.velocityY}`);

  // Travel upward then downward
  let maxY = yAfterFall;
  for (let i = 0; i < 100; i++) {
    ghost.update(deltaTime);
    ghost.clampToBounds(0, 600);
    maxY = Math.min(maxY, ghost.y);
  }

  assert(maxY < yAfterFall, `Ghost should jump upward: reached ${maxY} from ${yAfterFall}`);

  console.log('✓ testCombinedPhysicsSimulation passed');
}

// Run all tests
console.log('=== Starting Ghost Physics Tests ===');
console.log('Requirements: 11.1, 11.2\n');

try {
  testGravityApplication();
  testJumpVelocity();
  testTerminalVelocity();
  testPositionClamping();
  testVelocityResetOnClamping();
  testCombinedPhysicsSimulation();

  console.log('\n=== All Ghost Physics Tests PASSED ✓ ===');
  console.log('Summary:');
  console.log('  ✓ Gravity application: Delta-time based acceleration');
  console.log('  ✓ Jump velocity: -jumpPower assignment');
  console.log('  ✓ Terminal velocity: 400 px/s cap');
  console.log('  ✓ Position clamping: Boundary constraints');
  console.log('  ✓ Velocity resets: Velocity nullification at boundaries');
  console.log('  ✓ Combined simulation: Realistic multi-frame physics');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.trace();
  process.exit(1);
}
