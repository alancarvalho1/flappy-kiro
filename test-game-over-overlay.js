/**
 * Test suite for Game Over Overlay - Task 27
 * Tests the visual rendering of the game over overlay
 * Validates: Requirement 4.5
 */

let currentBeforeEachFn = null;

function describe(name, tests) {
  console.group(name);
  currentBeforeEachFn = null;
  tests();
  console.groupEnd();
}

function test(name, fn) {
  try {
    if (typeof currentBeforeEachFn === 'function') {
      currentBeforeEachFn();
    }
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    console.error(`  ${error.stack}`);
  }
}

function beforeEach(fn) {
  currentBeforeEachFn = fn;
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toContain(expected) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    }
  };
}

/**
 * Utility to create a mock canvas with drawing operations tracking
 */
const createMockCanvasWithTracking = (width = 800, height = 600) => {
  const canvas = {
    width,
    height,
    operations: [],
    getContext: function() {
      const self = this;
      return {
        fillStyle: '',
        font: '',
        textAlign: 'left',
        
        fillRect: function(x, y, w, h) {
          self.operations.push({
            type: 'fillRect',
            x, y, w, h,
            fillStyle: this.fillStyle
          });
        },
        
        fillText: function(text, x, y) {
          self.operations.push({
            type: 'fillText',
            text, x, y,
            font: this.font,
            fillStyle: this.fillStyle,
            textAlign: this.textAlign
          });
        },
        
        drawImage: function(img, x, y, w, h) {
          self.operations.push({
            type: 'drawImage',
            x, y, w, h
          });
        }
      };
    }
  };
  return canvas;
};

/**
 * Game Over Overlay Tests - Task 27, Requirement 4.5
 * Tests overlay rendering based on game state
 */
describe('Game Over Overlay - Task 27 (Req 4.5)', () => {
  
  test('Overlay should NOT render when state is PLAYING', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    // Ensure state is PLAYING
    gameEngine.state = 'PLAYING';
    gameEngine.render();
    
    // Check that no overlay rectangle was drawn (the semi-transparent one)
    const overlayOps = canvas.operations.filter(op => 
      op.type === 'fillRect' && 
      op.fillStyle === 'rgba(0, 0, 0, 0.5)' &&
      op.w === 800 && op.h === 600
    );
    
    expect(overlayOps.length).toBe(0);
  });

  test('Overlay should render when state is GAME_OVER', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    // Set state to GAME_OVER
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    // Check that overlay rectangle was drawn
    const overlayOps = canvas.operations.filter(op => 
      op.type === 'fillRect' && 
      op.fillStyle === 'rgba(0, 0, 0, 0.5)' &&
      op.w === 800 && op.h === 600
    );
    
    expect(overlayOps.length).toBeGreaterThan(0);
  });

  test('Overlay should be semi-transparent black with correct opacity', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    // Find the overlay rectangle
    const overlayOps = canvas.operations.filter(op => 
      op.type === 'fillRect' && 
      op.fillStyle === 'rgba(0, 0, 0, 0.5)'
    );
    
    expect(overlayOps.length).toBeGreaterThan(0);
    
    const overlay = overlayOps[0];
    // Overlay should cover entire canvas
    expect(overlay.x).toBe(0);
    expect(overlay.y).toBe(0);
    expect(overlay.w).toBe(800);
    expect(overlay.h).toBe(600);
  });

  test('Overlay should cover full canvas dimensions', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    const overlayOps = canvas.operations.filter(op => 
      op.type === 'fillRect' && 
      op.fillStyle === 'rgba(0, 0, 0, 0.5)'
    );
    
    expect(overlayOps.length).toBeGreaterThan(0);
    
    const overlay = overlayOps[0];
    expect(overlay.w).toBe(canvas.width);
    expect(overlay.h).toBe(canvas.height);
  });

  test('Overlay should be drawn before text (render order)', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    // Find positions of overlay and text
    let overlayIndex = -1;
    let gameOverTextIndex = -1;
    
    for (let i = 0; i < canvas.operations.length; i++) {
      const op = canvas.operations[i];
      if (op.type === 'fillRect' && op.fillStyle === 'rgba(0, 0, 0, 0.5)') {
        overlayIndex = i;
      }
      if (op.type === 'fillText' && op.text === 'Game Over!') {
        gameOverTextIndex = i;
      }
    }
    
    // Overlay should be drawn before text
    expect(overlayIndex).toBeGreaterThanOrEqual(0);
    expect(gameOverTextIndex).toBeGreaterThan(overlayIndex);
  });

  test('Game Over text should display "Game Over!" in white', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    // Find "Game Over!" text
    const textOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Game Over!' &&
      op.fillStyle === '#ffffff'
    );
    
    expect(textOps.length).toBeGreaterThan(0);
  });

  test('Game Over text should be bold and 32px', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    // Find "Game Over!" text
    const textOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Game Over!'
    );
    
    expect(textOps.length).toBeGreaterThan(0);
    
    const textOp = textOps[0];
    expect(textOp.font).toContain('bold');
    expect(textOp.font).toContain('32px');
  });

  test('Game Over text should be centered horizontally', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    // Find "Game Over!" text
    const textOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Game Over!'
    );
    
    expect(textOps.length).toBeGreaterThan(0);
    
    const textOp = textOps[0];
    expect(textOp.x).toBe(canvas.width / 2);
    expect(textOp.textAlign).toBe('center');
  });

  test('Game Over text should be positioned in upper half of screen', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    const textOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Game Over!'
    );
    
    expect(textOps.length).toBeGreaterThan(0);
    
    const textOp = textOps[0];
    // Should be at canvas.height / 2 - 40
    expect(textOp.y).toBe(canvas.height / 2 - 40);
    expect(textOp.y).toBeLessThan(canvas.height / 2);
  });

  test('Restart prompt should display "Press SPACE to restart" in white', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    // Find restart prompt text
    const textOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Press SPACE to restart' &&
      op.fillStyle === '#ffffff'
    );
    
    expect(textOps.length).toBeGreaterThan(0);
  });

  test('Restart prompt should be 24px font', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    const textOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Press SPACE to restart'
    );
    
    expect(textOps.length).toBeGreaterThan(0);
    
    const textOp = textOps[0];
    expect(textOp.font).toContain('24px');
  });

  test('Restart prompt should be centered horizontally', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    const textOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Press SPACE to restart'
    );
    
    expect(textOps.length).toBeGreaterThan(0);
    
    const textOp = textOps[0];
    expect(textOp.x).toBe(canvas.width / 2);
    expect(textOp.textAlign).toBe('center');
  });

  test('Restart prompt should be positioned below "Game Over!" text', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    const gameOverOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Game Over!'
    );
    const restartOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Press SPACE to restart'
    );
    
    expect(gameOverOps.length).toBeGreaterThan(0);
    expect(restartOps.length).toBeGreaterThan(0);
    
    const gameOverY = gameOverOps[0].y;
    const restartY = restartOps[0].y;
    
    // Restart should be below game over text
    expect(restartY).toBeGreaterThan(gameOverY);
  });

  test('Restart prompt should be at canvas.height / 2 + 20', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    const textOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Press SPACE to restart'
    );
    
    expect(textOps.length).toBeGreaterThan(0);
    
    const textOp = textOps[0];
    expect(textOp.y).toBe(canvas.height / 2 + 20);
  });

  test('Overlay elements should only render when GAME_OVER state is set', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    // Test with PLAYING state
    gameEngine.state = 'PLAYING';
    gameEngine.render();
    let gameOverTextOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Game Over!'
    );
    expect(gameOverTextOps.length).toBe(0);
    
    // Clear operations
    canvas.operations = [];
    
    // Test with GAME_OVER state
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    gameOverTextOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Game Over!'
    );
    expect(gameOverTextOps.length).toBeGreaterThan(0);
  });

  test('textAlign should be reset to left after rendering centered text', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.render();
    
    // Find the operation where textAlign is reset to 'left'
    const resetOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.textAlign === 'left'
    );
    
    // Should have regular score text with left alignment
    expect(resetOps.length).toBeGreaterThan(0);
  });

  test('Complete overlay rendering sequence should be correct', () => {
    const canvas = createMockCanvasWithTracking(800, 600);
    const gameEngine = new GameEngine(canvas);
    
    gameEngine.state = 'GAME_OVER';
    gameEngine.score = 42;
    gameEngine.highScore = 100;
    gameEngine.render();
    
    // Expected operations in order:
    // 1. Sky background fillRect
    // 2. Pipes (if any)
    // 3. Ghost
    // 4. Score text (regular alignment)
    // 5. High score text (regular alignment)
    // 6. Overlay fillRect (semi-transparent)
    // 7. Game Over text (centered, bold 32px)
    // 8. Restart prompt (centered, 24px)
    // 9. textAlign reset to left
    
    // Verify overlay is present
    const overlayOps = canvas.operations.filter(op => 
      op.type === 'fillRect' && 
      op.fillStyle === 'rgba(0, 0, 0, 0.5)'
    );
    expect(overlayOps.length).toBeGreaterThan(0);
    
    // Verify both text elements
    const gameOverOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Game Over!'
    );
    const restartOps = canvas.operations.filter(op => 
      op.type === 'fillText' && 
      op.text === 'Press SPACE to restart'
    );
    
    expect(gameOverOps.length).toBeGreaterThan(0);
    expect(restartOps.length).toBeGreaterThan(0);
  });
});

// Helper function for test reporting
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected value to be greater than ${expected}, but got ${actual}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) {
        throw new Error(`Expected value to be >= ${expected}, but got ${actual}`);
      }
    },
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`Expected value to be less than ${expected}, but got ${actual}`);
      }
    },
    toContain(expected) {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    }
  };
}
