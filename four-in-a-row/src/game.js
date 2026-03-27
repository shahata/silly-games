export const ROWS = 6;
export const COLS = 7;
export const R = "R"; // Red
export const Y = "Y"; // Yellow
export const EMPTY = "";

export function createBoard() {
  return Array(ROWS * COLS).fill(EMPTY);
}

function cellAt(board, r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
  return board[r * COLS + c];
}

// Drop a piece into a column. Returns new board or null if column is full.
export function dropPiece(board, col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r * COLS + col] === EMPTY) {
      const next = [...board];
      next[r * COLS + col] = player;
      return next;
    }
  }
  return null;
}

// Returns { winner, cells } or null
export function checkWinner(board) {
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal down-right
    [1, -1], // diagonal down-left
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const piece = cellAt(board, r, c);
      if (!piece) continue;

      for (const [dr, dc] of directions) {
        const cells = [[r, c]];
        let ok = true;
        for (let i = 1; i < 4; i++) {
          if (cellAt(board, r + dr * i, c + dc * i) !== piece) {
            ok = false;
            break;
          }
          cells.push([r + dr * i, c + dc * i]);
        }
        if (ok) {
          return { winner: piece, cells: cells.map(([cr, cc]) => cr * COLS + cc) };
        }
      }
    }
  }

  if (board.every((cell) => cell !== EMPTY)) {
    return { winner: "draw", cells: null };
  }

  return null;
}
