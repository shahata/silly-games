import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/silly-games/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        puzzle15: resolve(__dirname, "15-puzzle/index.html"),
        bullsAndCows: resolve(__dirname, "bulls-and-cows/index.html"),
        memoryGame: resolve(__dirname, "memory-game/index.html"),
        minesweeper: resolve(__dirname, "minesweeper/index.html"),
        sudokuSolver: resolve(__dirname, "sudoku-solver/index.html"),
        tapper: resolve(__dirname, "tapper/index.html"),
      },
    },
  },
  plugins: [react()],
});
