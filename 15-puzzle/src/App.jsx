import { Component } from "react";
import { makeMove, isSolved, initGame } from "./game";
import "./App.css";

class Game extends Component {
  state = {
    data: initGame(4, 4),
    ended: false,
    showPopup: false,
  };

  startGame() {
    this.setState({ data: initGame(4, 4), ended: false, showPopup: false });
  }

  makeMove(row, column) {
    if (!this.state.ended) {
      this.setState({ data: makeMove(this.state.data, row, column) });
    }
  }

  componentDidUpdate() {
    if (!this.state.ended && isSolved(this.state.data)) {
      this.setState({ ended: true, showPopup: true });
    }
  }

  render() {
    return (
      <div>
        <span
          className="NewGame"
          role="img"
          aria-label="New Game"
          onClick={() => this.startGame()}
        >
          🔄
        </span>
        <table>
          <tbody>
            {this.state.data.map((x, row) => (
              <tr key={row}>
                {x.map((y, column) => {
                  return (
                    <td
                      key={column}
                      onClick={() => this.makeMove(row, column)}
                      className={y ? "cell" : "empty"}
                    >
                      {y}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {this.state.showPopup && (
          <div className="game-popup-overlay">
            <div className="game-popup">
              <h2>!כל הכבוד</h2>
              <button
                className="ok-btn"
                onClick={() => this.setState({ showPopup: false })}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <Game />
      </div>
    );
  }
}

export default App;
