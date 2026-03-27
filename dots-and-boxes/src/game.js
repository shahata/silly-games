// 5x5 dots = 4x4 grid of boxes
// Horizontal lines: 5 rows x 4 cols = 20
// Vertical lines: 4 rows x 5 cols = 20
// Total: 40 lines

export const ROWS = 4;
export const COLS = 4;
export const DOTS_R = ROWS + 1;
export const DOTS_C = COLS + 1;

export function createLines() {
  // Each line keyed as "h-row-col" or "v-row-col", value = null (unplaced)
  const lines = {};
  for (let r = 0; r < DOTS_R; r++) {
    for (let c = 0; c < COLS; c++) {
      lines[`h-${r}-${c}`] = null;
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < DOTS_C; c++) {
      lines[`v-${r}-${c}`] = null;
    }
  }
  return lines;
}

export function createBoxes() {
  const boxes = {};
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      boxes[`${r}-${c}`] = null;
    }
  }
  return boxes;
}

// Returns array of box keys completed by placing this line
export function getCompletedBoxes(lines, lineKey) {
  const [type, rs, cs] = lineKey.split("-");
  const r = parseInt(rs);
  const c = parseInt(cs);
  const completed = [];

  if (type === "h") {
    // Horizontal line at row r, col c
    // Could complete box above (r-1, c) or below (r, c)
    if (r > 0) {
      const boxR = r - 1;
      if (
        lines[`h-${boxR}-${c}`] &&
        lines[`v-${boxR}-${c}`] &&
        lines[`v-${boxR}-${c + 1}`]
      ) {
        completed.push(`${boxR}-${c}`);
      }
    }
    if (r < ROWS) {
      const boxR = r;
      if (
        lines[`h-${boxR + 1}-${c}`] &&
        lines[`v-${boxR}-${c}`] &&
        lines[`v-${boxR}-${c + 1}`]
      ) {
        completed.push(`${boxR}-${c}`);
      }
    }
  } else {
    // Vertical line at row r, col c
    // Could complete box left (r, c-1) or right (r, c)
    if (c > 0) {
      const boxC = c - 1;
      if (
        lines[`h-${r}-${boxC}`] &&
        lines[`h-${r + 1}-${boxC}`] &&
        lines[`v-${r}-${boxC}`]
      ) {
        completed.push(`${r}-${boxC}`);
      }
    }
    if (c < COLS) {
      const boxC = c;
      if (
        lines[`h-${r}-${boxC}`] &&
        lines[`h-${r + 1}-${boxC}`] &&
        lines[`v-${r}-${boxC + 1}`]
      ) {
        completed.push(`${r}-${boxC}`);
      }
    }
  }

  return completed;
}

export function isGameOver(boxes) {
  if (!boxes) return false;
  const vals = Object.values(boxes);
  return vals.length === ROWS * COLS && vals.every((v) => v !== null);
}

export function getScores(boxes) {
  const scores = { A: 0, B: 0 };
  if (!boxes) return scores;
  for (const owner of Object.values(boxes)) {
    if (owner) scores[owner]++;
  }
  return scores;
}
