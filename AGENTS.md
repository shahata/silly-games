# AGENTS.md

## Dev Environment

- Run with `docker compose -f docker-compose.base44.yml up -d`
- Vite dev server on port 5173 inside container, mapped to host port 3000
- The `base` path in `vite.config.js` is `/silly-games/` only in production builds (for GitHub Pages); in dev it's `/`
- No external services or secrets needed — purely a client-side multi-page game collection
- Hot reload works via Vite; changes to any game's source files reflect immediately

## Verify

- `curl http://localhost:3000/` should return the root index.html with game links
- Individual games at `/tic-tac-toe/`, `/minesweeper/`, `/15-puzzle/`, etc.
