/**
 * Headless verification for Flappy Kiro
 * Loads the real game.js with minimal browser mocks and checks gameplay behavior.
 *
 * Run: node test-final-verification.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// --- Minimal browser mocks -------------------------------------------------

function createEventTarget(extra = {}) {
  return Object.assign({
    listeners: {},
    addEventListener(type, fn) {
      (this.listeners[type] = this.listeners[type] || []).push(fn);
    },
    dispatch(type, props = {}) {
      const event = Object.assign({
        defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; }
      }, props);
      (this.listeners[type] || []).forEach((fn) => fn(event));
      return event;
    }
  }, extra);
}

// Canvas context: every drawing method is a no-op, properties are writable
function createContext2D() {
  return new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return () => ({ width: 0 });
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
}

function createCanvas({ reservedHeight = 150 } = {}) {
  const canvas = createEventTarget({
    width: 800,
    height: 600,
    style: {},
    offsetHeight: 606,
    getContext: () => createContext2D(),
    getBoundingClientRect: () => ({ left: 0, top: 0 })
  });
  // Container height = canvas + header/instructions around it
  canvas.parentElement = { offsetHeight: canvas.offsetHeight + reservedHeight };
  return canvas;
}

const storage = {};
const localStorageMock = {
  getItem: (key) => (Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null),
  setItem: (key, value) => { storage[key] = String(value); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
};

let audioPlays = [];
class AudioMock {
  constructor(src) { this.src = src; this.currentTime = 0; }
  play() { audioPlays.push(this.src); return Promise.resolve(); }
}

class ImageMock {
  constructor() { this.src = ''; this.onerror = null; }
}

const documentMock = createEventTarget({
  readyState: 'complete',
  // Returning null makes game.js skip its auto-start; tests create engines themselves
  getElementById: () => null
});

const sandbox = {
  console: { log() {}, warn() {}, error() {} }, // keep game logs out of the report
  document: documentMock,
  localStorage: localStorageMock,
  Audio: AudioMock,
  Image: ImageMock,
  requestAnimationFrame: () => {},
  setTimeout: () => {},
  innerWidth: 1366,
  innerHeight: 768
};
sandbox.window = sandbox;
sandbox.addEventListener = () => {};

const context = vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8'), context);
const { GameEngine, ThemeManager } = vm.runInContext('({ GameEngine, ThemeManager })', context);

// --- Test helpers ----------------------------------------------------------

let passed = 0;
let failed = 0;

function test(name, fn) {
  // Fresh state for every test
  localStorageMock.clear();
  documentMock.listeners = {};
  audioPlays = [];
  sandbox.innerWidth = 1366;
  sandbox.innerHeight = 768;
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (error) {
    console.log(`  FAIL  ${name}\n        ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function newEngine(canvasOptions) {
  const canvas = createCanvas(canvasOptions);
  const engine = new GameEngine(canvas);
  return { engine, canvas };
}

// Let the ghost fall until it hits the ground (no input)
function runUntilGameOver(engine, maxFrames = 600) {
  for (let i = 0; i < maxFrames && engine.state !== 'GAME_OVER'; i++) {
    engine.update(1 / 60);
  }
}

function pressSpace(props = {}) {
  return documentMock.dispatch('keydown', Object.assign({ code: 'Space', repeat: false }, props));
}

// --- Tests -----------------------------------------------------------------

console.log('\nFlappy Kiro - headless verification\n');

console.log('Start screen');
test('game starts on the start screen, not falling', () => {
  const { engine } = newEngine();
  assert(engine.state === 'INITIAL', `expected INITIAL, got ${engine.state}`);
  const startY = engine.ghostStartY;
  for (let i = 0; i < 180; i++) engine.update(1 / 60); // 3 seconds idle
  assert(engine.state === 'INITIAL', 'game should keep waiting for input');
  assert(Math.abs(engine.ghost.y - startY) <= 8.01, 'ghost should only hover around its start position');
  assert(engine.pipes.length === 0, 'no pipes before the run starts');
});

test('first Space press starts the run with a jump', () => {
  const { engine } = newEngine();
  pressSpace();
  assert(engine.state === 'PLAYING', `expected PLAYING, got ${engine.state}`);
  assert(engine.ghost.velocityY < 0, 'ghost should move up');
  assert(audioPlays.some((src) => src.includes('jump')), 'jump sound should play');
});

console.log('Input');
test('holding Space (auto-repeat) does not trigger extra jumps', () => {
  const { engine } = newEngine();
  pressSpace();
  engine.ghost.velocityY = 100; // falling
  engine.inputHandler.lastJumpTime = 0; // rule out the debounce
  const event = pressSpace({ repeat: true });
  assert(engine.ghost.velocityY === 100, 'repeat keydown must be ignored');
  assert(event.defaultPrevented, 'repeat keydown should still be prevented (no page scroll)');
});

test('Space keyup is prevented (focused buttons are not activated)', () => {
  newEngine();
  const event = documentMock.dispatch('keyup', { code: 'Space' });
  assert(event.defaultPrevented, 'keyup Space should be prevented');
});

test('tapping the canvas jumps (touch support)', () => {
  const { engine, canvas } = newEngine();
  const event = canvas.dispatch('pointerdown', { pointerType: 'touch', button: 0 });
  assert(engine.state === 'PLAYING', 'tap should start the run');
  assert(engine.ghost.velocityY < 0, 'tap should jump');
  assert(event.defaultPrevented, 'tap default should be prevented');
});

test('right mouse button does not jump', () => {
  const { engine, canvas } = newEngine();
  canvas.dispatch('pointerdown', { pointerType: 'mouse', button: 2 });
  assert(engine.state === 'INITIAL', 'right click should be ignored');
});

console.log('Game over and high score');
test('falling to the ground ends the game and plays the sound once', () => {
  const { engine } = newEngine();
  engine.jump();
  runUntilGameOver(engine);
  assert(engine.state === 'GAME_OVER', 'ghost should die on the ground');
  for (let i = 0; i < 30; i++) engine.update(1 / 60);
  const plays = audioPlays.filter((src) => src.includes('game_over')).length;
  assert(plays === 1, `game over sound should play once, played ${plays}`);
});

test('new high score is saved at game over, without restarting', () => {
  const { engine } = newEngine();
  engine.jump();
  engine.score = 7;
  runUntilGameOver(engine);
  assert(localStorageMock.getItem('flappyKiroHighScore') === '7', 'high score should be in localStorage');
  assert(engine.highScore === 7, 'engine high score should update');
  assert(engine.isNewHighScore === true, 'new record flag should be set');
});

test('lower score does not overwrite the record', () => {
  localStorageMock.setItem('flappyKiroHighScore', '10');
  const { engine } = newEngine();
  assert(engine.highScore === 10, 'stored record should load');
  engine.jump();
  engine.score = 3;
  runUntilGameOver(engine);
  assert(localStorageMock.getItem('flappyKiroHighScore') === '10', 'record must stay 10');
  assert(engine.isNewHighScore === false, 'no new record flag');
});

test('restart is ignored during the cooldown, then returns to the start screen', () => {
  const { engine } = newEngine();
  engine.jump();
  engine.score = 4;
  runUntilGameOver(engine);
  engine.jump();
  assert(engine.state === 'GAME_OVER', 'immediate press should not restart');
  engine.update(0.6);
  engine.jump();
  assert(engine.state === 'INITIAL', `expected INITIAL after restart, got ${engine.state}`);
  assert(engine.score === 0, 'score resets');
  assert(engine.highScore === 4, 'high score kept after restart');
  assert(engine.ghost.y === engine.ghostStartY, 'ghost back at start position');
});

console.log('Gameplay preservation');
test('passing through a gap scores exactly once', () => {
  const { engine } = newEngine();
  engine.jump();
  engine.ghost.gravity = 0;
  engine.ghost.velocityY = 0;
  const pipe = engine.acquirePipeFromPool();
  pipe.gapY = engine.ghost.y - 45; // 120px gap around the 30px ghost
  pipe.x = engine.ghost.x + engine.ghost.width / 2 - pipe.width / 2 + 2; // just before the center line
  pipe.scored = false;
  engine.pipes.push(pipe);
  for (let i = 0; i < 60; i++) engine.update(1 / 60);
  assert(engine.state === 'PLAYING', 'ghost inside the gap should not collide');
  assert(engine.score === 1, `expected score 1, got ${engine.score}`);
});

test('render works in every state and theme', () => {
  const { engine } = newEngine();
  for (const theme of engine.themeManager.getAvailableThemes()) {
    engine.setTheme(theme);
    engine.init();
    engine.render(); // INITIAL
    engine.jump();
    engine.render(); // PLAYING
    runUntilGameOver(engine);
    engine.update(0.6);
    engine.render(); // GAME_OVER
  }
});

console.log('Themes');
test('theme choice persists across reloads', () => {
  const tm = new ThemeManager();
  tm.setTheme('forest');
  assert(localStorageMock.getItem('flappyKiroTheme') === 'forest', 'theme should be saved');
  assert(new ThemeManager().currentTheme === 'forest', 'new manager should restore it');
});

test('invalid saved theme falls back to light', () => {
  localStorageMock.setItem('flappyKiroTheme', 'bogus');
  assert(new ThemeManager().currentTheme === 'light', 'should fall back to light');
});

test('dark theme overlay is dark (white text stays readable)', () => {
  const tm = new ThemeManager();
  const rgb = tm.themes.dark.overlayColor.match(/\d+/g).slice(0, 3).map(Number);
  assert(rgb.every((c) => c < 100), `overlay too light: ${rgb}`);
});

console.log('Responsive canvas');
test('canvas fits a laptop viewport including header and instructions', () => {
  sandbox.innerWidth = 1366;
  sandbox.innerHeight = 657;
  const { canvas } = newEngine({ reservedHeight: 150 });
  const width = parseInt(canvas.style.width, 10);
  const height = parseInt(canvas.style.height, 10);
  assert(height + 150 + 20 <= 657, `canvas too tall: ${height}px`);
  assert(Math.abs(width / height - 4 / 3) < 0.02, `aspect ratio off: ${width}x${height}`);
});

test('canvas fits a phone viewport without distortion', () => {
  sandbox.innerWidth = 375;
  sandbox.innerHeight = 667;
  const { canvas } = newEngine({ reservedHeight: 200 });
  const width = parseInt(canvas.style.width, 10);
  const height = parseInt(canvas.style.height, 10);
  assert(width <= 375 * 0.9, `canvas too wide: ${width}px`);
  assert(Math.abs(width / height - 4 / 3) < 0.02, `aspect ratio off: ${width}x${height}`);
});

// --- Summary ---------------------------------------------------------------

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
