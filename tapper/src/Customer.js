import Beers, { EMPTY_MUG } from "./Beers.js";
import LevelManager from "./LevelManager.js";
import { FPS } from "./GameState.js";
import customers from "./Customers.js";

const HOLDING_BEER_1 = 4;
const HOLDING_BEER_2 = 7;
const DRINKING_BEER_1 = 5;
const DRINKING_BEER_2 = 8;
const REGULAR_1 = 0;
const REGULAR_2 = 1;
const ANGRY_1 = 2;
const ANGRY_2 = 3;

const MOVING_PATTERN_BY_ROW = [
  null,
  [
    REGULAR_1,
    REGULAR_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
  ],
  [
    REGULAR_1,
    REGULAR_2,
    REGULAR_1,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
  ],
  [
    REGULAR_1,
    REGULAR_2,
    REGULAR_1,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
  ],
  [
    REGULAR_1,
    REGULAR_2,
    REGULAR_1,
    REGULAR_2,
    ANGRY_1,
    ANGRY_2,
    ANGRY_1,
    ANGRY_2,
  ],
];

const SPRITE_WIDTH = 32;
const STEP = 1;

export const CUSTOMER_STATE_WAIT = 0;
const CUSTOMER_STATE_CATCH = 1;
const CUSTOMER_STATE_DRINK = 2;

export default class Customer {
  state = CUSTOMER_STATE_WAIT;
  type;
  sprite = 0;
  secondarySprite = 0;
  #movingPattern;
  #animationCounter = -1;
  xPosition;
  yPosition;
  secondaryYPosition;
  row;
  #leftBound;
  #rightBound;
  #fpsCount = 0;
  #fpsMax;
  #targetXPosition = 0;
  endOfRow = false;
  isOut = false;

  constructor(row, type, position) {
    this.type = type;
    this.#movingPattern = MOVING_PATTERN_BY_ROW[row];
    this.#leftBound = LevelManager.rowLeftBounds[row];
    this.#rightBound = LevelManager.rowRightBounds[row];
    this.xPosition = this.#leftBound + (position - 1) * SPRITE_WIDTH;
    this.yPosition = LevelManager.rowYPositions[row];
    this.secondaryYPosition = this.yPosition;
    this.row = row;
    this.#fpsMax = FPS >> 3;
  }

  update() {
    switch (this.state) {
      case CUSTOMER_STATE_WAIT: {
        if (this.#fpsCount++ > this.#fpsMax) {
          this.#animationCounter++;
          this.sprite = this.#movingPattern[this.#animationCounter] << 5;
          if (this.#animationCounter === this.#movingPattern.length) {
            this.#animationCounter = -1;
          }
          this.#fpsCount = 0;
        }

        if (this.#movingPattern[this.#animationCounter] < 2) {
          if (this.xPosition < this.#rightBound) {
            this.xPosition += STEP;
          } else {
            this.endOfRow = true;
          }
        }
        break;
      }

      case CUSTOMER_STATE_CATCH: {
        this.xPosition -= STEP * 2;
        if (this.xPosition < this.#leftBound) {
          this.isOut = true;
        } else if (this.xPosition < this.#targetXPosition) {
          this.#fpsCount = 0;
          this.#animationCounter = 0;
          this.state = CUSTOMER_STATE_DRINK;
          this.sprite = DRINKING_BEER_1 << 5;
          this.secondarySprite = DRINKING_BEER_2 << 5;
          this.secondaryYPosition = this.yPosition;
        }
        break;
      }

      case CUSTOMER_STATE_DRINK: {
        if (this.#fpsCount++ > this.#fpsMax) {
          this.#animationCounter++;
          this.#fpsCount = 0;
        }

        if (this.#animationCounter === 3) {
          this.state = CUSTOMER_STATE_WAIT;
          this.#animationCounter = -1;
          this.#fpsCount = 0;
          this.sprite = this.#movingPattern[0] << 5;
          Beers.add(this.row, this.xPosition + SPRITE_WIDTH, EMPTY_MUG);
          customers.checkBonus(this.row, this.xPosition);
        }
        break;
      }

      default:
        break;
    }
  }

  catchBeer() {
    this.#targetXPosition =
      this.xPosition - ((this.#rightBound - this.#leftBound) / 5) * 2;
    this.state = CUSTOMER_STATE_CATCH;
    this.sprite = HOLDING_BEER_1 << 5;
    this.secondarySprite = HOLDING_BEER_2 << 5;
    this.secondaryYPosition = this.yPosition + 8;
  }
}
