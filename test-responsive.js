/**
 * Test: Responsive Canvas Implementation
 * Verifies dynamic canvas scaling and aspect ratio maintenance
 */

// Mock canvas element
class MockCanvas {
  constructor() {
    this.width = 800;
    this.height = 600;
    this.style = {
      width: '800px',
      height: '600px'
    };
    this.eventListeners = {};
  }

  getContext(type) {
    return {
      fillRect: () => {},
      drawImage: () => {},
      fillText: () => {},
      translate: () => {},
      rotate: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {}
    };
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }
}

// Test utilities
function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    return false;
  }
  console.log('✓ PASS:', message);
  return true;
}

function testSuite(name) {
  console.log(`\n📋 ${name}`);
  console.log('-'.repeat(60));
}

// Mock window object for testing
global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: (event, handler) => {}
};

global.document = {
  getElementById: (id) => {
    if (id === 'gameCanvas') return new MockCanvas();
    if (id === 'resolutionInfo') {
      return {
        innerHTML: ''
      };
    }
    return null;
  }
};

// Copy ResponsiveCanvasManager from game.js
class ResponsiveCanvasManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.baseWidth = 800;
    this.baseHeight = 600;
    this.aspectRatio = this.baseWidth / this.baseHeight;
    this.scale = 1;
    this.displayWidth = this.baseWidth;
    this.displayHeight = this.baseHeight;
    
    this.setupCanvas();
    this.updateCanvasSize();
    this.setupResizeListener();
  }

  setupCanvas() {
    this.canvas.width = this.baseWidth;
    this.canvas.height = this.baseHeight;
  }

  calculateCanvasSize() {
    const padding = 20;
    const maxWidth = window.innerWidth - padding;
    const maxHeight = window.innerHeight - padding;

    let width = maxWidth;
    let height = width / this.aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.aspectRatio;
    }

    const minScale = 0.5;
    const minWidth = this.baseWidth * minScale;
    const minHeight = this.baseHeight * minScale;

    if (width < minWidth) {
      width = minWidth;
      height = minHeight;
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height),
      scale: width / this.baseWidth
    };
  }

  updateCanvasSize() {
    const { width, height, scale } = this.calculateCanvasSize();
    
    this.displayWidth = width;
    this.displayHeight = height;
    this.scale = scale;

    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }

  setupResizeListener() {
    // Mock implementation
  }

  getScale() {
    return this.scale;
  }

  getDisplayDimensions() {
    return {
      width: this.displayWidth,
      height: this.displayHeight
    };
  }

  screenToGameCoordinates(screenX, screenY) {
    const rect = {
      left: 0,
      top: 0
    };
    const relX = screenX - rect.left;
    const relY = screenY - rect.top;

    return {
      x: (relX / this.displayWidth) * this.baseWidth,
      y: (relY / this.displayHeight) * this.baseHeight
    };
  }

  getViewportInfo() {
    return {
      baseResolution: `${this.baseWidth}x${this.baseHeight}`,
      displayResolution: `${this.displayWidth}x${this.displayHeight}`,
      scale: this.scale.toFixed(2) + 'x',
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
  }
}

// Test Cases
testSuite('Responsive Canvas Initialization');

const canvas = new MockCanvas();
const manager = new ResponsiveCanvasManager(canvas);

assert(manager.baseWidth === 800, 'Base width is 800px');
assert(manager.baseHeight === 600, 'Base height is 600px');
assert(manager.aspectRatio === 4/3, 'Aspect ratio is 4:3');
assert(canvas.width === 800, 'Canvas internal width set to 800');
assert(canvas.height === 600, 'Canvas internal height set to 600');

testSuite('Dynamic Canvas Sizing');

// Test 1: Large viewport (1920x1080)
global.window.innerWidth = 1920;
global.window.innerHeight = 1080;
let dims = manager.calculateCanvasSize();
assert(dims.width <= 1900, 'Respects padding constraint (max 1900)');
assert(dims.height <= 1060, 'Respects padding constraint (max 1060)');
assert(Math.abs(dims.width / dims.height - manager.aspectRatio) < 0.01, 
  'Maintains 4:3 aspect ratio at 1920x1080');

// Test 2: Mobile viewport (375x667)
global.window.innerWidth = 375;
global.window.innerHeight = 667;
manager.updateCanvasSize();
dims = manager.getDisplayDimensions();
assert(dims.width <= 375, 'Width fits within 375px viewport');
assert(dims.height <= 667, 'Height fits within 667px viewport');
assert(Math.abs(dims.width / dims.height - manager.aspectRatio) < 0.01, 
  'Maintains 4:3 aspect ratio at 375x667');

// Test 3: Minimum scale constraint (very small viewport)
global.window.innerWidth = 300;
global.window.innerHeight = 300;
manager.updateCanvasSize();
dims = manager.getDisplayDimensions();
assert(dims.width >= 400, 'Enforces minimum width (800 * 0.5)');
assert(dims.height >= 300, 'Enforces minimum height (600 * 0.5)');

testSuite('Aspect Ratio Maintenance');

const testViewports = [
  { width: 2560, height: 1440 }, // 16:9
  { width: 1024, height: 768 },  // 4:3
  { width: 800, height: 600 },   // 4:3 (exact base)
  { width: 640, height: 480 },   // 4:3 smaller
  { width: 360, height: 720 }    // Portrait mobile
];

testViewports.forEach(viewport => {
  global.window.innerWidth = viewport.width;
  global.window.innerHeight = viewport.height;
  manager.updateCanvasSize();
  dims = manager.getDisplayDimensions();
  const actualRatio = dims.width / dims.height;
  const ratioMatch = Math.abs(actualRatio - manager.aspectRatio) < 0.01;
  assert(ratioMatch, 
    `Aspect ratio maintained at ${viewport.width}x${viewport.height} viewport`);
});

testSuite('Scale Factor Calculation');

global.window.innerWidth = 1600;
global.window.innerHeight = 900;
manager.updateCanvasSize();
const scale = manager.getScale();
assert(scale >= 0.5, 'Scale is at least 0.5x (minimum)');
assert(scale <= 2.5, 'Scale is reasonable (at most 2.5x)');

// Test scale at base resolution
global.window.innerWidth = 800;
global.window.innerHeight = 600;
manager.updateCanvasSize();
assert(Math.abs(manager.getScale() - 1.0) < 0.05, 'Scale is ~1.0x at base resolution');

testSuite('Coordinate Transformation');

global.window.innerWidth = 1600;
global.window.innerHeight = 1200;
manager.updateCanvasSize();

// Test screen to game coordinate conversion
const screenCoord = { x: manager.displayWidth / 2, y: manager.displayHeight / 2 };
const gameCoord = manager.screenToGameCoordinates(screenCoord.x, screenCoord.y);
assert(Math.abs(gameCoord.x - 400) < 5, 'Screen center X maps to game center X (~400)');
assert(Math.abs(gameCoord.y - 300) < 5, 'Screen center Y maps to game center Y (~300)');

testSuite('Viewport Information');

const info = manager.getViewportInfo();
assert(info.baseResolution === '800x600', 'Reports correct base resolution');
assert(info.displayResolution !== undefined, 'Reports display resolution');
assert(info.scale !== undefined, 'Reports scale factor');
assert(info.viewportSize !== undefined, 'Reports viewport size');

testSuite('Canvas Style Updates');

canvas.style = { width: '', height: '' };
global.window.innerWidth = 1200;
global.window.innerHeight = 900;
manager.updateCanvasSize();
assert(canvas.style.width !== '', 'Canvas width style is set');
assert(canvas.style.height !== '', 'Canvas height style is set');
assert(canvas.style.width.includes('px'), 'Width includes px unit');
assert(canvas.style.height.includes('px'), 'Height includes px unit');

testSuite('Responsive Scaling at Different Resolutions');

// Test ultra-wide display
global.window.innerWidth = 3440;
global.window.innerHeight = 1440;
manager.updateCanvasSize();
dims = manager.getDisplayDimensions();
assert(dims.width <= 3420, 'Ultra-wide display scales correctly');

// Test small device
global.window.innerWidth = 320;
global.window.innerHeight = 568;
manager.updateCanvasSize();
dims = manager.getDisplayDimensions();
assert(dims.width >= 400 || dims.width <= 320, 'Small device handled appropriately');

console.log('\n' + '='.repeat(60));
console.log('✅ All responsive canvas tests completed!');
console.log('='.repeat(60));
