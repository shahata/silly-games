import { useState, useEffect } from "react";
import { makeMove, isSolved, initGame } from "./game";
import "./App.css";

function Game() {
  const [data, setData] = useState(() => initGame(4, 4));
  const [ended, setEnded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!ended && isSolved(data)) {
      setEnded(true);
      setShowPopup(true);
    }
  }, [data, ended]);

  const startGame = () => {
    setData(initGame(4, 4));
    setEnded(false);
    setShowPopup(false);
  };

  const handleMove = (row, column) => {
    if (!ended) {
      setData(makeMove(data, row, column));
    }
  };

  return (
    <div className="App">
      <span
        className="NewGame"
        role="img"
        aria-label="New Game"
        onClick={startGame}
      >
        🔄
      </span>
      <table>
        <tbody>
          {data.map((x, row) => (
            <tr key={row}>
              {x.map((y, column) => (
                <td
                  key={column}
                  onClick={() => handleMove(row, column)}
                  className={y ? "cell" : "empty"}
                >
                  {y}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {showPopup && (
        <div className="game-popup-overlay">
          <div className="game-popup">
            <h2>!כל הכבוד</h2>
            <button
              className="ok-btn"
              onClick={() => setShowPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
