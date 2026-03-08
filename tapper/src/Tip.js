import LevelManager, {
  SCORE_BONUS,
  ROW_LEFT_BOUNDS,
  ROW_RIGHT_BOUNDS,
  ROW_Y_POSITIONS,
} from "./LevelManager.js";
import SoundManager, { COLLECT_TIP, TIP_APPEAR } from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";

const TIP_OFFSET = 5;
const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;
const TIP_TIMEOUT_MS = 10 * 1000;

class Tip {
  #visible = false;
  #timeoutReached = true;
  #xPosition = 100;
  #yPosition = 0;
  #row = 1;
  #spriteImage = ResourceManager.getImageResource("beer_glass");

  reset() {
    this.#timeoutReached = true;
    this.#visible = false;
  }

  add(row, customerXPosition) {
    if (!this.#visible && this.#timeoutReached) {
      if (
        customerXPosition - ROW_LEFT_BOUNDS[row] <
        (ROW_RIGHT_BOUNDS[row] - ROW_LEFT_BOUNDS[row]) / 3
      ) {
        if (Math.floor(Math.random() * 6) === row) {
          this.#visible = true;
          this.#row = row;
          this.#xPosition = customerXPosition;
          this.#yPosition = ROW_Y_POSITIONS[row] + 16;
          this.#timeoutReached = false;

          setTimeout(() => {
            this.#visible = false;
            this.#timeoutReached = true;
          }, TIP_TIMEOUT_MS);

          SoundManager.play(TIP_APPEAR);
        }
      }
    }
  }

  collect(row, xPosition) {
    if (
      this.#visible &&
      this.#row === row &&
      xPosition <= this.#xPosition + SPRITE_WIDTH
    ) {
      this.#visible = false;
      LevelManager.addScore(SCORE_BONUS);
      SoundManager.play(COLLECT_TIP);
    }
  }

  draw(context) {
    if (this.#visible) {
      context.drawImage(
        this.#spriteImage,
        TIP_OFFSET * SPRITE_WIDTH,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.#xPosition,
        this.#yPosition,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    }
  }
}

export default new Tip();
