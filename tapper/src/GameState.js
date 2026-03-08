export const FPS = 60;
export const STATE_PLAY = 0;
export const STATE_LIFE_LOST = 1;
export const STATE_MENU = 2;
export const STATE_GAME_OVER = 3;
export const STATE_READY = 4;
export const STATE_LOADING = 5;
export const STATE_PAUSE = 6;

class GameState {
  #state;

  get state() {
    return this.#state;
  }

  changeState(newState) {
    this.#state = newState;
  }
}

export default new GameState();
