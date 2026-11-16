import { useState, useEffect, useCallback, useRef } from "react";
import { ref, set, onValue, update, push, serverTimestamp } from "firebase/database";
import { db } from "../../shared/firebase.js";
import { createBoard, checkWinner, makeMove, X, O, EMPTY } from "./game.js";
import "./App.css";

function generatePlayerId() {
  return Math.random().toString(36).slice(2, 10);
}

function getPlayerIdFromStorage() {
  let id = sessionStorage.getItem("playerId");
  if (!id) {
    id = generatePlayerId();
    sessionStorage.setItem("playerId", id);
  }
  return id;
}

export default function App() {
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerId] = useState(getPlayerIdFromStorage);
  const [copied, setCopied] = useState(false);

  // Check URL for room ID on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("room");
    if (id) {
      setRoomId(id);
      joinRoom(id);
    }
  }, []);

  // Subscribe to room updates
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsub = onValue(roomRef, (snap) => {
      if (snap.exists()) {
        setRoom(snap.val());
      }
    });
    return unsub;
  }, [roomId]);

  async function createRoom() {
    const roomRef = push(ref(db, "rooms"));
    const newRoom = {
      board: createBoard(),
      turn: X,
      players: { X: playerId, O: null },
      status: "waiting",
      winner: null,
      winLine: null,
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
      // If we're already a player, do nothing
      if (data.players.X === playerId || data.players.O === playerId) return;
      // Join as O if slot is open
      if (!data.players.O && data.status === "waiting") {
        await update(roomRef, {
          "players/O": playerId,
          status: "playing",
        });
      }
    }, { onlyOnce: true });
  }

  async function handleCellClick(index) {
    if (!room || !roomId) return;
    if (room.status !== "playing") return;

    const mySymbol = room.players.X === playerId ? X : room.players.O === playerId ? O : null;
    if (!mySymbol) return;
    if (room.turn !== mySymbol) return;
    if (room.board[index] !== EMPTY) return;

    const newBoard = makeMove(room.board, index, mySymbol);
    if (!newBoard) return;

    const result = checkWinner(newBoard);
    const updates = {
      board: newBoard,
      turn: mySymbol === X ? O : X,
      lastMove: index,
    };

    if (result) {
      updates.status = "done";
      updates.winner = result.winner;
      updates.winLine = result.line;
    }

    await update(ref(db, `rooms/${roomId}`), updates);
  }

  async function handleRematch() {
    if (!roomId) return;
    await update(ref(db, `rooms/${roomId}`), {
      board: createBoard(),
      turn: X,
      status: "playing",
      winner: null,
      winLine: null,
      lastMove: null,
    });
  }

  function handleNewGame() {
    window.history.replaceState(null, "", window.location.pathname);
    setRoomId(null);
    setRoom(null);
  }

  function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Lobby - no room yet
  if (!roomId) {
    return (
      <div className="game-page">
        <h1>איקס עיגול</h1>
        <div className="lobby">
          <button className="create-btn" onClick={createRoom}>
            צור משחק
          </button>
        </div>
      </div>
    );
  }

  // Loading room data
  if (!room) {
    return (
      <div className="game-page">
        <h1>איקס עיגול</h1>
        <p className="pulse">מתחבר...</p>
      </div>
    );
  }

  const mySymbol = room.players.X === playerId ? X : room.players.O === playerId ? O : null;
  const isSpectator = !mySymbol;

  // Waiting for opponent
  if (room.status === "waiting") {
    return (
      <div className="game-page">
        <h1>איקס עיגול</h1>
        <div className="waiting">
          <div className="share-box">
            <p>שלח קישור זה לחבר:</p>
            <div className="share-link">
              <input
                readOnly
                value={`${window.location.origin}${window.location.pathname}?room=${roomId}`}
                onFocus={(e) => e.target.select()}
              />
              <button className="copy-btn" onClick={copyLink}>
                {copied ? "הועתק!" : "העתק"}
              </button>
            </div>
          </div>
          <p className="pulse">מחכה ליריב...</p>
        </div>
      </div>
    );
  }

  // Game in progress or done
  const result = room.winner;
  const isMyTurn = room.turn === mySymbol;
  const winLine = room.winLine || [];
  const lastMove = room.lastMove ?? -1;

  let statusText;
  if (room.status === "done") {
    if (result === "draw") {
      statusText = "זה שוויון!";
    } else if (result === mySymbol) {
      statusText = "ניצחת!";
    } else if (isSpectator) {
      statusText = `${result} מנצח!`;
    } else {
      statusText = "הפסדת!";
    }
  } else if (isSpectator) {
    statusText = `התור של ${room.turn}`;
  } else if (isMyTurn) {
    statusText = "התור שלך";
  } else {
    statusText = "תור היריב...";
  }

  return (
    <div className="game-page">
      <h1>איקס עיגול</h1>
      {mySymbol && (
        <p className="player-badge">
          אתה <span className={mySymbol.toLowerCase()}>{mySymbol}</span>
        </p>
      )}
      <p className={`status ${isMyTurn && room.status === "playing" ? "your-turn" : ""}`}>
        {statusText}
      </p>
      <div className="board">
        {room.board.map((cell, i) => (
          <div
            key={i}
            className={`cell ${cell ? "taken" : ""} ${cell === X ? "x" : cell === O ? "o" : ""} ${winLine.includes(i) ? "win" : ""} ${i === lastMove ? "last-move" : ""}`}
            onClick={() => handleCellClick(i)}
          >
            {cell || ""}
          </div>
        ))}
      </div>
      <div className="actions">
        {room.status === "done" && !isSpectator && (
          <button onClick={handleRematch}>משחק חזרה</button>
        )}
        <button onClick={handleNewGame}>משחק חדש</button>
      </div>
    </div>
  );
}
