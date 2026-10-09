/**
 * Flappy Kiro - Main Game Implementation
 * Arcade retro game built with HTML5 Canvas and vanilla JavaScript
 * WITH DYNAMIC RESPONSIVE CANVAS SUPPORT
 */

/**
 * Responsive Canvas Manager - handles dynamic scaling and aspect ratio maintenance
 */
class ResponsiveCanvasManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.baseWidth = 800;   // Base resolution width
    this.baseHeight = 600;  // Base resolution height
    this.aspectRatio = this.baseWidth / this.baseHeight;
    this.scale = 1;
    this.displayWidth = this.baseWidth;
    this.displayHeight = this.baseHeight;
    
    this.setupCanvas();
    this.updateCanvasSize();
    this.setupResizeListener();
    this.displayResolutionInfo();
  }

  /**
   * Setup canvas initial properties
   */
  setupCanvas() {
    this.canvas.width = this.baseWidth;
    this.canvas.height = this.baseHeight;
  }

  /**
   * Calculate appropriate canvas size based on viewport
   * Maintains aspect ratio and respects maximum constraints
   */
  calculateCanvasSize() {
    const padding = 20;
    const maxWidth = window.innerWidth - padding;
    const maxHeight = window.innerHeight - padding;

    // Calculate size to fit within viewport while maintaining aspect ratio
    let width = maxWidth;
    let height = width / this.aspectRatio;

    // If height exceeds viewport, scale down based on height
    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.aspectRatio;
    }

    // Never scale below base resolution to maintain playability
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

  /**
   * Update canvas size and scaling
   */
  updateCanvasSize() {
    const { width, height, scale } = this.calculateCanvasSize();
    
    this.displayWidth = width;
    this.displayHeight = height;
    this.scale = scale;

    // Set canvas display size (CSS)
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    // Internal canvas resolution stays at base dimensions
    // This is handled by the canvas context automatically
    this.displayResolutionInfo();
  }

  /**
   * Display resolution information in the UI
   */
  displayResolutionInfo() {
    const resolutionInfo = document.getElementById('resolutionInfo');
    if (resolutionInfo) {
      const info = this.getViewportInfo();
      resolutionInfo.innerHTML = `Resolution: ${info.displayResolution} @ ${info.scale} scale`;
    }
  }

  /**
   * Setup window resize listener for responsive scaling
   */
  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.updateCanvasSize();
      // Signal that canvas was resized (game loop will handle redraw)
    });

    // Also handle orientation change for mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateCanvasSize(), 100);
    });
  }

  /**
   * Get scale factor for converting game coordinates to screen coordinates
   * @returns {number} Scale multiplier
   */
  getScale() {
    return this.scale;
  }

  /**
   * Get display dimensions (actual rendered size)
   * @returns {Object} Object with width and height
   */
  getDisplayDimensions() {
    return {
      width: this.displayWidth,
      height: this.displayHeight
    };
  }

  /**
   * Get game coordinates from screen coordinates (for mouse input, if needed)
   * @param {number} screenX - Screen X coordinate
   * @param {number} screenY - Screen Y coordinate
   * @returns {Object} Game coordinates
   */
  screenToGameCoordinates(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const relX = screenX - rect.left;
    const relY = screenY - rect.top;

    return {
      x: (relX / this.displayWidth) * this.baseWidth,
      y: (relY / this.displayHeight) * this.baseHeight
    };
  }

  /**
   * Get current viewport information
   * @returns {Object} Viewport info
   */
  getViewportInfo() {
    return {
      baseResolution: `${this.baseWidth}x${this.baseHeight}`,
      displayResolution: `${this.displayWidth}x${this.displayHeight}`,
      scale: this.scale.toFixed(2) + 'x',
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
  }
}

/**
 * Particle for visual effects
 */
class Particle {
  constructor(x, y, vx, vy, color, size, lifetime) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLifetime = lifetime;
    this.lifetime = lifetime;
    this.gravity = 300; // pixels/second²
  }

  /**
   * Update particle position and lifetime
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Apply gravity
    this.vy += this.gravity * deltaTime;

    // Decrease lifetime
    this.lifetime -= deltaTime;
  }

  /**
   * Check if particle is still alive
   * @returns {boolean} True if particle has lifetime remaining
   */
  isAlive() {
    return this.lifetime > 0;
  }

  /**
   * Render particle to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   */
  render(ctx) {
    // Calculate opacity based on remaining lifetime
    const opacity = Math.max(0, this.lifetime / this.maxLifetime);

    ctx.fillStyle = this.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Particle system manager
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Emit particles for jump effect (particles falling downward)
   * @param {number} x - Emission X position
   * @param {number} y - Emission Y position
   * @param {number} count - Number of particles to emit
   */
  emitJumpEffect(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 150 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed + 50; // Slight downward bias

      const particle = new Particle(
        x,
        y,
        vx,
        vy,
        'rgb(255, 200, 100)', // Orange color
        3 + Math.random() * 2,
        0.6 // 0.6 second lifetime
      );

      this.particles.push(particle);
    }
  }

  /**
   * Emit particles for gap pass effect (flash/glow effect)
   * @param {number} x - Emission X position
   * @param {number} y - Emission Y position
   */
  emitGapPassEffect(x, y) {
    // Create a ring of particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const particle = new Particle(
        x,
        y,
        vx,
        vy,
        'rgb(100, 200, 255)', // Light blue color
        2 + Math.random() * 1.5,
        0.4 // 0.4 second lifetime
      );

      this.particles.push(particle);
    }
  }

  /**
   * Emit particles for collision/explosion effect
   * @param {number} x - Emission X position
   * @param {number} y - Emission Y position
   */
  emitCollisionEffect(x, y) {
    // Create explosion effect with many particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 150;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const particle = new Particle(
        x,
        y,
        vx,
        vy,
        'rgb(255, 100, 100)', // Red color
        3 + Math.random() * 2,
        0.7 // 0.7 second lifetime
      );

      this.particles.push(particle);
    }
  }

  /**
   * Update all particles
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);

      // Remove dead particles
      if (!this.particles[i].isAlive()) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   */
  render(ctx) {
    for (let particle of this.particles) {
      particle.render(ctx);
    }
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }
}

/**
 * Base class for all game objects
 */
class GameObject {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Get axis-aligned bounding box (AABB) for collision detection
   * @returns {Object} Bounds object with left, right, top, bottom properties
   */
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }

  /**
   * Update object state (to be overridden by subclasses)
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {}

  /**
   * Render object to canvas (to be overridden by subclasses)
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   */
  render(ctx) {}
}

/**
 * Ghost character - player-controlled entity with physics
 */
class Ghost extends GameObject {
  constructor(x, y, width, height, gravity) {
    super(x, y, width, height);
    this.velocityY = 0;
    this.gravity = gravity;
    this.jumpPower = 0;
    this.terminalVelocity = 400;
    this.image = null;
    
    // Animation properties
    this.rotation = 0;
    this.targetRotation = 0;
    this.rotationSpeed = 12; // radians per second (controls rotation smoothness)
  }

  /**
   * Update ghost position and velocity based on physics
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Apply gravity to velocity
    this.velocityY += this.gravity * deltaTime;

    // Limit to terminal velocity (max fall speed)
    if (this.velocityY > this.terminalVelocity) {
      this.velocityY = this.terminalVelocity;
    }

    // Update position based on velocity
    this.y += this.velocityY * deltaTime;
    
    // Update rotation animation based on velocity
    this.updateRotation(deltaTime);
  }

  /**
   * Update ghost rotation smoothly based on vertical velocity
   * Creates a rotation animation effect that follows the ghost's movement state
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  updateRotation(deltaTime) {
    // Calculate target rotation based on velocity
    // Falling (positive velocity): rotate forward (0 to Math.PI/2)
    // Jumping (negative velocity): rotate backward (-Math.PI/2 to 0)
    // At rest or terminal velocity: neutral rotation
    
    const maxRotation = Math.PI / 2; // 90 degrees max
    const normalizedVelocity = this.velocityY / this.terminalVelocity; // -1 to 1
    
    // Map velocity to rotation angle
    this.targetRotation = normalizedVelocity * maxRotation;
    
    // Smoothly interpolate current rotation toward target rotation
    const rotationDifference = this.targetRotation - this.rotation;
    
    // Use smooth interpolation with rotation speed
    if (Math.abs(rotationDifference) > 0.01) {
      // Linear interpolation with max speed constraint
      const maxRotationChange = this.rotationSpeed * deltaTime;
      const rotationChange = Math.max(-maxRotationChange, Math.min(maxRotationChange, rotationDifference));
      this.rotation += rotationChange;
    } else {
      // Snap to target when very close to avoid jitter
      this.rotation = this.targetRotation;
    }
  }

  /**
   * Apply upward velocity for jump action
   */
  jump() {
    this.velocityY = -this.jumpPower;
  }

  /**
   * Clamp ghost position to game boundaries
   * @param {number} minY - Minimum Y position (top boundary)
   * @param {number} maxY - Maximum Y position (bottom boundary)
   */
  clampToBounds(minY, maxY) {
    if (this.y < minY) {
      this.y = minY;
      this.velocityY = 0;
    }
    if (this.y + this.height > maxY) {
      this.y = maxY - this.height;
      this.velocityY = 0;
    }
  }

  /**
   * Render ghost to canvas with rotation animation
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   */
  render(ctx) {
    ctx.save();
    
    // Move to ghost center for rotation
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);
    ctx.translate(-this.width / 2, -this.height / 2);
    
    if (this.image) {
      ctx.drawImage(this.image, 0, 0, this.width, this.height);
    } else {
      // Fallback: draw ghost shape if image not loaded
      ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height / 3, this.width / 2, Math.PI, 0);
      ctx.lineTo(this.width, this.height * 0.8);
      ctx.lineTo(this.width * 0.85, this.height);
      ctx.lineTo(this.width * 0.7, this.height * 0.75);
      ctx.lineTo(this.width * 0.55, this.height);
      ctx.lineTo(this.width * 0.4, this.height * 0.75);
      ctx.lineTo(this.width * 0.25, this.height);
      ctx.lineTo(this.width * 0.1, this.height * 0.8);
      ctx.lineTo(0, this.height * 0.8);
      ctx.lineTo(0, this.height / 3);
      ctx.fill();
      
      // Draw eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(this.width * 0.35, this.height * 0.35, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.width * 0.65, this.height * 0.35, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

/**
 * Pipe obstacle with passable gap
 */
class Pipe extends GameObject {
  constructor(x, y, width, gapY, gapHeight, pipeSpeed, canvasWidth, canvasHeight) {
    super(x, y, width, canvasHeight);
    this.gapY = gapY;
    this.gapHeight = gapHeight;
    this.speed = pipeSpeed;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.scored = false;
  }

  /**
   * Update pipe position based on movement speed
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    this.x -= this.speed * deltaTime;
  }

  /**
   * Check if pipe has moved completely off screen
   * @returns {boolean} True if pipe is off screen
   */
  isOffScreen() {
    return this.x + this.width < 0;
  }

  /**
   * Get bounds of the passable gap
   * @returns {Object} Gap bounds with top, bottom, centerX properties
   */
  getGapBounds() {
    return {
      top: this.gapY,
      bottom: this.gapY + this.gapHeight,
      centerX: this.x + this.width / 2
    };
  }

  /**
   * Get bounds of upper pipe section
   * @returns {Object} Upper pipe bounds
   */
  getUpperPipeBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: 0,
      bottom: this.gapY
    };
  }

  /**
   * Get bounds of lower pipe section
   * @returns {Object} Lower pipe bounds
   */
  getLowerPipeBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.gapY + this.gapHeight,
      bottom: this.canvasHeight
    };
  }

  /**
   * Render pipe to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {Object} theme - Theme object with pipeColor property
   */
  render(ctx, theme) {
    const pipeColor = theme ? theme.pipeColor : '#2ecc71';
    ctx.fillStyle = pipeColor;

    // Render upper pipe section
    ctx.fillRect(this.x, 0, this.width, this.gapY);

    // Render lower pipe section
    ctx.fillRect(
      this.x,
      this.gapY + this.gapHeight,
      this.width,
      this.canvasHeight - (this.gapY + this.gapHeight)
    );
  }
}

/**
 * Audio manager for playing game sounds
 */
class AudioManager {
  constructor() {
    this.jumpAudio = null;
    this.gameOverAudio = null;
    this.audioAvailable = true;
    this.isMuted = this.loadMutePreference();
    this.loadAudio();
  }

  /**
   * Load audio files
   */
  loadAudio() {
    try {
      this.jumpAudio = new Audio('assets/jump.wav');
      this.gameOverAudio = new Audio('assets/game_over.wav');
    } catch (e) {
      this.audioAvailable = false;
    }
  }

  /**
   * Load mute preference from localStorage
   * @returns {boolean} True if audio is muted, false otherwise
   */
  loadMutePreference() {
    try {
      const stored = localStorage.getItem('flappyKiroAudioMuted');
      if (stored === null) return false; // Default to unmuted
      return JSON.parse(stored) === true;
    } catch (e) {
      return false; // Default to unmuted on error
    }
  }

  /**
   * Save mute preference to localStorage
   * @param {boolean} isMuted - Whether audio is muted
   */
  saveMutePreference(isMuted) {
    try {
      localStorage.setItem('flappyKiroAudioMuted', JSON.stringify(isMuted));
    } catch (e) {
      console.error('Failed to save mute preference:', e);
    }
  }

  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveMutePreference(this.isMuted);
    return this.isMuted;
  }

  /**
   * Set mute state
   * @param {boolean} muted - Whether to mute
   */
  setMuted(muted) {
    this.isMuted = muted;
    this.saveMutePreference(this.isMuted);
  }

  /**
   * Check if audio is muted
   * @returns {boolean} True if muted, false if unmuted
   */
  getMuteState() {
    return this.isMuted;
  }

  /**
   * Play jump sound effect
   */
  playJumpSound() {
    if (!this.audioAvailable || !this.jumpAudio || this.isMuted) return;
    try {
      this.jumpAudio.currentTime = 0;
      this.jumpAudio.play().catch(() => {});
    } catch (e) {
      // Silent failure
    }
  }

  /**
   * Play game over sound effect
   */
  playGameOverSound() {
    if (!this.audioAvailable || !this.gameOverAudio || this.isMuted) return;
    try {
      this.gameOverAudio.currentTime = 0;
      this.gameOverAudio.play().catch(() => {});
    } catch (e) {
      // Silent failure
    }
  }
}

/**
 * UI Controller for managing user interface elements
 */
class UIController {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.muteButton = document.getElementById('muteButton');
    this.muteIcon = document.getElementById('muteIcon');
    
    if (this.muteButton) {
      this.setupListeners();
      this.updateMuteIcon();
    }
  }

  /**
   * Setup event listeners for UI elements
   */
  setupListeners() {
    this.muteButton.addEventListener('click', () => {
      this.audioManager.toggleMute();
      this.updateMuteIcon();
    });
  }

  /**
   * Update mute button icon based on current mute state
   */
  updateMuteIcon() {
    if (this.muteButton && this.muteIcon) {
      if (this.audioManager.getMuteState()) {
        this.muteIcon.textContent = '🔇';
      } else {
        this.muteIcon.textContent = '🔊';
      }
    }
  }
}

/**
 * Input handler for keyboard events
 */
class InputHandler {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.lastJumpTime = 0;
    this.jumpDebounceDelay = 0.05; // 50ms debounce to prevent rapid multiple jumps
    this.setupListeners();
  }

  /**
   * Setup keyboard event listeners
   */
  setupListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        
        // Apply debouncing to prevent multiple rapid jump firings
        const currentTime = Date.now();
        if (currentTime - this.lastJumpTime > this.jumpDebounceDelay * 1000) {
          this.lastJumpTime = currentTime;
          this.gameEngine.jump();
        }
      }
    });
  }
}

/**
 * Theme manager for managing game themes
 */
class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    
    // Define available themes
    this.themes = {
      light: {
        name: 'light',
        skyColor: '#87ceeb',
        textColor: '#000000',
        pipeColor: '#2ecc71',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        ghostSprite: 'assets/ghosty.png'
      },
      dark: {
        name: 'dark',
        skyColor: '#1a1a2e',
        textColor: '#ffffff',
        pipeColor: '#ff6b6b',
        overlayColor: 'rgba(255, 255, 255, 0.5)',
        ghostSprite: 'assets/ghosty.png'
      },
      forest: {
        name: 'forest',
        skyColor: '#2d5016',
        textColor: '#90ee90',
        pipeColor: '#228b22',
        overlayColor: 'rgba(0, 100, 0, 0.5)',
        ghostSprite: 'assets/ghosty.png'
      },
      sunset: {
        name: 'sunset',
        skyColor: '#ff6b3d',
        textColor: '#fff8dc',
        pipeColor: '#ff4500',
        overlayColor: 'rgba(255, 69, 0, 0.5)',
        ghostSprite: 'assets/ghosty.png'
      }
    };
  }

  /**
   * Get the current theme object
   * @returns {Object} Current theme configuration
   */
  getTheme() {
    return this.themes[this.currentTheme];
  }

  /**
   * Get available theme names
   * @returns {Array<string>} Array of theme names
   */
  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  /**
   * Set current theme
   * @param {string} themeName - Name of theme to set
   */
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
    } else {
      console.warn(`Theme '${themeName}' not found. Using default theme.`);
      this.currentTheme = 'light';
    }
  }
}

/**
 * Main game engine - manages game state, physics, collisions, and rendering
 */
class GameEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');

    // Responsive canvas manager
    this.responsiveManager = new ResponsiveCanvasManager(this.canvas);

    // Game state
    this.state = 'INITIAL'; // INITIAL, PLAYING, GAME_OVER
    this.score = 0;
    this.highScore = this.loadHighScore();

    // Game objects
    this.ghost = null;
    this.pipes = [];
    this.pipePool = []; // Object pool for pipe recycling (optimization)
    this.maxPoolSize = 10; // Maximum pipes to keep in pool

    // Physics constants
    this.gravity = 600; // pixels/second²
    this.jumpPower = 300; // pixels/second
    this.terminalVelocity = 400; // pixels/second
    this.pipeSpeed = 200; // pixels/second
    this.gapHeight = 120; // pixels
    this.pipeWidth = 80; // pixels

    // Timing
    this.lastPipeTime = 0;
    this.pipeInterval = 2.5; // seconds between pipe generation
    this.lastFrameTime = Date.now();
    this.maxDeltaTime = 0.1; // Max delta time cap (100ms)

    // Animation state
    this.gameOverAlpha = 0; // Opacity of game over overlay (0 to 1)
    this.gameOverAnimationDuration = 0.3; // seconds for fade-in
    this.gameOverAnimationTime = 0; // current animation time

    // Sub-systems
    this.audioManager = new AudioManager();
    this.inputHandler = new InputHandler(this);
    this.particleSystem = new ParticleSystem();
    this.uiController = new UIController(this.audioManager);
    this.themeManager = new ThemeManager();

    // Initialize game
    this.init();
  }

  /**
   * Initialize or reset game state
   */
  init() {
    const ghostX = this.canvas.width * 0.25;
    const ghostY = this.canvas.height / 2 - 15;
    const ghostSize = 30;

    this.ghost = new Ghost(ghostX, ghostY, ghostSize, ghostSize, this.gravity);
    this.ghost.jumpPower = this.jumpPower;
    this.ghost.terminalVelocity = this.terminalVelocity;

    this.pipes = [];
    this.initializePipePool();
    this.lastPipeTime = 0;
    this.state = 'PLAYING';
    this.score = 0;

    // Clear particles on new game
    this.particleSystem.clear();

    this.loadGhostImage();
  }

  /**
   * Initialize pipe object pool with empty array
   * Called during game initialization to ensure pool is ready
   */
  initializePipePool() {
    this.pipePool = [];
  }

  /**
   * Reset pipe pool for new game session
   * Clears all pooled pipes to prevent stale references
   */
  resetPipePool() {
    this.pipePool = [];
  }

  /**
   * Acquire a pipe from pool or create new one
   * Reuses pooled pipes when available for memory efficiency
   * @private
   * @returns {Pipe} A pipe object ready to be configured
   */
  acquirePipeFromPool() {
    if (this.pipePool.length > 0) {
      return this.pipePool.pop();
    }
    
    // Create new pipe if pool is empty
    return new Pipe(
      this.canvas.width,
      0,
      this.pipeWidth,
      0, // gapY will be set during generatePipe
      this.gapHeight,
      this.pipeSpeed,
      this.canvas.width,
      this.canvas.height
    );
  }

  /**
   * Return pipe to pool for reuse
   * Only keeps a limited number of pipes in pool to avoid memory waste
   * @private
   * @param {Pipe} pipe - Pipe object to return to pool
   */
  returnPipeToPool(pipe) {
    if (this.pipePool.length < this.maxPoolSize) {
      this.pipePool.push(pipe);
    }
    // Discard pipe if pool is full (garbage collected)
  }

  /**
   * Get current pool statistics (useful for debugging)
   * @returns {Object} Object containing poolSize and activeCount
   */
  getPoolStats() {
    return {
      poolSize: this.pipePool.length,
      activeCount: this.pipes.length,
      maxPoolSize: this.maxPoolSize
    };
  }

  /**
   * Reset game after game over
   */
  reset() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore(this.highScore);
    }
    this.gameOverAnimationTime = 0; // Reset overlay animation
    this.gameOverAlpha = 0;
    this.init();
  }

  /**
   * Load ghost sprite image
   */
  loadGhostImage() {
    const theme = this.themeManager.getTheme();
    const spritePath = theme.ghostSprite;
    
    this.ghost.image = new Image();
    this.ghost.image.src = spritePath;
    
    // Handle image load errors gracefully
    this.ghost.image.onerror = () => {
      console.warn(`Failed to load ghost sprite: ${spritePath}`);
      this.ghost.image = null;
    };
  }

  /**
   * Update game state
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Update game over overlay animation
    if (this.state === 'GAME_OVER') {
      if (this.gameOverAnimationTime < this.gameOverAnimationDuration) {
        this.gameOverAnimationTime += deltaTime;
        // Ease-in-out cubic easing
        const progress = Math.min(1, this.gameOverAnimationTime / this.gameOverAnimationDuration);
        this.gameOverAlpha = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;
      } else {
        this.gameOverAlpha = 1;
      }
    }

    if (this.state === 'PLAYING') {
      // Update particles
      this.particleSystem.update(deltaTime);

      // Update ghost physics
      this.ghost.update(deltaTime);
      this.ghost.clampToBounds(0, this.canvas.height);

      // Update pipes
      for (let pipe of this.pipes) {
        pipe.update(deltaTime);
      }

      // Generate new pipes on interval
      this.lastPipeTime += deltaTime;
      if (this.lastPipeTime > this.pipeInterval) {
        this.generatePipe();
        this.lastPipeTime = 0;
      }

      // Return off-screen pipes to pool instead of removing
      this.pipes = this.pipes.filter((pipe) => {
        if (pipe.isOffScreen()) {
          // Return pipe to pool for reuse
          this.returnPipeToPool(pipe);
          return false;
        }
        return true;
      });

      // Check collisions
      if (this.checkCollisions()) {
        // Emit collision effect before game over
        const ghostCenterX = this.ghost.x + this.ghost.width / 2;
        const ghostCenterY = this.ghost.y + this.ghost.height / 2;
        this.particleSystem.emitCollisionEffect(ghostCenterX, ghostCenterY);

        this.state = 'GAME_OVER';
        this.gameOverAnimationTime = 0; // Start overlay animation
        this.audioManager.playGameOverSound();
      }

      // Update score
      this.updateScore();
    } else {
      // Update particles even during game over
      this.particleSystem.update(deltaTime);
    }
  }

  /**
   * Generate a new pipe with random gap position
   * Uses object pool to minimize allocation overhead
   */
  generatePipe() {
    const minGapY = 50;
    const maxGapY = this.canvas.height - this.gapHeight - 50;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    // Acquire pipe from pool or create new one
    const pipe = this.acquirePipeFromPool();
    
    // Reset pipe properties for reuse
    pipe.x = this.canvas.width;
    pipe.gapY = gapY;
    pipe.scored = false;

    this.pipes.push(pipe);
  }

  /**
   * Check for collisions between ghost and obstacles
   * @returns {boolean} True if collision detected
   */
  checkCollisions() {
    const ghostBounds = this.ghost.getBounds();

    // Check collision with ground
    if (ghostBounds.bottom >= this.canvas.height) {
      return true;
    }

    // Check collision with ceiling
    if (ghostBounds.top <= 0) {
      return true;
    }

    // Check collisions with pipes
    for (let pipe of this.pipes) {
      // Check collision with upper pipe
      if (this.aabbCollision(ghostBounds, pipe.getUpperPipeBounds())) {
        return true;
      }

      // Check collision with lower pipe
      if (this.aabbCollision(ghostBounds, pipe.getLowerPipeBounds())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Axis-Aligned Bounding Box (AABB) collision detection
   * @param {Object} bounds1 - First bounds object
   * @param {Object} bounds2 - Second bounds object
   * @returns {boolean} True if bounds overlap
   */
  aabbCollision(bounds1, bounds2) {
    return !(
      bounds1.right < bounds2.left ||
      bounds1.left > bounds2.right ||
      bounds1.bottom < bounds2.top ||
      bounds1.top > bounds2.bottom
    );
  }

  /**
   * Update score based on pipe passages
   * Ghost scores when center crosses pipe center while passing through gap
   */
  updateScore() {
    for (let pipe of this.pipes) {
      if (!pipe.scored) {
        const ghostCenterX = this.ghost.x + this.ghost.width / 2;
        const gapCenterX = pipe.x + pipe.width / 2;
        
        // Check if ghost center has crossed pipe center (horizontally)
        // AND ghost is within the gap bounds (vertically)
        const ghostTop = this.ghost.y;
        const ghostBottom = this.ghost.y + this.ghost.height;
        const gapTop = pipe.gapY;
        const gapBottom = pipe.gapY + pipe.gapHeight;
        
        const isInGap = ghostBottom > gapTop && ghostTop < gapBottom;

        // Check if ghost center has crossed pipe center while in gap
        if (ghostCenterX > gapCenterX && isInGap) {
          pipe.scored = true;
          this.score++;
          
          // Emit gap pass effect
          const ghostCenterY = this.ghost.y + this.ghost.height / 2;
          this.particleSystem.emitGapPassEffect(ghostCenterX, ghostCenterY);
        }
      }
    }
  }

  /**
   * Handle jump action
   */
  jump() {
    if (this.state === 'PLAYING') {
      this.ghost.jump();
      this.audioManager.playJumpSound();
      
      // Emit jump effect
      const ghostCenterX = this.ghost.x + this.ghost.width / 2;
      const ghostCenterY = this.ghost.y + this.ghost.height / 2;
      this.particleSystem.emitJumpEffect(ghostCenterX, ghostCenterY);
    } else if (this.state === 'GAME_OVER') {
      this.reset();
    }
  }

  /**
   * Change to next theme in rotation
   */
  cycleTheme() {
    const themes = this.themeManager.getAvailableThemes();
    const currentIndex = themes.indexOf(this.themeManager.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.themeManager.setTheme(themes[nextIndex]);
    this.loadGhostImage(); // Reload sprite when theme changes
  }

  /**
   * Set specific theme
   * @param {string} themeName - Name of theme to set
   */
  setTheme(themeName) {
    this.themeManager.setTheme(themeName);
    this.loadGhostImage(); // Reload sprite when theme changes
  }

  /**
   * Get current theme name
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.themeManager.currentTheme;
  }

  /**
   * Render game to canvas
   */
  render() {
    const theme = this.themeManager.getTheme();
    
    // Clear canvas with sky color from theme
    this.ctx.fillStyle = theme.skyColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render pipes (behind ghost)
    for (let pipe of this.pipes) {
      pipe.render(this.ctx, theme);
    }

    // Render ghost (on top of pipes)
    this.ghost.render(this.ctx);

    // Render particles
    this.particleSystem.render(this.ctx);

    // Render score and high score
    this.ctx.fillStyle = theme.textColor;
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, this.canvas.height - 20);
    this.ctx.fillText(`High: ${this.highScore}`, 200, this.canvas.height - 20);

    // Render game over overlay and prompt with smooth fade-in animation
    if (this.state === 'GAME_OVER') {
      // Animated overlay using eased alpha
      const overlayAlpha = 0.5 * this.gameOverAlpha;
      
      // Parse theme overlay color
      const colorMatch = theme.overlayColor.match(/\d+/g);
      const r = colorMatch ? parseInt(colorMatch[0]) : 0;
      const g = colorMatch ? parseInt(colorMatch[1]) : 0;
      const b = colorMatch ? parseInt(colorMatch[2]) : 0;
      
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${overlayAlpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Animated text with fade-in
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.gameOverAlpha})`;
      this.ctx.font = 'bold 32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 40);
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.textAlign = 'left';
    }
  }

  /**
   * Main game loop using requestAnimationFrame
   */
  gameLoop() {
    const now = Date.now();
    let deltaTime = (now - this.lastFrameTime) / 1000;

    // Cap delta time to prevent large jumps when tab loses focus
    if (deltaTime > this.maxDeltaTime) {
      deltaTime = this.maxDeltaTime;
    }

    this.lastFrameTime = now;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Load high score from localStorage
   * @returns {number} Stored high score or 0 if not found
   */
  loadHighScore() {
    try {
      const stored = localStorage.getItem('flappyKiroHighScore');
      if (stored === null) return 0;
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'number' && parsed >= 0) {
        return parsed;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Save high score to localStorage
   * @param {number} score - Score to save
   */
  saveHighScore(score) {
    try {
      localStorage.setItem('flappyKiroHighScore', JSON.stringify(score));
    } catch (e) {
      console.error('Failed to save high score:', e);
    }
  }
}

/**
 * Initialize game when DOM is ready
 */
function initializeGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const gameEngine = new GameEngine(canvas);
  
  // Expose gameEngine to window for external control
  window.gameEngine = gameEngine;
  
  // Set initial theme selector value
  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.value = gameEngine.getCurrentTheme();
  }
  
  gameEngine.gameLoop();
}

/**
 * Start game on page load
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}
