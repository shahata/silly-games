const GameState = {
  FPS: 60,
  STATE_PLAY: 0,
  STATE_LIFELOST: 1,
  STATE_MENU: 2,
  STATE_GAMEOVER: 3,
  STATE_READY: 4,
  STATE_LOADING: 5,
  STATE_PAUSE: 6,
  _state: undefined,
  changeState(newState) {
    this._state = newState;
  },
  getState() {
    return this._state;
  },
};

export default GameState;
