/**
 * Test Collision Detection - Task 15
 * Validates: Requirement 4.1 - Ghost vs Pipe collision using AABB
 * 
 * This test file focuses on validating that:
 * 1. The checkCollisions() method correctly detects collisions
 * 2. AABB collision detection is used correctly
 * 3. Both upper and lower pipe sections are tested
 */

const fs = require('fs');

// Mock browser globals
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: () => ({
    width: 800,
    height: 600,
    getContext: () => ({
      fillStyle: '',
      font: '',
      textAlign: '',
      fillRect: () => {},
      fillText: () => {},
      drawImage: () => {}
    })
  })
};

global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.Image = class { constructor() { this.src = ''; } };
global.Audio = class {
  constructor(src) { this.src = src; this.currentTime = 0; }
  play() { return Promise.resolve(); }
};

global.localStorage = {
  storage: {},
  getItem(key) { return this.storage[key] || null; },
  setItem(key, value) { this.storage[key] = value; },
  removeItem(key) { delete this.storage[key]; },
  clear() { this.storage = {}; }
};

// Load game code and make classes global
const gameCode = fs.readFileSync('./game.js', 'utf8');

// Create a wrapper function that puts classes in global scope
const wrappedCode = gameCode + `
global.GameObject = GameObject;
global.Ghost = Ghost;
global.Pipe = Pipe;
global.GameEngine = GameEngine;
global.AudioManager = AudioManager;
global.InputHandler = InputHandler;
`;

eval(wrappedCode);

// Test results tracker
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper function
function assert(condition, message) {
  totalTests++;
  if (!condition) {
    failedTests++;
    console.error(`✗ ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`✓ ${message}`);
  }
}

// Create mock canvas
function createMockCanvas() {
  return document.getElementById('gameCanvas');
}

console.log('====================================================');
console.log('Testing Collision Detection - Task 15');
console.log('Requirement 4.1: Ghost vs Pipe collision using AABB');
console.log('====================================================\n');

try {
  // Test 1: AABB Function - Basic Collision
  console.log('Test Suite 1: AABB Collision Function');
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    // Test overlapping rectangles
    const bounds1 = { left: 0, right: 100, top: 0, bottom: 100 };
    const bounds2 = { left: 50, right: 150, top: 50, bottom: 150 };
    
    assert(
      gameEngine.aabbCollision(bounds1, bounds2) === true,
      'AABB should detect overlapping rectangles'
    );
  }
  
  // Test 2: AABB Function - Non-overlapping
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const bounds1 = { left: 0, right: 100, top: 0, bottom: 100 };
    const bounds2 = { left: 200, right: 300, top: 200, bottom: 300 };
    
    assert(
      gameEngine.aabbCollision(bounds1, bounds2) === false,
      'AABB should not detect non-overlapping rectangles'
    );
  }
  
  // Test 3: AABB Function - Inner Rectangle
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const outer = { left: 0, right: 100, top: 0, bottom: 100 };
    const inner = { left: 25, right: 75, top: 25, bottom: 75 };
    
    assert(
      gameEngine.aabbCollision(outer, inner) === true,
      'AABB should detect inner rectangle collision'
    );
  }
  
  // Test 4: AABB Function - Edge touching (touching at boundary detects collision in this implementation)
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const bounds1 = { left: 0, right: 100, top: 0, bottom: 100 };
    const bounds2 = { left: 100, right: 200, top: 0, bottom: 100 };
    
    // When edges touch exactly (bounds1.right === bounds2.left),
    // AABB implementation detects this as a collision
    // This is common for inclusive boundary detection
    assert(
      gameEngine.aabbCollision(bounds1, bounds2) === true,
      'AABB detects collision when rectangles touch at edge (inclusive boundary)'
    );
  }
  
  console.log('\nTest Suite 2: Ghost vs Upper Pipe Collision');
  
  // Test 5: Ghost colliding with upper pipe section
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const pipe = new Pipe(400, 0, 80, 200, 120, 200, 800, 600);
    gameEngine.pipes = [pipe];
    
    // Position ghost in upper pipe section
    gameEngine.ghost.x = 420;
    gameEngine.ghost.y = 150; // Before gap at 200
    
    const ghostBounds = gameEngine.ghost.getBounds();
    const upperPipeBounds = pipe.getUpperPipeBounds();
    
    assert(
      gameEngine.aabbCollision(ghostBounds, upperPipeBounds) === true,
      'AABB should detect ghost in upper pipe section'
    );
  }
  
  // Test 6: Ghost in upper pipe via checkCollisions()
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const pipe = new Pipe(400, 0, 80, 200, 120, 200, 800, 600);
    gameEngine.pipes = [pipe];
    gameEngine.ghost.x = 420;
    gameEngine.ghost.y = 150;
    
    assert(
      gameEngine.checkCollisions() === true,
      'checkCollisions() should return true for upper pipe collision'
    );
  }
  
  console.log('\nTest Suite 3: Ghost vs Lower Pipe Collision');
  
  // Test 7: Ghost colliding with lower pipe section
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const pipe = new Pipe(400, 0, 80, 200, 120, 200, 800, 600);
    gameEngine.pipes = [pipe];
    
    // Position ghost in lower pipe section
    gameEngine.ghost.x = 420;
    gameEngine.ghost.y = 340; // After gap ends at 320
    
    const ghostBounds = gameEngine.ghost.getBounds();
    const lowerPipeBounds = pipe.getLowerPipeBounds();
    
    assert(
      gameEngine.aabbCollision(ghostBounds, lowerPipeBounds) === true,
      'AABB should detect ghost in lower pipe section'
    );
  }
  
  // Test 8: Ghost in lower pipe via checkCollisions()
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const pipe = new Pipe(400, 0, 80, 200, 120, 200, 800, 600);
    gameEngine.pipes = [pipe];
    gameEngine.ghost.x = 420;
    gameEngine.ghost.y = 340;
    
    assert(
      gameEngine.checkCollisions() === true,
      'checkCollisions() should return true for lower pipe collision'
    );
  }
  
  console.log('\nTest Suite 4: Ghost passing through pipe gap');
  
  // Test 9: Ghost safely passing through pipe gap
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const pipe = new Pipe(400, 0, 80, 200, 120, 200, 800, 600);
    gameEngine.pipes = [pipe];
    
    // Position ghost in center of gap
    gameEngine.ghost.x = 420;
    gameEngine.ghost.y = 250; // Center of gap (200-320)
    
    const ghostBounds = gameEngine.ghost.getBounds();
    const upperPipeBounds = pipe.getUpperPipeBounds();
    const lowerPipeBounds = pipe.getLowerPipeBounds();
    
    assert(
      gameEngine.aabbCollision(ghostBounds, upperPipeBounds) === false,
      'AABB should not detect collision when ghost in gap (upper section)'
    );
    
    assert(
      gameEngine.aabbCollision(ghostBounds, lowerPipeBounds) === false,
      'AABB should not detect collision when ghost in gap (lower section)'
    );
  }
  
  // Test 10: No collision when in gap via checkCollisions()
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const pipe = new Pipe(400, 0, 80, 200, 120, 200, 800, 600);
    gameEngine.pipes = [pipe];
    gameEngine.ghost.x = 420;
    gameEngine.ghost.y = 250;
    
    assert(
      gameEngine.checkCollisions() === false,
      'checkCollisions() should return false when ghost passes through gap'
    );
  }
  
  console.log('\nTest Suite 5: Ghost vs Boundaries');
  
  // Test 11: Ground collision
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.ghost.y = 570; // Bottom edge
    gameEngine.pipes = [];
    
    assert(
      gameEngine.checkCollisions() === true,
      'checkCollisions() should detect ground collision'
    );
  }
  
  // Test 12: Ceiling collision
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.ghost.y = 0; // Top edge
    gameEngine.pipes = [];
    
    assert(
      gameEngine.checkCollisions() === true,
      'checkCollisions() should detect ceiling collision'
    );
  }
  
  console.log('\nTest Suite 6: Multiple Pipes');
  
  // Test 13: Multiple pipes - collision with first
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const pipe1 = new Pipe(300, 0, 80, 150, 120, 200, 800, 600);
    const pipe2 = new Pipe(500, 0, 80, 250, 120, 200, 800, 600);
    gameEngine.pipes = [pipe1, pipe2];
    
    gameEngine.ghost.x = 310;
    gameEngine.ghost.y = 100; // In upper section of pipe1
    
    assert(
      gameEngine.checkCollisions() === true,
      'checkCollisions() should detect collision with first pipe in sequence'
    );
  }
  
  // Test 14: Multiple pipes - safe passage through second
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const pipe1 = new Pipe(300, 0, 80, 150, 120, 200, 800, 600);
    const pipe2 = new Pipe(500, 0, 80, 250, 120, 200, 800, 600);
    gameEngine.pipes = [pipe1, pipe2];
    
    gameEngine.ghost.x = 510;
    gameEngine.ghost.y = 280; // In gap of pipe2 (250-370)
    
    assert(
      gameEngine.checkCollisions() === false,
      'checkCollisions() should allow safe passage through gap in multiple pipes'
    );
  }
  
  console.log('\nTest Suite 7: AABB Implementation Verification');
  
  // Test 15: Verify AABB logic - horizontal separation (left)
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const bounds1 = { left: 100, right: 150, top: 0, bottom: 100 };
    const bounds2 = { left: 200, right: 250, top: 0, bottom: 100 };
    
    // bounds1.right < bounds2.left (150 < 200) -> no collision
    assert(
      gameEngine.aabbCollision(bounds1, bounds2) === false,
      'AABB should handle horizontal separation (left)'
    );
  }
  
  // Test 16: Verify AABB logic - horizontal separation (right)
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const bounds1 = { left: 200, right: 250, top: 0, bottom: 100 };
    const bounds2 = { left: 100, right: 150, top: 0, bottom: 100 };
    
    // bounds1.left > bounds2.right (200 > 150) -> no collision
    assert(
      gameEngine.aabbCollision(bounds1, bounds2) === false,
      'AABB should handle horizontal separation (right)'
    );
  }
  
  // Test 17: Verify AABB logic - vertical separation (top)
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const bounds1 = { left: 0, right: 100, top: 200, bottom: 250 };
    const bounds2 = { left: 0, right: 100, top: 0, bottom: 100 };
    
    // bounds1.top > bounds2.bottom (200 > 100) -> no collision
    assert(
      gameEngine.aabbCollision(bounds1, bounds2) === false,
      'AABB should handle vertical separation (top)'
    );
  }
  
  // Test 18: Verify AABB logic - vertical separation (bottom)
  {
    const canvas = createMockCanvas();
    const gameEngine = new GameEngine(canvas);
    
    const bounds1 = { left: 0, right: 100, top: 0, bottom: 100 };
    const bounds2 = { left: 0, right: 100, top: 200, bottom: 250 };
    
    // bounds1.bottom < bounds2.top (100 < 200) -> no collision
    assert(
      gameEngine.aabbCollision(bounds1, bounds2) === false,
      'AABB should handle vertical separation (bottom)'
    );
  }
  
  console.log('\n====================================================');
  console.log('TEST SUMMARY');
  console.log('====================================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✓`);
  console.log(`Failed: ${failedTests} ✗`);
  console.log('====================================================');
  
  if (failedTests === 0) {
    console.log('\n✓ ALL TESTS PASSED - Task 15 Implementation Validated');
    process.exit(0);
  } else {
    console.log('\n✗ SOME TESTS FAILED');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n✗ ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
