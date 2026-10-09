#!/usr/bin/env node

const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Setup browser globals
const mockCtx = {
  fillStyle: '',
  font: '',
  textAlign: '',
  fillRect: () => {},
  fillText: () => {},
  drawImage: () => {}
};

const mockCanvas = {
  width: 800,
  height: 600,
  getContext: () => mockCtx
};

const globalContext = {
  document: {
    readyState: 'complete',
    addEventListener: () => {},
    getElementById: () => mockCanvas
  },
  requestAnimationFrame: (fn) => { /* No-op */ },
  Image: class {
    constructor() {
      this.src = '';
    }
  },
  Audio: class {
    constructor(src) {
      this.src = src;
      this.currentTime = 0;
    }
    play() {
      return Promise.resolve();
    }
  },
  window: {}
};

// Create fresh localStorage
function createMockStorage() {
  return {
    storage: {},
    getItem(key) {
      return this.storage[key] || null;
    },
    setItem(key, value) {
      this.storage[key] = value.toString();
    },
    removeItem(key) {
      delete this.storage[key];
    },
    clear() {
      this.storage = {};
    }
  };
}

globalContext.localStorage = createMockStorage();

// Create VM context
const vmContext = vm.createContext(globalContext);

// Load game.js
const gameCode = fs.readFileSync('./game.js', 'utf8');

// Execute game code in context
vm.runInContext(gameCode, vmContext);

// Now we can access classes from the context
const GameEngine = vmContext.GameEngine;
const Ghost = vmContext.Ghost;
const Pipe = vmContext.Pipe;

// Test counter
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('=== End-to-End Tests (Task 31) ===\n');

// Test 1: Complete game flow
test('E2E: Complete game flow - start, jump, pass pipe, score, die, restart', () => {
  globalContext.localStorage = createMockStorage();
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  const gameEngine = new GameEngine(canvas);
  assert(gameEngine.state === 'PLAYING', 'Initial state should be PLAYING');
  assert(gameEngine.score === 0, 'Initial score should be 0');
  
  gameEngine.generatePipe();
  assert(gameEngine.pipes.length === 1, 'Should generate pipe');
  
  const pipe = gameEngine.pipes[0];
  const initialVelocity = gameEngine.ghost.velocityY;
  gameEngine.jump();
  assert(gameEngine.ghost.velocityY < initialVelocity, 'Jump should decrease velocity');
  
  pipe.x = 300;
  pipe.gapY = 250;
  gameEngine.ghost.x = 330;
  gameEngine.ghost.y = 270;
  gameEngine.updateScore();
  assert(gameEngine.score === 1, 'Score should increment');
  
  gameEngine.ghost.y = 590;
  gameEngine.update(0.016);
  assert(gameEngine.state === 'GAME_OVER', 'Should transition to GAME_OVER');
  assert(gameEngine.highScore === 1, 'High score should be updated');
  
  gameEngine.jump();
  assert(gameEngine.state === 'PLAYING', 'Should restart');
  assert(gameEngine.score === 0, 'Score should reset');
  assert(gameEngine.highScore === 1, 'High score should persist');
});

// Test 2: Multiple pipes and scoring
test('E2E: Multiple pipes and progressive scoring', () => {
  globalContext.localStorage = createMockStorage();
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  const gameEngine = new GameEngine(canvas);
  
  for (let i = 0; i < 3; i++) {
    gameEngine.generatePipe();
  }
  assert(gameEngine.pipes.length === 3, 'Should generate 3 pipes');
  
  gameEngine.pipes[0].x = 200;
  gameEngine.pipes[0].gapY = 250;
  gameEngine.ghost.x = 240;
  gameEngine.ghost.y = 270;
  gameEngine.updateScore();
  assert(gameEngine.score === 1, 'First pipe should score');
  
  gameEngine.pipes[1].x = 400;
  gameEngine.pipes[1].gapY = 300;
  gameEngine.ghost.x = 430;
  gameEngine.ghost.y = 320;
  gameEngine.updateScore();
  assert(gameEngine.score === 2, 'Second pipe should score');
  
  gameEngine.pipes[2].x = 600;
  gameEngine.pipes[2].gapY = 200;
  gameEngine.ghost.x = 630;
  gameEngine.ghost.y = 220;
  gameEngine.updateScore();
  assert(gameEngine.score === 3, 'Third pipe should score');
});

// Test 3: High score persistence
test('E2E: High score persistence across sessions', () => {
  globalContext.localStorage = createMockStorage();
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  let gameEngine = new GameEngine(canvas);
  gameEngine.score = 42;
  gameEngine.state = 'GAME_OVER';
  gameEngine.reset();
  assert(gameEngine.highScore === 42, 'High score should be 42');
  
  gameEngine = new GameEngine(canvas);
  assert(gameEngine.highScore === 42, 'High score should persist');
  
  gameEngine.score = 20;
  gameEngine.state = 'GAME_OVER';
  gameEngine.reset();
  assert(gameEngine.highScore === 42, 'High score should not decrease');
});

// Test 4: High score progression
test('E2E: High score increases on better performance', () => {
  globalContext.localStorage = createMockStorage();
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  let gameEngine = new GameEngine(canvas);
  gameEngine.score = 30;
  gameEngine.state = 'GAME_OVER';
  gameEngine.reset();
  assert(gameEngine.highScore === 30, 'High score should be 30');
  
  gameEngine = new GameEngine(canvas);
  gameEngine.score = 60;
  gameEngine.state = 'GAME_OVER';
  gameEngine.reset();
  assert(gameEngine.highScore === 60, 'High score should be 60');
  
  gameEngine = new GameEngine(canvas);
  gameEngine.score = 100;
  gameEngine.state = 'GAME_OVER';
  gameEngine.reset();
  assert(gameEngine.highScore === 100, 'High score should be 100');
});

// Test 5: Corrupted data recovery
test('E2E: Corrupted high score recovery', () => {
  globalContext.localStorage = createMockStorage();
  globalContext.localStorage.setItem('flappyKiroHighScore', 'corrupted-data{]');
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  let gameEngine = new GameEngine(canvas);
  assert(gameEngine.highScore === 0, 'Should recover to 0 on corruption');
  
  gameEngine.score = 75;
  gameEngine.state = 'GAME_OVER';
  gameEngine.reset();
  assert(gameEngine.highScore === 75, 'Should save new score');
  
  gameEngine = new GameEngine(canvas);
  assert(gameEngine.highScore === 75, 'Should load new score correctly');
});

// Test 6: Physics and audio
test('E2E: Complete session with physics, collision, and audio', () => {
  globalContext.localStorage = createMockStorage();
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  const gameEngine = new GameEngine(canvas);
  
  let jumpSoundPlayed = false;
  let gameOverSoundPlayed = false;
  
  gameEngine.audioManager.playJumpSound = () => {
    jumpSoundPlayed = true;
  };
  gameEngine.audioManager.playGameOverSound = () => {
    gameOverSoundPlayed = true;
  };
  
  gameEngine.state = 'PLAYING';
  gameEngine.jump();
  assert(jumpSoundPlayed === true, 'Jump sound should play');
  
  gameEngine.ghost.y = gameEngine.canvas.height - gameEngine.ghost.height;
  gameEngine.update(0.016);
  assert(gameEngine.state === 'GAME_OVER', 'Should transition to GAME_OVER');
  assert(gameOverSoundPlayed === true, 'Game over sound should play');
});

// Test 7: Multiple games in sequence
test('E2E: Multiple games in sequence', () => {
  globalContext.localStorage = createMockStorage();
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  const gameEngine = new GameEngine(canvas);
  
  gameEngine.state = 'GAME_OVER';
  gameEngine.jump();
  assert(gameEngine.state === 'PLAYING', 'Should restart to PLAYING');
  assert(gameEngine.score === 0, 'Score should reset');
  
  gameEngine.score = 25;
  gameEngine.state = 'GAME_OVER';
  
  gameEngine.jump();
  assert(gameEngine.state === 'PLAYING', 'Should restart to PLAYING');
  assert(gameEngine.score === 0, 'Score should reset');
  
  gameEngine.score = 50;
  gameEngine.state = 'GAME_OVER';
  assert(gameEngine.highScore === 50, 'High score should be 50');
  
  gameEngine.jump();
  assert(gameEngine.state === 'PLAYING', 'Should restart to PLAYING');
  assert(gameEngine.score === 0, 'Score should reset');
  assert(gameEngine.highScore === 50, 'High score should persist');
});

// Test 8: Boundary collision
test('E2E: Boundary collision detection throughout session', () => {
  globalContext.localStorage = createMockStorage();
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  const gameEngine = new GameEngine(canvas);
  
  gameEngine.ghost.y = 0;
  assert(gameEngine.checkCollisions() === true, 'Should detect ceiling collision');
  
  gameEngine.ghost.y = 300;
  gameEngine.ghost.y = gameEngine.canvas.height - gameEngine.ghost.height;
  assert(gameEngine.checkCollisions() === true, 'Should detect ground collision');
  
  gameEngine.ghost.y = 250;
  assert(gameEngine.checkCollisions() === false, 'Should not collide in safe zone');
});

// Test 9: Pipe lifecycle
test('E2E: Pipe lifecycle - generation, movement, recycling', () => {
  globalContext.localStorage = createMockStorage();
  const canvas = { width: 800, height: 600, getContext: () => mockCtx };
  
  const gameEngine = new GameEngine(canvas);
  
  gameEngine.generatePipe();
  assert(gameEngine.pipes.length === 1, 'Should generate pipe');
  assert(gameEngine.pipes[0].x === gameEngine.canvas.width, 'Pipe should start at right edge');
  
  gameEngine.update(1.0);
  assert(gameEngine.pipes.length === 1, 'Pipe should still exist after 1 second');
  
  while (gameEngine.pipes.length > 0 && gameEngine.pipes[0].x > -100) {
    gameEngine.update(0.5);
  }
  assert(gameEngine.pipes.length === 0, 'Pipe should be recycled when off-screen');
});

// Results
console.log(`\n=== Test Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n✅ All E2E tests PASSED!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests FAILED');
  process.exit(1);
}
