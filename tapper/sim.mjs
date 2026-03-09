const loadCallbacks = [];
const noop = () => {};
const mockCtx = {
  drawImage: noop, fillRect: noop, strokeRect: noop, fillText: noop,
  canvas: { width: 512, height: 480 },
  fillStyle: "", strokeStyle: "", font: "", textBaseline: "",
};
const mockAudio = () => ({
  src: "", autobuffer: false, preload: "", currentTime: 0,
  loop: false, paused: true, ended: false,
  addEventListener: (_, cb) => loadCallbacks.push(cb),
  load: noop, pause: noop, play: noop,
  cloneNode: () => mockAudio(),
});
globalThis.document = {
  createElement: (tag) => {
    if (tag === "audio") return mockAudio();
    if (tag === "canvas") return { width: 0, height: 0, getContext: () => mockCtx };
    return {};
  },
  getElementById: () => ({
    getBoundingClientRect: () => ({ top: 0 }),
    appendChild: noop, addEventListener: noop,
  }),
  addEventListener: noop,
};
globalThis.window = { innerWidth: 512, innerHeight: 480, addEventListener: noop };
globalThis.Image = class {
  addEventListener(_, cb) { loadCallbacks.push(cb); }
  set src(v) { this._src = v; }
  get src() { return this._src || ""; }
};

const { default: Player } = await import("./src/Player.js");
const { default: Customers } = await import("./src/Customers.js");
const { default: Beers } = await import("./src/Beers.js");
const { default: Tip } = await import("./src/Tip.js");
const { default: LevelManager } = await import("./src/LevelManager.js");
const { default: AutoPlayer } = await import("./src/AutoPlayer.js");
const { default: GameState, STATE_PLAY } = await import("./src/GameState.js");

for (const cb of loadCallbacks) cb();

function simulate(difficulty, maxFrames = 60 * 180) {
  LevelManager.newGame();
  for (let i = 1; i < difficulty; i++) LevelManager.increaseDifficulty();
  GameState.changeState(STATE_PLAY);
  Player.reset();
  Beers.reset();
  Tip.reset();
  Customers.reset();
  if (!AutoPlayer.active) AutoPlayer.toggle();

  for (let frame = 1; frame <= maxFrames; frame++) {
    const custLost = Customers.draw(mockCtx);
    const beerLost = Beers.draw(mockCtx);
    if (custLost || beerLost) {
      return { frame, lost: true, custLost, score: LevelManager.score, difficulty: LevelManager.difficulty };
    }
    Tip.draw(mockCtx);
    AutoPlayer.update();
    Player.draw(mockCtx);
  }
  return { frame: maxFrames, lost: false, score: LevelManager.score, difficulty: LevelManager.difficulty };
}

const N = 50;
for (let d = 3; d <= 6; d++) {
  let survived = 0, custLosses = 0, beerLosses = 0, totalLossFrame = 0;
  let totalScore = 0, maxDiff = 0;
  for (let t = 0; t < N; t++) {
    const r = simulate(d);
    totalScore += r.score;
    if (r.difficulty > maxDiff) maxDiff = r.difficulty;
    if (!r.lost) survived++;
    else {
      if (r.custLost) custLosses++;
      else beerLosses++;
      totalLossFrame += r.frame;
    }
  }
  const losses = N - survived;
  const avg = losses ? (totalLossFrame / losses / 60).toFixed(0) : "-";
  const avgScore = (totalScore / N).toFixed(0);
  console.log(`d${d}: ${survived}/${N} survived | ${custLosses}C ${beerLosses}B losses | avg ${avg}s | avgScore ${avgScore} | maxDiff ${maxDiff}`);
}
