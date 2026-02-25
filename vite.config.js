import { dirname, resolve } from "node:path";
import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ignoreDirs = new Set(["dist", "node_modules"]);

const gameInputs = Object.fromEntries(
  readdirSync(__dirname, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        !d.name.startsWith(".") &&
        !ignoreDirs.has(d.name) &&
        existsSync(resolve(__dirname, d.name, "index.html"))
    )
    .map((d) => [d.name, resolve(__dirname, d.name, "index.html")])
);

export default defineConfig({
  base: "/silly-games/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...gameInputs,
      },
    },
  },
  plugins: [react()],
});
