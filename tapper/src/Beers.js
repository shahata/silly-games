import Player from "./Player.js";
import Customers from "./Customers.js";
import LevelManager, {
  ROW_LEFT_BOUNDS,
  ROW_RIGHT_BOUNDS,
  ROW_Y_POSITIONS,
  SCORE_EMPTY_BEER,
} from "./LevelManager.js";
import SoundManager, { GRAB_MUG } from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";
import GameState, { STATE_PLAY } from "./GameState.js";

const SPRITE_FULL_1 = 0;
const SPRITE_FULL_2 = 1;
const SPRITE_EMPTY_1 = 2;
const SPRITE_FALLING = 3;
const SPRITE_BROKEN = 4;

const STEP_FULL = 4;
const STEP_EMPTY = 1;

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

class Glass {
  #sprite = SPRITE_FULL_1;
  xPosition;
  isFull;
  #fpsCount = 0;
  #row;

  constructor(row, xPosition, isFull) {
    this.#row = row;
    this.xPosition = xPosition;
    this.isFull = isFull;
  }

  update() {
    if (this.isFull) {
      if (this.xPosition > ROW_LEFT_BOUNDS[this.#row]) {
        this.#sprite = this.#fpsCount++ & 8 ? SPRITE_FULL_1 : SPRITE_FULL_2;
        this.xPosition -= STEP_FULL;
      } else {
        this.#sprite = SPRITE_BROKEN;
        return true;
      }
    } else {
      if (this.xPosition < ROW_RIGHT_BOUNDS[this.#row] + SPRITE_WIDTH) {
        this.#sprite = SPRITE_EMPTY_1;
        this.xPosition += STEP_EMPTY;
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
      this.xPosition,
      yPosition,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
    );
  }
}

class Beers {
  #glasses;
  #spriteImage = ResourceManager.getImageResource("beer_glass");

  reset() {
    this.#glasses = new Array(5).fill(null).map(() => []);
  }

  add(row, xPosition, isFull) {
    this.#glasses[row].push(new Glass(row, xPosition, isFull));
  }

  #checkCustomerCollision(glass, row) {
    const customer = Customers.getFirstWaitingCustomer(row);
    if (customer && glass.xPosition <= customer.xPosition + 24) {
      customer.catchBeer();
      return true;
    }
    return false;
  }

  #checkPlayerCollision(glass, row) {
    if (glass.xPosition + SPRITE_WIDTH >= Player.xPosition) {
      SoundManager.play(GRAB_MUG);
      LevelManager.addScore(SCORE_EMPTY_BEER);
      return true;
    }
    return false;
  }

  draw(context) {
    for (let row = 1; row <= 4; row++) {
      for (let i = this.#glasses[row].length; i--; i >= 0) {
        const glass = this.#glasses[row][i];
        if (GameState.state === STATE_PLAY) {
          let collision = false;
          if (glass.update()) return true;
          if (glass.isFull) {
            collision = this.#checkCustomerCollision(glass, row);
          } else if (Player.currentRow === row) {
            collision = this.#checkPlayerCollision(glass, row);
          }
          if (collision) this.#glasses[row].splice(i, 1);
        }
        glass.draw(context, this.#spriteImage);
      }
    }
    return false;
  }
}

export default new Beers();
