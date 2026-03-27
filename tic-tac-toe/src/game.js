export const EMPTY = "";
export const X = "X";
export const O = "O";

export function createBoard() {
  return Array(9).fill(EMPTY);
}

export function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],             // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (board.every((cell) => cell !== EMPTY)) {
    return { winner: "draw", line: null };
  }

  return null;
}

export function makeMove(board, index, player) {
  if (board[index] !== EMPTY) return null;
  const next = [...board];
  next[index] = player;
  return next;
}
