import { useState, useEffect, useRef } from "react";
import { ref, set, onValue, update, push, serverTimestamp } from "firebase/database";
import { db } from "../../shared/firebase.js";
import { createBoard, dropPiece, checkWinner, R, Y, EMPTY, ROWS, COLS } from "./game.js";
import "./App.css";

function getPlayerIdFromStorage() {
  let id = sessionStorage.getItem("playerId");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("playerId", id);
  }
  return id;
}

export default function App() {
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerId] = useState(getPlayerIdFromStorage);
  const [copied, setCopied] = useState(false);
  const [lastDrop, setLastDrop] = useState(null);
  const prevBoardRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("room");
    if (id) {
      setRoomId(id);
      joinRoom(id);
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsub = onValue(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        // Detect which cell was just dropped
        if (prevBoardRef.current && data.board) {
          for (let i = 0; i < data.board.length; i++) {
            if (prevBoardRef.current[i] !== data.board[i]) {
              setLastDrop(i);
              break;
            }
          }
        }
        prevBoardRef.current = data.board || null;
        setRoom(data);
      }
    });
    return unsub;
  }, [roomId]);

  async function createRoom() {
    const roomRef = push(ref(db, "rooms"));
    const newRoom = {
      game: "four-in-a-row",
      board: createBoard(),
      turn: R,
      players: { R: playerId, Y: null },
      status: "waiting",
      winner: null,
      winCells: null,
      createdAt: serverTimestamp(),
    };
    await set(roomRef, newRoom);
    const id = roomRef.key;
    setRoomId(id);
    window.history.replaceState(null, "", `?room=${id}`);
  }

  async function joinRoom(id) {
    const roomRef = ref(db, `rooms/${id}`);
    onValue(roomRef, async (snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      if (data.players.R === playerId || data.players.Y === playerId) return;
      if (!data.players.Y && data.status === "waiting") {
        await update(roomRef, {
          "players/Y": playerId,
          status: "playing",
        });
      }
    }, { onlyOnce: true });
  }

  async function handleColClick(col) {
    if (!room || !roomId) return;
    if (room.status !== "playing") return;

    const myColor = room.players.R === playerId ? R : room.players.Y === playerId ? Y : null;
    if (!myColor) return;
    if (room.turn !== myColor) return;

    const board = room.board || createBoard();
    const newBoard = dropPiece(board, col, myColor);
    if (!newBoard) return;

    // Find which cell was filled (the dropped piece)
    let droppedCell = null;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] !== board[i]) { droppedCell = i; break; }
    }

    const result = checkWinner(newBoard);
    const updates = {
      board: newBoard,
      turn: myColor === R ? Y : R,
      lastMove: droppedCell,
    };

    if (result) {
      updates.status = "done";
      updates.winner = result.winner;
      updates.winCells = result.cells;
    }

    await update(ref(db, `rooms/${roomId}`), updates);
  }

  async function handleRematch() {
    if (!roomId) return;
    prevBoardRef.current = null;
    setLastDrop(null);
    await update(ref(db, `rooms/${roomId}`), {
      board: createBoard(),
      turn: R,
      status: "playing",
      winner: null,
      winCells: null,
      lastMove: null,
    });
  }

  function handleNewGame() {
    window.history.replaceState(null, "", window.location.pathname);
    setRoomId(null);
    setRoom(null);
    prevBoardRef.current = null;
    setLastDrop(null);
  }

  function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // --- Lobby ---
  if (!roomId) {
    return (
      <div className="game-page">
        <h1>Four in a Row</h1>
        <div className="lobby">
          <button className="create-btn" onClick={createRoom}>Create Game</button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="game-page">
        <h1>Four in a Row</h1>
        <p className="pulse">Connecting...</p>
      </div>
    );
  }

  // --- Waiting ---
  if (room.status === "waiting") {
    return (
      <div className="game-page">
        <h1>Four in a Row</h1>
        <div className="waiting">
          <div className="share-box">
            <p>Send this link to a friend:</p>
            <div className="share-link">
              <input
                readOnly
                value={`${window.location.origin}${window.location.pathname}?room=${roomId}`}
                onFocus={(e) => e.target.select()}
              />
              <button className="copy-btn" onClick={copyLink}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <p className="pulse">Waiting for opponent...</p>
        </div>
      </div>
    );
  }

  // --- Playing / Done ---
  const myColor = room.players.R === playerId ? R : room.players.Y === playerId ? Y : null;
  const isSpectator = !myColor;
  const isMyTurn = room.turn === myColor;
  const board = room.board || createBoard();
  const winCells = room.winCells || [];
  const lastMove = room.lastMove ?? -1;

  const cellSize = Math.min(Math.floor((window.innerWidth - 60) / COLS), 56);

  let statusText;
  if (room.status === "done") {
    if (room.winner === "draw") {
      statusText = "It's a draw!";
    } else if (room.winner === myColor) {
      statusText = "You win!";
    } else if (isSpectator) {
      statusText = `${room.winner === R ? "Red" : "Yellow"} wins!`;
    } else {
      statusText = "You lose!";
    }
  } else if (isSpectator) {
    statusText = `${room.turn === R ? "Red" : "Yellow"}'s turn`;
  } else if (isMyTurn) {
    statusText = "Your turn";
  } else {
    statusText = "Opponent's turn...";
  }

  return (
    <div className="game-page" style={{ "--cell-size": `${cellSize}px` }}>
      <h1>Four in a Row</h1>
      {myColor && (
        <p className="player-badge">
          You are <span className={myColor.toLowerCase()}>
            {myColor === R ? "Red" : "Yellow"}
          </span>
        </p>
      )}
      <p className={`status ${isMyTurn && room.status === "playing" ? "your-turn" : ""}`}>
        {statusText}
      </p>
      <div className="board-wrapper">
        <div className="column-hints">
          {Array.from({ length: COLS }, (_, c) => (
            <div
              key={c}
              className={`col-hint ${myColor === R ? "red" : "yellow"}`}
              onClick={() => handleColClick(c)}
            >
              ▼
            </div>
          ))}
        </div>
        <div className="board">
          {board.map((cell, i) => (
            <div
              key={i}
              className={[
                "cell",
                cell === R ? "red taken" : cell === Y ? "yellow taken" : "",
                winCells.includes(i) ? "win" : "",
                i === lastDrop ? "just-dropped" : "",
                i === lastMove ? "last-move" : "",
              ].join(" ")}
              onClick={() => handleColClick(i % COLS)}
            />
          ))}
        </div>
      </div>
      <div className="actions">
        {room.status === "done" && !isSpectator && (
          <button onClick={handleRematch}>Rematch</button>
        )}
        <button onClick={handleNewGame}>New Game</button>
      </div>
    </div>
  );
}
