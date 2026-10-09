# Flappy Kiro - ThemeManager Missing Bug

## Introduction

The game crashes on startup with "Uncaught ReferenceError: this.themeManager is undefined" because the GameEngine class references a ThemeManager instance that is never initialized. The loadGhostImage(), render(), cycleTheme(), setTheme(), and getCurrentTheme() methods all attempt to access `this.themeManager`, but it is never created in the constructor, causing the game to fail during initialization before any gameplay can occur. This prevents the ghost sprite from loading and the game from starting.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the game initializes during page load THEN the GameEngine constructor is executed, which calls init(), which calls loadGhostImage(), which attempts to access `this.themeManager.getTheme()`, but this.themeManager is undefined, causing a ReferenceError that crashes the entire game

1.2 WHEN the render() method is called THEN the system attempts to access `const theme = this.themeManager.getTheme()`, but this.themeManager is undefined, causing a ReferenceError

1.3 WHEN the cycleTheme() method is called THEN the system attempts to access `this.themeManager.getAvailableThemes()` and `this.themeManager.setTheme()`, but this.themeManager is undefined, causing a ReferenceError

1.4 WHEN the setTheme() method is called THEN the system attempts to access `this.themeManager.setTheme()`, but this.themeManager is undefined, causing a ReferenceError

1.5 WHEN the getCurrentTheme() method is called THEN the system attempts to access `this.themeManager.currentTheme`, but this.themeManager is undefined, causing a ReferenceError

### Expected Behavior (Correct)

2.1 WHEN the game initializes during page load THEN the GameEngine constructor creates a ThemeManager instance and stores it in `this.themeManager`, allowing init() to call loadGhostImage() successfully, which retrieves the correct ghost sprite path from the current theme

2.2 WHEN the render() method is called THEN the system successfully accesses `const theme = this.themeManager.getTheme()` and retrieves the current theme object containing skyColor, textColor, and other theme properties

2.3 WHEN the cycleTheme() method is called THEN the system successfully accesses `this.themeManager.getAvailableThemes()` and `this.themeManager.setTheme()` to rotate to the next available theme and reload the appropriate ghost sprite

2.4 WHEN the setTheme() method is called THEN the system successfully accesses `this.themeManager.setTheme()` to set a specific theme and reload the appropriate ghost sprite for that theme

2.5 WHEN the getCurrentTheme() method is called THEN the system successfully accesses `this.themeManager.currentTheme` and returns the name of the currently active theme as a string

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the game is playing with a valid ThemeManager initialized THEN the ghost physics, collision detection, scoring, and all other game mechanics continue to work exactly as before

3.2 WHEN the game renders each frame THEN pipe rendering, ghost rendering, particle effects, and score display continue to work exactly as before, only with the theme colors applied correctly

3.3 WHEN the user performs actions like jumping, restarting the game, or triggering collisions THEN all game state transitions and game logic continue to work exactly as before
