import { Cell } from "./cell.js";

function random(max) {
  return Math.floor(Math.random() * max);
}

function minePlanter(rows, columns, mines) {
  function coordExists(arr, coord) {
    return arr.some((value) => value.row === coord.row && value.column === coord.column);
  }

  const mineArr = [];
  while (mineArr.length !== mines) {
    const coord = { row: random(rows), column: random(columns) };
    if (!coordExists(mineArr, coord)) {
      mineArr.push(coord);
    }
  }
  return mineArr;
}

export const gameState = {
  LOST: "lost",
  WON: "won",
  PLAYING: "playing",
};

export function Minefield(rows, columns, mines) {
  let game;
  const self = this;

  function getNeighbors(coord) {
    const neighbors = [];

    function pushNeighbor(drow, dcolumn) {
      const actualRow = coord.row + drow;
      const actualColumn = coord.column + dcolumn;

      if (game[actualRow] && game[actualRow][actualColumn]) {
        neighbors.push(game[actualRow][actualColumn]);
      }
    }

    pushNeighbor(-1, -1);
    pushNeighbor(-1, 0);
    pushNeighbor(-1, 1);
    pushNeighbor(0, -1);
    pushNeighbor(0, 1);
    pushNeighbor(1, -1);
    pushNeighbor(1, 0);
    pushNeighbor(1, 1);

    return neighbors;
  }

  function allCells() {
    return game.reduce((all, row) => all.concat(row), []);
  }

  function revealAll() {
    allCells().forEach((cell) => {
      cell.revealed = true;
    });
  }

  function gameOver(state) {
    self.state = state;
    revealAll();
  }

  function onCellRevealed(cell, auto) {
    if (cell.mine) {
      gameOver(gameState.LOST);
      return;
    }

    if (auto) {
      const neighbors = getNeighbors(cell.coord);
      if (neighbors.filter((neighbor) => neighbor.flagged).length >= cell.count) {
        neighbors.forEach((neighbor) => {
          neighbor.$reveal();
        });
      }
    } else if (cell.count === 0) {
      getNeighbors(cell.coord).forEach((neighbor) => {
        neighbor.$reveal();
      });
    }

    const won = allCells().every((cell) => cell.revealed || cell.mine);
    if (won) {
      gameOver(gameState.WON);
    }
  }

  function plantMines() {
    minePlanter(rows, columns, mines).forEach((coord) => {
      game[coord.row][coord.column].mine = true;
      getNeighbors(coord).forEach((cell) => {
        cell.count++;
      });
    });
  }

  function initGame() {
    game = [];
    for (let row = 0; row < rows; row++) {
      game.push([]);
      for (let column = 0; column < columns; column++) {
        game[row].push(new Cell({ row, column }, onCellRevealed));
      }
    }
  }

  initGame();
  plantMines();

  this.game = game;
  this.state = gameState.PLAYING;
}

export default Minefield;
