import Beers from "./Beers.js";
import {
  ROW_LEFT_BOUNDS,
  ROW_RIGHT_BOUNDS,
  ROW_Y_POSITIONS,
} from "./LevelManager.js";
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

const MOVING_PATTERN = [
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

const CUSTOMER_STATE_WAIT = 0;
const CUSTOMER_STATE_CATCH = 1;
const CUSTOMER_STATE_DRINK = 2;

export default class Customer {
  #state = CUSTOMER_STATE_WAIT;
  #row;
  #type;
  #sprite = REGULAR_1;
  #secondarySprite = 0;
  #secondaryYPosition;
  #fpsCount = 0;
  #targetXPosition = 0;
  xPosition;
  #yPosition;

  constructor(row, type, position) {
    this.#row = row;
    this.#type = type;
    this.xPosition = ROW_LEFT_BOUNDS[row] + (position - 1) * SPRITE_WIDTH;
    this.#yPosition = ROW_Y_POSITIONS[row];
  }

  waiting() {
    return this.#state === CUSTOMER_STATE_WAIT;
  }

  update() {
    switch (this.#state) {
      case CUSTOMER_STATE_WAIT: {
        this.#fpsCount++;
        const current =
          Math.floor((4 * this.#fpsCount) / FPS) %
          MOVING_PATTERN[this.#row].length;
        this.#sprite = MOVING_PATTERN[this.#row][current];

        if (this.#sprite === REGULAR_1 || this.#sprite === REGULAR_2) {
          this.xPosition += STEP;
          if (this.xPosition >= ROW_RIGHT_BOUNDS[this.#row]) return true;
        }
        break;
      }

      case CUSTOMER_STATE_CATCH: {
        this.xPosition -= STEP * 2;
        if (this.xPosition < this.#targetXPosition) {
          this.#fpsCount = 0;
          this.#state = CUSTOMER_STATE_DRINK;
          this.#sprite = DRINKING_BEER_1;
          this.#secondarySprite = DRINKING_BEER_2;
          this.#secondaryYPosition = this.#yPosition;
        }
        break;
      }

      case CUSTOMER_STATE_DRINK: {
        if (this.#fpsCount++ >= FPS / 3) {
          this.#fpsCount = 0;
          this.#state = CUSTOMER_STATE_WAIT;
          this.#sprite = MOVING_PATTERN[this.#row][0];
          Beers.add(this.#row, this.xPosition + SPRITE_WIDTH, false);
          customers.checkBonus(this.#row, this.xPosition);
        }
        break;
      }
    }
  }

  catchBeer() {
    this.#targetXPosition =
      this.xPosition -
      ((ROW_RIGHT_BOUNDS[this.#row] - ROW_LEFT_BOUNDS[this.#row]) / 5) * 2;
    this.#state = CUSTOMER_STATE_CATCH;
    this.#sprite = HOLDING_BEER_1;
    this.#secondarySprite = HOLDING_BEER_2;
    this.#secondaryYPosition = this.#yPosition + 8;
  }

  draw(context, spriteImage) {
    context.drawImage(
      spriteImage,
      this.#sprite * SPRITE_WIDTH,
      SPRITE_HEIGHT * this.#type,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
      this.xPosition,
      this.#yPosition,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
    );

    if (this.#state !== CUSTOMER_STATE_WAIT) {
      context.drawImage(
        spriteImage,
        this.#secondarySprite * SPRITE_WIDTH,
        SPRITE_HEIGHT * this.#type,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.xPosition + 32,
        this.#secondaryYPosition,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    }
  }
}
