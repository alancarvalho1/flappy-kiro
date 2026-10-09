# Flappy Kiro - Product Overview

## What is Flappy Kiro?

Flappy Kiro is a retro arcade game built with HTML5 Canvas and vanilla JavaScript. It's an implementation of the classic Flappy Bird concept featuring a ghost character navigating through vertical green pipes against a blue sky backdrop.

## Core Experience

- **Gameplay**: Players control a ghost character by pressing the spacebar to make it jump, navigating through gaps in green pipes
- **Challenge**: The game progressively gets harder as players must time their jumps precisely to pass through pipes
- **Scoring**: One point awarded each time the ghost successfully passes through a pipe gap
- **Persistence**: High score is saved locally and persists across browser sessions

## Game States

- **Initial/Playing**: Ghost falls due to gravity, player can jump with spacebar
- **Game Over**: Triggered by collision with pipes, ground, or ceiling; displays restart prompt
- **High Score**: Displayed at bottom of screen, updates when current score exceeds it

## Key Features

1. **Physics-based movement**: Gravity and jump mechanics feel responsive and skill-based
2. **Audio feedback**: Jump and game-over sounds provide sensory confirmation
3. **Visual clarity**: Simple color scheme (blue sky, green pipes, ghost sprite) maintains retro aesthetic
4. **Smooth performance**: Runs at 60 FPS with frame-rate-independent physics
5. **Progressive difficulty**: Randomly varying pipe gaps create unique challenges each playthrough

## Target Audience

Players seeking quick, arcade-style gaming experience with replay value. The simple control scheme (one button) and permadeath mechanics encourage multiple playthroughs.

## Project Status

- The project includes comprehensive design and requirements documentation
- Implementation plan is detailed with 13 phases from MVP to post-MVP enhancements
- Core game mechanics are fully specified and ready for implementation
- Optional features (themes, mobile support, difficulty modes) can be added post-MVP
