import {
  ROW_LEFT_BOUNDS,
  ROW_RIGHT_BOUNDS,
  ROW_Y_POSITIONS,
} from "./LevelManager.js";

const SPRITE_FULL_1 = 0;
const SPRITE_FULL_2 = 1;
const SPRITE_EMPTY_1 = 2;
const SPRITE_FALLING = 3;
const SPRITE_BROKEN = 4;

const STEP_FULL = 4;
const STEP_EMPTY = 1;

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

export default class BeerGlass {
  #sprite = SPRITE_FULL_1;
  #xPosition;
  #isFull;
  #fpsCount = 0;
  #row;

  constructor(row, xPosition, isFull) {
    this.#row = row;
    this.#xPosition = xPosition;
    this.#isFull = isFull;
  }

  get xPosition() {
    return this.#xPosition;
  }

  get isFull() {
    return this.#isFull;
  }

  update() {
    if (this.#isFull) {
      if (this.#xPosition > ROW_LEFT_BOUNDS[this.#row]) {
        this.#sprite = this.#fpsCount++ & 8 ? SPRITE_FULL_1 : SPRITE_FULL_2;
        this.#xPosition -= STEP_FULL;
      } else {
        this.#sprite = SPRITE_BROKEN;
        return true;
      }
    } else {
      if (this.#xPosition < ROW_RIGHT_BOUNDS[this.#row] + SPRITE_WIDTH) {
        this.#sprite = SPRITE_EMPTY_1;
        this.#xPosition += STEP_EMPTY;
      } else {
        this.#sprite = SPRITE_FALLING;
        return true;
      }
    }
  }

  draw(context, spriteImage) {
    let yPosition = ROW_Y_POSITIONS[this.#row] + 8;
    if (this.#sprite === SPRITE_FALLING) yPosition += SPRITE_HEIGHT;
    context.drawImage(
      spriteImage,
      this.#sprite * SPRITE_WIDTH,
      0,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
      this.#xPosition,
      yPosition,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
    );
  }
}
