import Beers from "./Beers.js";
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
    new Array(2).fill(0).map((_, i) => (i % 2 === 0 ? REGULAR_1 : REGULAR_2)),
    new Array(14).fill(0).map((_, i) => (i % 2 === 0 ? ANGRY_1 : ANGRY_2)),
  ].flat(),
  [
    new Array(3).fill(0).map((_, i) => (i % 2 === 0 ? REGULAR_1 : REGULAR_2)),
    new Array(10).fill(0).map((_, i) => (i % 2 === 0 ? ANGRY_1 : ANGRY_2)),
  ].flat(),
  [
    new Array(3).fill(0).map((_, i) => (i % 2 === 0 ? REGULAR_1 : REGULAR_2)),
    new Array(6).fill(0).map((_, i) => (i % 2 === 0 ? ANGRY_1 : ANGRY_2)),
  ].flat(),
  [
    new Array(4).fill(0).map((_, i) => (i % 2 === 0 ? REGULAR_1 : REGULAR_2)),
    new Array(4).fill(0).map((_, i) => (i % 2 === 0 ? ANGRY_1 : ANGRY_2)),
  ].flat(),
];

const STEP = 1;
const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;
const FPS_MAX = FPS >> 3;

const CUSTOMER_STATE_WAIT = 0;
const CUSTOMER_STATE_CATCH = 1;
const CUSTOMER_STATE_DRINK = 2;

export default class Customer {
  #state = CUSTOMER_STATE_WAIT;
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
  }

  waiting() {
    return this.#state === CUSTOMER_STATE_WAIT;
  }

  update() {
    switch (this.#state) {
      case CUSTOMER_STATE_WAIT: {
        if (this.#fpsCount++ > FPS_MAX) {
          this.#animationCounter++;
          this.sprite = this.#movingPattern[this.#animationCounter] << 5;
          if (this.#animationCounter === this.#movingPattern.length) {
            this.#animationCounter = -1;
          }
          this.#fpsCount = 0;
        }

        if (
          this.#movingPattern[this.#animationCounter] === REGULAR_1 ||
          this.#movingPattern[this.#animationCounter] === REGULAR_2
        ) {
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
          this.#state = CUSTOMER_STATE_DRINK;
          this.sprite = DRINKING_BEER_1 << 5;
          this.secondarySprite = DRINKING_BEER_2 << 5;
          this.secondaryYPosition = this.yPosition;
        }
        break;
      }

      case CUSTOMER_STATE_DRINK: {
        if (this.#fpsCount++ > FPS_MAX) {
          this.#animationCounter++;
          this.#fpsCount = 0;
        }

        if (this.#animationCounter === 3) {
          this.#state = CUSTOMER_STATE_WAIT;
          this.#animationCounter = -1;
          this.#fpsCount = 0;
          this.sprite = this.#movingPattern[0] << 5;
          Beers.add(this.row, this.xPosition + SPRITE_WIDTH, false);
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
    this.#state = CUSTOMER_STATE_CATCH;
    this.sprite = HOLDING_BEER_1 << 5;
    this.secondarySprite = HOLDING_BEER_2 << 5;
    this.secondaryYPosition = this.yPosition + 8;
  }

  draw(context, spriteImage) {
    context.drawImage(
      spriteImage,
      this.sprite,
      SPRITE_HEIGHT * this.type,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
      this.xPosition,
      this.yPosition,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
    );

    if (this.#state !== CUSTOMER_STATE_WAIT) {
      context.drawImage(
        spriteImage,
        this.secondarySprite,
        SPRITE_HEIGHT * this.type,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.xPosition + 32,
        this.secondaryYPosition,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    }
  }
}
