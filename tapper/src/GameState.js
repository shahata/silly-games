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
  #speed = 1;

  get state() {
    return this.#state;
  }

  get speed() {
    return this.#speed;
  }

  faster() {
    this.#speed = Math.min(this.#speed + 0.25, 3);
  }

  slower() {
    this.#speed = Math.max(this.#speed - 0.25, 0.25);
  }

  changeState(newState) {
    this.#state = newState;
  }
}

export default new GameState();
