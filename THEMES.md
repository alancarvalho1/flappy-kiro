# Flappy Kiro - Visual Themes System

## Overview

Flappy Kiro now includes a comprehensive visual themes system that allows players to customize the game's appearance. The system supports multiple pre-built themes and allows for easy addition of custom themes.

## Available Themes

### 1. Light Mode (Default)
- **Sky Color**: Light Blue (#87ceeb)
- **Pipe Color**: Green (#2ecc71)
- **Text Color**: Black (#000000)
- **Ghost Sprite**: assets/ghosty.png
- **Overlay**: Semi-transparent dark overlay

Classic retro arcade appearance with bright, vibrant colors.

### 2. Dark Mode
- **Sky Color**: Dark Navy (#1a1a2e)
- **Pipe Color**: Red (#e74c3c)
- **Text Color**: White (#ffffff)
- **Ghost Sprite**: assets/ghosty-dark.png
- **Overlay**: Semi-transparent light overlay

Modern dark theme, easy on the eyes during extended play sessions.

### 3. Forest Theme
- **Sky Color**: Light Blue (#87ceeb)
- **Pipe Color**: Forest Green (#27ae60)
- **Text Color**: Dark Blue-Gray (#2c3e50)
- **Ghost Sprite**: assets/ghosty.png
- **Overlay**: Dark overlay with light text

Nature-inspired theme with earthy tones.

### 4. Sunset Theme
- **Sky Color**: Sunset Orange (#ff7e5f)
- **Pipe Color**: Warm Orange (#feb47b)
- **Text Color**: Dark Gray (#2c3e50)
- **Ghost Sprite**: assets/ghosty.png
- **Overlay**: Dark overlay with white text

Warm, inviting sunset colors.

## How to Use

### Selecting a Theme via UI

1. Open the game in your browser
2. Look for the theme selector dropdown in the header
3. Choose from the available themes:
   - Light Mode
   - Dark Mode
   - Forest
   - Sunset

The selected theme will be applied immediately and saved to your browser's localStorage.

### Keyboard Shortcut

Press the **T** key to cycle through themes in rotation:
- Light → Dark → Forest → Sunset → Light → ...

### Programmatic Access

```javascript
// Access the game engine (exposed in window.gameEngine)
const engine = window.gameEngine;

// Set a specific theme
engine.setTheme('dark');

// Cycle to the next theme
engine.cycleTheme();

// Get current theme name
const current = engine.getCurrentTheme();
console.log('Current theme:', current);
```

## Theme Properties

Each theme object contains the following properties:

```javascript
{
  name: string,              // Display name
  skyColor: string,          // Canvas background color (hex or rgb)
  pipeColor: string,         // Pipe color (hex or rgb)
  ghostSprite: string,       // Path to ghost sprite image
  textColor: string,         // Score text color
  scoreBackground: string,   // Background for score area (usually transparent)
  overlayColor: string,      // Color of game-over overlay
  overlayTextColor: string   // Color of game-over text
}
```

## Persistence

Theme preferences are automatically saved to browser localStorage using the key `flappyKiroTheme`. When the game reloads, the last selected theme is restored.

## Creating Custom Themes

You can add custom themes to the game by accessing the ThemeManager:

```javascript
const engine = window.gameEngine;

engine.themeManager.addTheme('myTheme', {
  name: 'My Custom Theme',
  skyColor: '#FFB6C1',
  pipeColor: '#FF69B4',
  ghostSprite: 'assets/ghosty.png',
  textColor: '#000000',
  scoreBackground: 'transparent',
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  overlayTextColor: '#ffffff'
});

// Now set your custom theme
engine.setTheme('myTheme');
```

## Theme Architecture

### ThemeManager Class

Located in `game.js`, the `ThemeManager` class handles:
- Theme storage and retrieval
- Current theme state management
- localStorage persistence
- Theme validation and defaults

### Methods

- `getTheme()` - Returns the current theme configuration object
- `getAvailableThemes()` - Returns array of all available theme names
- `setTheme(themeName)` - Sets the current theme and persists it
- `addTheme(name, config)` - Adds a new custom theme
- `loadTheme()` - Loads theme from localStorage (private)
- `saveTheme(themeName)` - Saves theme to localStorage (private)

### Integration Points

Themes are used in the following components:

1. **GameEngine.render()** - Uses theme colors for canvas rendering
2. **Pipe.render()** - Uses theme pipeColor for pipe drawing
3. **Ghost.render()** - Can use alternative sprite from theme
4. **UI Elements** - Theme selector dropdown automatically updates

## Sprite Alternatives

The system supports alternative ghost sprites through the `ghostSprite` property in each theme:

- `assets/ghosty.png` - Standard ghost sprite (used in light, forest, sunset themes)
- `assets/ghosty-dark.png` - Dark mode variant (used in dark theme)

Additional sprite variants can be created and referenced in custom themes.

## Color Customization

Colors can be specified in any valid CSS color format:
- Hex: `#87ceeb`, `#2ecc71`
- RGB: `rgb(135, 206, 235)`
- RGBA: `rgba(0, 0, 0, 0.5)`
- Named colors: `blue`, `green` (not recommended for consistency)

## Fallback Behavior

If a sprite image fails to load:
1. The ghost renders with a fallback shape (drawn with canvas primitives)
2. Game continues to function normally
3. Warning logged to browser console

If localStorage is unavailable:
1. Theme defaults to 'light'
2. Theme changes aren't persisted
3. Game continues to function normally

## Future Enhancements

Potential improvements to the theme system:

1. **Theme Editor UI** - In-game interface for creating and editing themes
2. **More Sprite Variants** - Different ghost characters for each theme
3. **Animation Themes** - Different particle effects per theme
4. **Background Variations** - Alternative background patterns
5. **Sound Themes** - Theme-specific audio variations
6. **Community Themes** - Share and download themes from community

## Technical Notes

- Themes are applied every render cycle for immediate visual feedback
- Theme changes don't affect ongoing game state or physics
- Pipe objects store sprite reference at creation time
- Ghost sprite loads asynchronously with error handling
- All theme data is stored in client-side storage only

## Browser Compatibility

The theme system works on all modern browsers supporting:
- ES6 Classes
- Canvas 2D API
- localStorage API
- requestAnimationFrame

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
