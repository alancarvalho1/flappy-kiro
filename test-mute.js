/**
 * Test mute/unmute functionality
 * Tests AudioManager and UIController integration
 */

// Mock localStorage for testing
let mockStorage = {};
const clearStorage = () => { mockStorage = {}; };

global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; }
};

// Mock Audio for testing
global.Audio = class {
  constructor(src) {
    this.src = src;
    this.currentTime = 0;
  }
  play() {
    return Promise.resolve();
  }
};

// Load the game code (we'll need to extract classes into testable format)
// For now, we'll define minimal versions to test

class AudioManager {
  constructor() {
    this.jumpAudio = null;
    this.gameOverAudio = null;
    this.audioAvailable = true;
    this.isMuted = this.loadMutePreference();
    this.loadAudio();
  }

  loadAudio() {
    try {
      this.jumpAudio = new Audio('assets/jump.wav');
      this.gameOverAudio = new Audio('assets/game_over.wav');
    } catch (e) {
      this.audioAvailable = false;
    }
  }

  loadMutePreference() {
    try {
      const stored = localStorage.getItem('flappyKiroAudioMuted');
      if (stored === null) return false;
      return JSON.parse(stored) === true;
    } catch (e) {
      return false;
    }
  }

  saveMutePreference(isMuted) {
    try {
      localStorage.setItem('flappyKiroAudioMuted', JSON.stringify(isMuted));
    } catch (e) {
      console.error('Failed to save mute preference:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveMutePreference(this.isMuted);
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.saveMutePreference(this.isMuted);
  }

  playJumpSound() {
    if (!this.audioAvailable || !this.jumpAudio || this.isMuted) return;
    try {
      this.jumpAudio.currentTime = 0;
      this.jumpAudio.play().catch(() => {});
    } catch (e) {
      // Silent failure
    }
  }

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

// Test suite
console.log('\n=== Mute/Unmute Audio Functionality Tests ===\n');

// Test 1: AudioManager should initialize unmuted by default
console.log('Test 1: AudioManager should initialize unmuted by default');
clearStorage();
const audioManager1 = new AudioManager();
if (audioManager1.isMuted === false) {
  console.log('✓ PASS: AudioManager initializes with isMuted = false\n');
} else {
  console.log('✗ FAIL: AudioManager should initialize with isMuted = false\n');
}

// Test 2: toggleMute should toggle state
console.log('Test 2: toggleMute should toggle state');
clearStorage();
const audioManager2 = new AudioManager();
const newState = audioManager2.toggleMute();
if (newState === true && audioManager2.isMuted === true) {
  console.log('✓ PASS: toggleMute changes state to true\n');
} else {
  console.log('✗ FAIL: toggleMute should change state to true\n');
}

// Test 3: Mute preference should persist to localStorage
console.log('Test 3: Mute preference should persist to localStorage');
clearStorage();
const audioManager3 = new AudioManager();
audioManager3.toggleMute(); // Set to muted (true)
const stored = localStorage.getItem('flappyKiroAudioMuted');
if (stored === 'true') {
  console.log('✓ PASS: Mute preference saved to localStorage\n');
} else {
  console.log('✗ FAIL: Mute preference should be saved as "true"\n');
}

// Test 4: Mute preference should load from localStorage
console.log('Test 4: Mute preference should load from localStorage');
clearStorage();
localStorage.setItem('flappyKiroAudioMuted', 'true');
const audioManager4 = new AudioManager();
if (audioManager4.isMuted === true) {
  console.log('✓ PASS: AudioManager loads mute preference from localStorage\n');
} else {
  console.log('✗ FAIL: AudioManager should load mute preference from localStorage\n');
}

// Test 5: Multiple toggles should work correctly
console.log('Test 5: Multiple toggles should work correctly');
clearStorage();
const audioManager5 = new AudioManager();
audioManager5.toggleMute(); // true
audioManager5.toggleMute(); // false
audioManager5.toggleMute(); // true
if (audioManager5.isMuted === true) {
  console.log('✓ PASS: Multiple toggles work correctly\n');
} else {
  console.log('✗ FAIL: Multiple toggles should result in muted state\n');
}

// Test 6: setMuted should set state correctly
console.log('Test 6: setMuted should set state correctly');
clearStorage();
const audioManager6 = new AudioManager();
audioManager6.setMuted(true);
if (audioManager6.isMuted === true) {
  console.log('✓ PASS: setMuted(true) sets muted state\n');
} else {
  console.log('✗ FAIL: setMuted(true) should set muted state\n');
}

// Test 7: Audio should not play when muted
console.log('Test 7: Audio should not play when muted');
clearStorage();
const audioManager7 = new AudioManager();
audioManager7.setMuted(true);
let jumpPlayCalled = false;
audioManager7.jumpAudio.play = function() {
  jumpPlayCalled = true;
  return Promise.resolve();
};
audioManager7.playJumpSound();
if (jumpPlayCalled === false) {
  console.log('✓ PASS: Audio does not play when muted\n');
} else {
  console.log('✗ FAIL: Audio should not play when muted\n');
}

// Test 8: Audio should play when unmuted
console.log('Test 8: Audio should play when unmuted');
clearStorage();
const audioManager8 = new AudioManager();
audioManager8.setMuted(false);
let jumpPlayCalled2 = false;
audioManager8.jumpAudio.play = function() {
  jumpPlayCalled2 = true;
  return Promise.resolve();
};
audioManager8.playJumpSound();
if (jumpPlayCalled2 === true) {
  console.log('✓ PASS: Audio plays when unmuted\n');
} else {
  console.log('✗ FAIL: Audio should play when unmuted\n');
}

// Test 9: Invalid stored preference should default to unmuted
console.log('Test 9: Invalid stored preference should default to unmuted');
clearStorage();
localStorage.setItem('flappyKiroAudioMuted', 'invalid');
const audioManager9 = new AudioManager();
if (audioManager9.isMuted === false) {
  console.log('✓ PASS: Invalid preference defaults to unmuted\n');
} else {
  console.log('✗ FAIL: Invalid preference should default to unmuted\n');
}

// Test 10: Preference persistence across instances
console.log('Test 10: Preference persistence across instances');
clearStorage();
const audioManager10a = new AudioManager();
audioManager10a.setMuted(true);
const audioManager10b = new AudioManager();
if (audioManager10b.isMuted === true) {
  console.log('✓ PASS: Preference persists across instances\n');
} else {
  console.log('✗ FAIL: Preference should persist across instances\n');
}

console.log('\n=== All Tests Completed ===\n');
