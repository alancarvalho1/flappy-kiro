/**
 * Test runner for Game Over Overlay tests
 * Mocks browser APIs needed for Node.js execution
 */

// Mock document and localStorage for Node.js
global.document = {
  readyState: 'complete',
  getElementById: () => ({
    width: 800,
    height: 600,
    getContext: () => ({
      fillStyle: '',
      font: '',
      textAlign: 'left',
      fillRect: () => {},
      fillText: () => {},
      drawImage: () => {}
    })
  }),
  addEventListener: () => {}
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

global.Image = class Image {};
global.Audio = class Audio {};
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 16);
};

// Load game.js classes (but prevent auto-init)
const gameCode = require('fs').readFileSync('./game.js', 'utf8');
// Remove the auto-initialization part
const gameCodeWithoutInit = gameCode.replace(
  /if \(document\.readyState === 'loading'\)[\s\S]*?}\s*$/,
  ''
);
eval(gameCodeWithoutInit);

// Now load and run the tests
console.log('\n=== Running Game Over Overlay Tests ===\n');
require('./test-game-over-overlay.js');
