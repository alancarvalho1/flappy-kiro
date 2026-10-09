// Test runner for Flappy Kiro
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

// Mock requestAnimationFrame to not execute during tests
global.requestAnimationFrame = (fn) => { /* No-op during tests */ };

// Mock Image and Audio
global.Image = class {
  constructor() {
    this.src = '';
  }
};

global.Audio = class {
  constructor(src) {
    this.src = src;
    this.currentTime = 0;
  }
  play() {
    return Promise.resolve();
  }
};

// Mock localStorage
global.localStorage = {
  storage: {},
  getItem(key) {
    return this.storage[key] || null;
  },
  setItem(key, value) {
    this.storage[key] = value;
  },
  removeItem(key) {
    delete this.storage[key];
  },
  clear() {
    this.storage = {};
  }
};

// Global test state (declare before loading code)
var beforeEachFn = null;

// beforeEach function
global.beforeEach = (fn) => {
  beforeEachFn = fn;
};

// Load game code
const vm = require('vm');
const gameCode = fs.readFileSync('./game.js', 'utf8');
const testCode = fs.readFileSync('./game.test.js', 'utf8');

// Create a context that has access to global
const context = vm.createContext(global);

// Execute game code in context
vm.runInContext(gameCode, context);

// Execute test code in context
vm.runInContext(testCode, context);
