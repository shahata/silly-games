import { useState, useEffect } from "react";
import { ref, set, onValue, update, push, serverTimestamp } from "firebase/database";
import { db } from "../../shared/firebase.js";
import {
  createLines, createBoxes, getCompletedBoxes, isGameOver, getScores,
  ROWS, COLS, DOTS_R, DOTS_C,
} from "./game.js";
import "./App.css";

const SPACING = 70; // px between dots
const PAD = 20;     // board padding

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
      if (snap.exists()) setRoom(snap.val());
    });
    return unsub;
  }, [roomId]);

  async function createRoom() {
    const roomRef = push(ref(db, "rooms"));
    const newRoom = {
      game: "dots-and-boxes",
      lines: createLines(),
      boxes: createBoxes(),
      turn: "A",
      players: { A: playerId, B: null },
      status: "waiting",
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
      if (data.players.A === playerId || data.players.B === playerId) return;
      if (!data.players.B && data.status === "waiting") {
        await update(roomRef, {
          "players/B": playerId,
          status: "playing",
        });
      }
    }, { onlyOnce: true });
  }

  async function handleLineClick(lineKey) {
    if (!room || !roomId) return;
    if (room.status !== "playing") return;

    const myRole = room.players.A === playerId ? "A" : room.players.B === playerId ? "B" : null;
    if (!myRole) return;
    if (room.turn !== myRole) return;
    const lines = room.lines || {};
    if (lines[lineKey]) return;

    // Place the line
    const newLines = { ...lines, [lineKey]: myRole };
    const completed = getCompletedBoxes(newLines, lineKey);

    const updates = {};
    updates[`lines/${lineKey}`] = myRole;
    updates.lastLine = lineKey;

    const newBoxes = { ...(room.boxes || {}) };
    for (const boxKey of completed) {
      newBoxes[boxKey] = myRole;
      updates[`boxes/${boxKey}`] = myRole;
    }

    // If player completed a box, they get another turn; otherwise switch
    if (completed.length === 0) {
      updates.turn = myRole === "A" ? "B" : "A";
    }

    if (isGameOver(newBoxes)) {
      updates.status = "done";
    }

    await update(ref(db, `rooms/${roomId}`), updates);
  }

  async function handleRematch() {
    if (!roomId) return;
    await update(ref(db, `rooms/${roomId}`), {
      lines: createLines(),
      boxes: createBoxes(),
      turn: "A",
      status: "playing",
      lastLine: null,
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

  // --- Lobby ---
  if (!roomId) {
    return (
      <div className="game-page">
        <h1>Dots & Boxes</h1>
        <div className="lobby">
          <button className="create-btn" onClick={createRoom}>Create Game</button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="game-page">
        <h1>Dots & Boxes</h1>
        <p className="pulse">Connecting...</p>
      </div>
    );
  }

  // --- Waiting ---
  if (room.status === "waiting") {
    return (
      <div className="game-page">
        <h1>Dots & Boxes</h1>
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
  const myRole = room.players.A === playerId ? "A" : room.players.B === playerId ? "B" : null;
  const isSpectator = !myRole;
  const isMyTurn = room.turn === myRole;
  const roomLines = room.lines || {};
  const roomBoxes = room.boxes || {};
  const lastLine = room.lastLine || null;
  const scores = getScores(roomBoxes);
  const boardW = (DOTS_C - 1) * SPACING + PAD * 2;
  const boardH = (DOTS_R - 1) * SPACING + PAD * 2;

  let statusText;
  if (room.status === "done") {
    if (scores.A > scores.B) {
      statusText = myRole === "A" ? "You win!" : myRole === "B" ? "You lose!" : "Player 1 wins!";
    } else if (scores.B > scores.A) {
      statusText = myRole === "B" ? "You win!" : myRole === "A" ? "You lose!" : "Player 2 wins!";
    } else {
      statusText = "It's a draw!";
    }
  } else if (isSpectator) {
    statusText = `Player ${room.turn === "A" ? "1" : "2"}'s turn`;
  } else if (isMyTurn) {
    statusText = "Your turn";
  } else {
    statusText = "Opponent's turn...";
  }

  // Build board elements
  const dots = [];
  for (let r = 0; r < DOTS_R; r++) {
    for (let c = 0; c < DOTS_C; c++) {
      dots.push(
        <div
          key={`dot-${r}-${c}`}
          className="dot"
          style={{ left: PAD + c * SPACING, top: PAD + r * SPACING }}
        />
      );
    }
  }

  const lines = [];
  // Horizontal lines
  for (let r = 0; r < DOTS_R; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = `h-${r}-${c}`;
      const owner = roomLines[key];
      lines.push(
        <div
          key={key}
          className={`line horizontal ${owner ? `placed-${owner.toLowerCase()}` : "empty"} ${key === lastLine ? "last-line" : ""}`}
          style={{
            left: PAD + c * SPACING + 6,
            top: PAD + r * SPACING,
            width: SPACING - 12,
          }}
          onClick={() => !owner && handleLineClick(key)}
        />
      );
    }
  }
  // Vertical lines
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < DOTS_C; c++) {
      const key = `v-${r}-${c}`;
      const owner = roomLines[key];
      lines.push(
        <div
          key={key}
          className={`line vertical ${owner ? `placed-${owner.toLowerCase()}` : "empty"} ${key === lastLine ? "last-line" : ""}`}
          style={{
            left: PAD + c * SPACING,
            top: PAD + r * SPACING + 6,
            height: SPACING - 12,
          }}
          onClick={() => !owner && handleLineClick(key)}
        />
      );
    }
  }

  const boxes = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = `${r}-${c}`;
      const owner = roomBoxes[key];
      if (owner) {
        boxes.push(
          <div
            key={`box-${key}`}
            className={`box owner-${owner.toLowerCase()}`}
            style={{
              left: PAD + c * SPACING + 6,
              top: PAD + r * SPACING + 6,
              width: SPACING - 12,
              height: SPACING - 12,
            }}
          >
            {owner === "A" ? "1" : "2"}
          </div>
        );
      }
    }
  }

  return (
    <div className="game-page">
      <h1>Dots & Boxes</h1>
      {myRole && (
        <p className="player-badge">
          You are Player <span className={myRole.toLowerCase()}>{myRole === "A" ? "1" : "2"}</span>
        </p>
      )}
      <div className="scoreboard">
        <div className={`score player-a ${room.turn === "A" ? "active" : ""}`}>
          P1: {scores.A}
        </div>
        <div className={`score player-b ${room.turn === "B" ? "active" : ""}`}>
          P2: {scores.B}
        </div>
      </div>
      <p className={`status ${isMyTurn && room.status === "playing" ? "your-turn" : ""}`}>
        {statusText}
      </p>
      <div className="board" style={{ width: boardW, height: boardH, position: "relative" }}>
        {boxes}
        {lines}
        {dots}
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
