import "./modulepreload-polyfill-COaX8i6R.js";
import { r as reactExports, j as jsxRuntimeExports, c as clientExports } from "./index-C3ph5LlM.js";
function makeMove(data, row, column) {
  const options = [
    { row, column: column - 1 },
    { row, column: column + 1 },
    { row: row - 1, column },
    { row: row + 1, column }
  ];
  const result = options.find((x) => data[x.row] && data[x.row][x.column] === null);
  if (result) {
    data[result.row][result.column] = data[row][column];
    data[row][column] = null;
  }
  return data;
}
function shuffle(data) {
  do {
    for (let i = 0; i < 1e6; i++) {
      data = makeMove(data, Math.floor(Math.random() * data.length), Math.floor(Math.random() * data[0].length));
    }
  } while (isSolved(data));
  return data;
}
function ordered(rows, columns) {
  const data = [];
  let counter = 1;
  for (let i = 0; i < rows; i++) {
    const row = [];
    data.push(row);
    for (let j = 0; j < columns; j++) {
      row.push(counter);
      counter++;
    }
  }
  data[rows - 1][columns - 1] = null;
  return data;
}
function initGame(rows, columns) {
  return shuffle(ordered(rows, columns));
}
function isSolved(data) {
  const solved = ordered(data.length, data[0].length);
  return solved.every((row, rowIndex) => row.every((column, columnIndex) => {
    return solved[rowIndex][columnIndex] === data[rowIndex][columnIndex];
  }));
}
class Game extends reactExports.Component {
  state = {
    data: initGame(4, 4)
  };
  startGame() {
    this.setState({ data: initGame(4, 4) });
  }
  makeMove(row, column) {
    if (!isSolved(this.state.data)) {
      this.setState({ data: makeMove(this.state.data, row, column) });
    }
  }
  componentDidUpdate() {
    if (isSolved(this.state.data)) {
      setTimeout(() => {
        alert("כל הכבוד!");
        this.startGame();
      }, 100);
    }
  }
  render() {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "NewGame",
          role: "img",
          "aria-label": "New Game",
          onClick: () => this.startGame(),
          children: "🔄"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("table", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: this.state.data.map((x, row) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: x.map((y, column) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            onClick: () => this.makeMove(row, column),
            className: y ? "cell" : "empty",
            children: y
          },
          column
        );
      }) }, row)) }) })
    ] });
  }
}
class App extends reactExports.Component {
  render() {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "App", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Game, {}) });
  }
}
clientExports.createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsxRuntimeExports.jsx(App, {}));
