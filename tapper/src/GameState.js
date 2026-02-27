var g_game_state;

var GameState = {
  FPS: 60,
  STATE_PLAY: 0,
  STATE_LIFELOST: 1,
  STATE_MENU: 2,
  STATE_GAMEOVER: 3,
  STATE_READY: 4,
  STATE_LOADING: 5,
  STATE_PAUSE: 6,
  changeState: function (newState) {
    g_game_state = newState;
  },
  getState: function () {
    return g_game_state;
  },
};

export default GameState;
