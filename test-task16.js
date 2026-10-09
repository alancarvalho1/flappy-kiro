// Quick test for Task 16: Ghost vs Boundary Collision
// Setup
global.document = { readyState: 'complete', addEventListener: () => {}, getElementById: () => null };
global.Image = class { constructor() { this.src = ''; } };
global.requestAnimationFrame = (cb) => setImmediate(cb);
global.Audio = class { constructor(src) { this.src = src; this.currentTime = 0; } play() { return Promise.resolve(); } };
global.localStorage = { storage: {}, getItem(k) { return this.storage[k] || null; }, setItem(k, v) { this.storage[k] = v; } };

const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('./game.js', 'utf8')
  .substring(0, fs.readFileSync('./game.js', 'utf8').indexOf('/**\n * Initialize game'));

// Run code in global context
vm.runInThisContext(code);

console.log('✓ Classes loaded successfully');
console.log('  - Ghost:', typeof Ghost);
console.log('  - Pipe:', typeof Pipe);
console.log('  - GameEngine:', typeof GameEngine);

// Mock canvas
const canvas = {
  width: 800,
  height: 600,
  getContext: () => ({ fillStyle: '', font: '', textAlign: '', fillRect: () => {}, fillText: () => {}, drawImage: () => {} })
};

const engine = new GameEngine(canvas);
console.log('\n✓ GameEngine created successfully');
console.log(`  - Ghost at: (${engine.ghost.x}, ${engine.ghost.y})`);
console.log(`  - Canvas: ${canvas.width}x${canvas.height}`);

// TEST 1: Ground collision
console.log('\n=== Test 1: Ground Collision ===');
engine.ghost.y = 570; // 570 + 30 = 600 (at ground)
engine.pipes = [];
const groundCollision = engine.checkCollisions();
console.log(`  Ground collision detected: ${groundCollision} (expected: true)`);
if (groundCollision) console.log('  ✓ PASS');
else throw new Error('Ground collision not detected!');

// TEST 2: Ceiling collision
console.log('\n=== Test 2: Ceiling Collision ===');
engine.ghost.y = 0; // top = 0 (at ceiling)
const ceilingCollision = engine.checkCollisions();
console.log(`  Ceiling collision detected: ${ceilingCollision} (expected: true)`);
if (ceilingCollision) console.log('  ✓ PASS');
else throw new Error('Ceiling collision not detected!');

// TEST 3: Safe zone
console.log('\n=== Test 3: Safe Zone ===');
engine.ghost.y = 250;
const safeCollision = engine.checkCollisions();
console.log(`  Collision in safe zone: ${safeCollision} (expected: false)`);
if (!safeCollision) console.log('  ✓ PASS');
else throw new Error('Unexpected collision in safe zone!');

// TEST 4: Velocity reset on clamp
console.log('\n=== Test 4: Velocity Reset on Boundary ===');
const ghost2 = new Ghost(100, -50, 30, 30, 600);
ghost2.velocityY = -200;
console.log(`  Before clamp: y=${ghost2.y}, velocityY=${ghost2.velocityY}`);
ghost2.clampToBounds(0, 600);
console.log(`  After clamp: y=${ghost2.y}, velocityY=${ghost2.velocityY} (expected: 0, 0)`);
if (ghost2.y === 0 && ghost2.velocityY === 0) console.log('  ✓ PASS');
else throw new Error('Velocity not reset on boundary!');

console.log('\n=== ALL TESTS PASSED ✓ ===');
console.log('Task 16: Ghost collision detection with boundaries is CORRECT');
console.log('Requirements 4.2 are satisfied');
