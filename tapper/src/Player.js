import Tip from "./Tip.js";
import Beers from "./Beers.js";
import SoundManager, {
  BARMAN_ZIP_DOWN,
  BARMAN_ZIP_UP,
  FULL_MUG,
  MUG_FILL_1,
  MUG_FILL_2,
  THROW_MUG,
} from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";
import GameState, { STATE_PLAY } from "./GameState.js";

export const LEFT = 0;
export const RIGHT = 1;
export const UP = 2;
export const DOWN = 3;
export const FIRE = 4;
export const NONE = 6;
const STEP = 16;

const STAND_L1 = 0;
const STAND_L2 = 1;
const STAND_R1 = 8;
const STAND_R2 = 9;
const RUN_UP_L1 = 12;
const RUN_UP_R1 = 13;
const RUN_DOWN_1 = 14;
const RUN_DOWN_2 = 16;
const RUN_DOWN_3 = 18;
const RUN_DOWN_4 = 20;

const RUN_DOWN_RIGHT_OFFSET = 8;

const TAPPER_1 = 30;
const TAPPER_2 = 31;
const TAPPER_3 = 32;

const SERVE_UP_1_1 = 33;
const SERVE_UP_1_2 = 34;
const SERVE_DOWN_1 = 35;

const SERVE_UP_2_1 = 36;
const SERVE_UP_2_2 = 37;
const SERVE_DOWN_2 = 38;

const BEER_FILL = [null, 39, 40, 41, 42];

const SERVING_MAX = 4;

const LOST_1 = 43;
const LOST_2 = 44;

const GO_1 = 4;
const GO_2 = 5;
const GO_3 = 6;
const GO_4 = 7;

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

const ROW_X_POSITIONS = [null, 336, 368, 400, 432];
const ROW_Y_POSITIONS = [null, 96, 192, 288, 384];
const ROW_LEFT_BOUNDS = [null, 128, 96, 64, 32];
const ROW_RIGHT_BOUNDS = [null, 336, 368, 400, 432];

const DEFAULT_ROW = 2;
const LEG_ANIMATION_TIMING = 20;

class Player {
  #row;
  #xPosition;
  #yPosition;
  #goState;
  #legState;
  #tapperState;
  #playerAction;
  #lastRow;
  #isGamePlay;
  #isGoingLeft;
  #isRunning;
  #isServing;
  #fpsCount;
  #servingCounter = 0;
  #lastXPosition = null;
  #spriteImage = ResourceManager.getImageResource("barman");

  get row() {
    return this.#row;
  }

  get xPosition() {
    return this.#xPosition;
  }

  reset() {
    this.#row = DEFAULT_ROW;
    this.#lastRow = 0;
    this.#xPosition = ROW_X_POSITIONS[this.#row];
    this.#yPosition = ROW_Y_POSITIONS[this.#row];

    this.#playerAction = STAND_L1;

    this.#goState = GO_1;
    this.#legState = RUN_DOWN_1 - 2;
    this.#tapperState = TAPPER_1;

    this.#isGoingLeft = true;
    this.#isRunning = false;
    this.#isGamePlay = true;
    this.#isServing = false;
    this.#fpsCount = 0;
  }

  lost() {
    this.#isRunning = false;
    this.#isServing = false;
    this.#isGamePlay = false;
    this.#playerAction = LOST_1;
  }

  #setAnimation() {
    if (this.#fpsCount++ > LEG_ANIMATION_TIMING && this.#isGamePlay) {
      if (this.#isGoingLeft) {
        this.#playerAction =
          this.#playerAction === STAND_L1 ? STAND_L2 : STAND_L1;
      } else {
        this.#playerAction =
          this.#playerAction === STAND_R1 ? STAND_R2 : STAND_R1;
      }
      this.#fpsCount = 0;
    }
  }

  #drawTapper(context) {
    for (let rowNumber = 1; rowNumber <= 4; rowNumber++) {
      if (this.#row !== rowNumber || !this.#isServing || this.#goState !== 0) {
        this.#drawSprite(
          context,
          TAPPER_1,
          ROW_RIGHT_BOUNDS[rowNumber] + 12,
          ROW_Y_POSITIONS[rowNumber] - 24,
        );
      } else {
        this.#drawSprite(
          context,
          this.#tapperState,
          ROW_RIGHT_BOUNDS[rowNumber] + 12,
          ROW_Y_POSITIONS[rowNumber] - 30,
        );
      }
    }
  }

  #drawSprite(context, sprite, x, y) {
    context.drawImage(
      this.#spriteImage,
      sprite * SPRITE_WIDTH,
      0,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
      x,
      y,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
    );
  }

  #drawServing(context) {
    for (let i = 1, count = this.#servingCounter + 1; i < count; i++) {
      this.#drawSprite(
        context,
        BEER_FILL[i],
        this.#xPosition + 12,
        this.#yPosition + 2,
      );
    }

    if (this.#tapperState === TAPPER_2) {
      this.#drawSprite(
        context,
        SERVE_UP_1_1,
        this.#xPosition - 20,
        this.#yPosition + 2,
      );
      this.#drawSprite(
        context,
        SERVE_UP_1_2,
        this.#xPosition + 12,
        this.#yPosition + 2,
      );
      this.#drawSprite(
        context,
        SERVE_DOWN_1,
        this.#xPosition - 20,
        this.#yPosition + SPRITE_HEIGHT + 2,
      );
    } else {
      this.#drawSprite(
        context,
        SERVE_UP_2_1,
        this.#xPosition - 20,
        this.#yPosition + 2,
      );
      this.#drawSprite(
        context,
        SERVE_UP_2_2,
        this.#xPosition + 12,
        this.#yPosition + 2,
      );
      this.#drawSprite(
        context,
        SERVE_DOWN_2,
        this.#xPosition - 20,
        this.#yPosition + SPRITE_HEIGHT + 2,
      );
    }
  }

  draw(context) {
    this.#drawTapper(context);

    if (this.#lastRow !== 0) {
      this.#drawSprite(
        context,
        this.#goState,
        this.#lastXPosition,
        ROW_Y_POSITIONS[this.#lastRow],
      );
      this.#goState += 1;

      if (this.#goState > GO_4) {
        this.#goState = 0;
        this.#lastRow = 0;
        return true;
      }
      return false;
    }

    if (this.#isServing) {
      this.#drawServing(context);
      return true;
    }

    this.#drawSprite(
      context,
      this.#playerAction,
      this.#xPosition,
      this.#yPosition,
    );

    if (!this.#isRunning) {
      this.#setAnimation();
      this.#drawSprite(
        context,
        2 + this.#playerAction,
        this.#xPosition,
        this.#yPosition + SPRITE_HEIGHT,
      );
    } else if (this.#isGoingLeft) {
      this.#drawSprite(
        context,
        this.#legState,
        this.#xPosition,
        this.#yPosition + SPRITE_HEIGHT,
      );
      this.#drawSprite(
        context,
        this.#legState + 1,
        this.#xPosition + SPRITE_HEIGHT,
        this.#yPosition + SPRITE_HEIGHT,
      );
    } else {
      this.#drawSprite(
        context,
        this.#legState + RUN_DOWN_RIGHT_OFFSET,
        this.#xPosition,
        this.#yPosition + SPRITE_HEIGHT,
      );
      this.#drawSprite(
        context,
        this.#legState + 1 + RUN_DOWN_RIGHT_OFFSET,
        this.#xPosition - SPRITE_HEIGHT,
        this.#yPosition + SPRITE_HEIGHT,
      );
    }

    return true;
  }

  move(direction) {
    if (GameState.state !== STATE_PLAY) return;
    this.#isRunning = false;

    switch (direction) {
      case UP: {
        this.#isServing = false;
        this.#lastRow = this.#row;

        if (this.#row === 1) this.#row = 4;
        else this.#row--;

        this.#goState = GO_1;
        this.#lastXPosition = this.#xPosition;
        this.#xPosition = ROW_X_POSITIONS[this.#row];
        this.#yPosition = ROW_Y_POSITIONS[this.#row];
        SoundManager.play(BARMAN_ZIP_UP);
        break;
      }

      case DOWN: {
        this.#isServing = false;
        this.#lastRow = this.#row;

        if (this.#row === 4) this.#row = 1;
        else this.#row++;

        this.#goState = GO_1;
        this.#lastXPosition = this.#xPosition;
        this.#xPosition = ROW_X_POSITIONS[this.#row];
        this.#yPosition = ROW_Y_POSITIONS[this.#row];
        SoundManager.play(BARMAN_ZIP_DOWN);
        break;
      }

      case LEFT: {
        this.#isServing = false;

        if (this.#isGoingLeft && this.#xPosition > ROW_LEFT_BOUNDS[this.#row]) {
          this.#xPosition -= STEP;
          this.#isRunning = true;
          this.#playerAction = RUN_UP_L1;

          this.#legState += 2;
          if (this.#legState > RUN_DOWN_4) {
            this.#legState = RUN_DOWN_1;
          }

          Tip.collect(this.#row, this.#xPosition);
        }

        this.#isGoingLeft = true;
        break;
      }

      case RIGHT: {
        this.#isServing = false;

        if (
          !this.#isGoingLeft &&
          this.#xPosition < ROW_RIGHT_BOUNDS[this.#row]
        ) {
          this.#xPosition += STEP;
          this.#isRunning = true;
          this.#playerAction = RUN_UP_R1;

          this.#legState += 2;
          if (this.#legState > RUN_DOWN_4) {
            this.#legState = RUN_DOWN_1;
          }
        }

        this.#isGoingLeft = false;
        break;
      }

      case FIRE: {
        if (this.#xPosition !== ROW_RIGHT_BOUNDS[this.#row]) {
          this.#lastRow = this.#row;
          this.#goState = GO_1;
          this.#lastXPosition = this.#xPosition;
          this.#xPosition = ROW_X_POSITIONS[this.#row];
        }

        if (!this.#isServing) {
          this.#servingCounter = 0;
        }

        this.#isServing = true;
        this.#tapperState = TAPPER_3;

        if (this.#servingCounter < SERVING_MAX) {
          this.#servingCounter += 1;

          switch (this.#servingCounter) {
            case 1:
              SoundManager.play(MUG_FILL_1);
              break;
            case 2:
            case 3:
              SoundManager.play(MUG_FILL_2);
              break;
            case SERVING_MAX:
              SoundManager.play(FULL_MUG);
              break;
            default:
              break;
          }
        }

        break;
      }

      case NONE: {
        if (this.#isServing) {
          this.#tapperState = TAPPER_2;

          if (this.#servingCounter === SERVING_MAX) {
            this.#servingCounter = 0;
            Beers.add(this.#row, this.#xPosition - SPRITE_WIDTH, true);
            this.#isServing = false;
            this.#isGoingLeft = false;
            this.#playerAction = STAND_R1;
            SoundManager.play(THROW_MUG);
          }
        } else {
          this.#playerAction = this.#isGoingLeft ? STAND_L1 : STAND_R1;
          this.#legState = RUN_DOWN_1 - 2;
        }

        break;
      }

      default:
        break;
    }
  }
}

export default new Player();
