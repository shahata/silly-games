# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- `npm run dev` — Start Vite dev server (all games accessible)
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run deploy` — Build and deploy to GitHub Pages via gh-pages

No test runner or linter is configured.

## Architecture

This is a multi-page Vite project containing 6 independent browser games, deployed to GitHub Pages at `/silly-games/`. Each game lives in its own directory with a separate `index.html` entry point. The root `index.html` is a simple link hub.

Entry points are configured in `vite.config.js` via `rollupOptions.input`.

### Game Technologies

The games use a mix of frameworks — there is no single standard:

- **15-puzzle** — React (class components), game logic in `src/game.js` as pure functions
- **bulls-and-cows** — React (functional components + hooks), uses lodash for shuffle, game logic in `src/game.js`
- **memory-game** — AngularJS 1.x (loaded from CDN), ES6 class-based game logic in `scripts/memory-game.js`
- **minesweeper** — AngularJS 1.x (loaded from CDN), service-based architecture with separate files for cell, minefield, mine-planter, game-state under `scripts/services/`
- **sudoku-solver** — AngularJS 1.x (loaded from CDN), monolithic single-file `app.js`, solves 16x16 variant
- **tapper** — Vanilla JS with Canvas 2D API, sprite-based arcade game with state machine, sound manager, and resource loader

### Key Patterns

- React games separate pure game logic (`game.js`) from UI components (`App.jsx`)
- AngularJS games load Angular from CDN and use `type="module"` scripts — they are NOT bundled through the Vite React plugin
- The Vite config uses `base: "/silly-games/"` for GitHub Pages path prefix
