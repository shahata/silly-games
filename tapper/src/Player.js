import Customers from "./Customers.js";
import Beers from "./Beers.js";
import SoundManager, {
  BARMAN_ZIP_DOWN,
  BARMAN_ZIP_UP,
  FULL_MUG as SOUND_FULL_MUG,
  MUG_FILL_1,
  MUG_FILL_2,
  THROW_MUG,
} from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";

const STEP = 16;
export const LEFT = 0;
export const RIGHT = 1;
export const UP = 2;
export const DOWN = 3;
export const FIRE = 4;
export const NONE = 6;

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
const SPRITE_SHIFT = 5;

const ROW_X_POSITIONS = [null, 336, 368, 400, 432];
const ROW_Y_POSITIONS = [null, 96, 192, 288, 384];

const ROW_LEFT_BOUNDS = [null, 128, 96, 64, 32];
const ROW_RIGHT_BOUNDS = [null, 336, 368, 400, 432];

const DEFAULT_ROW = 2;
const DEFAULT_PLAYER_X = 336;
const DEFAULT_PLAYER_Y = 192;
const LEG_ANIMATION_TIMING = 20;

class Player {
  #spriteImage = null;
  #goState = 0;
  #legState = 0;
  #tapperState = 0;
  #servingCounter = 0;
  #playerAction = null;
  #isGamePlay = false;
  currentRow = DEFAULT_ROW;
  #lastRow = 0;
  #lastPlayerXPosition = null;
  #isPlayerGoingLeft = true;
  #isPlayerRunning = false;
  #isTapperServing = false;
  playerXPosition = DEFAULT_PLAYER_X;
  #playerYPosition = DEFAULT_PLAYER_Y;
  #fpsCount = 0;

  init() {
    this.#spriteImage = ResourceManager.getImageResource("barman");
  }

  reset() {
    this.currentRow = DEFAULT_ROW;
    this.#lastRow = 0;
    this.playerXPosition = DEFAULT_PLAYER_X;
    this.#playerYPosition = DEFAULT_PLAYER_Y;

    this.#playerAction = STAND_L1;

    this.#goState = GO_1;
    this.#legState = RUN_DOWN_1 - 2;
    this.#tapperState = TAPPER_1;

    this.#isPlayerGoingLeft = true;
    this.#isPlayerRunning = false;
    this.#isGamePlay = true;
    this.#isTapperServing = false;
    this.#fpsCount = 0;
  }

  lost() {
    this.#isPlayerRunning = false;
    this.#isTapperServing = false;
    this.#isGamePlay = false;
    this.#playerAction = LOST_1;
  }

  #setAnimation() {
    if (this.#fpsCount++ > LEG_ANIMATION_TIMING && this.#isGamePlay) {
      if (this.#isPlayerGoingLeft) {
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
    for (let rowNumber = 1; rowNumber < 5; rowNumber++) {
      if (
        this.currentRow !== rowNumber ||
        !this.#isTapperServing ||
        this.#goState !== 0
      ) {
        context.drawImage(
          this.#spriteImage,
          TAPPER_1 << SPRITE_SHIFT,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          ROW_RIGHT_BOUNDS[rowNumber] + 12,
          ROW_Y_POSITIONS[rowNumber] - 24,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
        );
      } else {
        context.drawImage(
          this.#spriteImage,
          this.#tapperState << SPRITE_SHIFT,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          ROW_RIGHT_BOUNDS[rowNumber] + 12,
          ROW_Y_POSITIONS[rowNumber] - 30,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
        );
      }
    }
  }

  #drawServing(context) {
    for (let i = 1, count = this.#servingCounter + 1; i < count; i++) {
      context.drawImage(
        this.#spriteImage,
        BEER_FILL[i] << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition + 12,
        this.#playerYPosition + 2,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    }

    if (this.#tapperState === TAPPER_2) {
      context.drawImage(
        this.#spriteImage,
        SERVE_UP_1_1 << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition - 20,
        this.#playerYPosition + 2,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );

      context.drawImage(
        this.#spriteImage,
        SERVE_UP_1_2 << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition + 12,
        this.#playerYPosition + 2,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );

      context.drawImage(
        this.#spriteImage,
        SERVE_DOWN_1 << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition - 20,
        this.#playerYPosition + SPRITE_HEIGHT + 2,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    } else {
      context.drawImage(
        this.#spriteImage,
        SERVE_UP_2_1 << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition - 20,
        this.#playerYPosition + 2,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );

      context.drawImage(
        this.#spriteImage,
        SERVE_UP_2_2 << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition + 12,
        this.#playerYPosition + 2,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );

      context.drawImage(
        this.#spriteImage,
        SERVE_DOWN_2 << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition - 20,
        this.#playerYPosition + SPRITE_HEIGHT + 2,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    }
  }

  draw(context) {
    this.#drawTapper(context);

    if (this.#lastRow !== 0) {
      context.drawImage(
        this.#spriteImage,
        this.#goState << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.#lastPlayerXPosition,
        ROW_Y_POSITIONS[this.#lastRow],
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
      this.#goState += 1;

      if (this.#goState > GO_4) {
        this.#goState = 0;
        this.#lastRow = 0;
        return true;
      }
      return false;
    }

    if (this.#isTapperServing) {
      this.#drawServing(context);
      return true;
    }

    context.drawImage(
      this.#spriteImage,
      this.#playerAction << SPRITE_SHIFT,
      0,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
      this.playerXPosition,
      this.#playerYPosition,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
    );

    if (!this.#isPlayerRunning) {
      this.#setAnimation();

      context.drawImage(
        this.#spriteImage,
        (2 + this.#playerAction) << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition,
        this.#playerYPosition + SPRITE_HEIGHT,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    } else if (this.#isPlayerGoingLeft) {
      context.drawImage(
        this.#spriteImage,
        this.#legState << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition,
        this.#playerYPosition + SPRITE_HEIGHT,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );

      context.drawImage(
        this.#spriteImage,
        (this.#legState + 1) << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition + SPRITE_HEIGHT,
        this.#playerYPosition + SPRITE_HEIGHT,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    } else {
      context.drawImage(
        this.#spriteImage,
        (this.#legState + RUN_DOWN_RIGHT_OFFSET) << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition,
        this.#playerYPosition + SPRITE_HEIGHT,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );

      context.drawImage(
        this.#spriteImage,
        (this.#legState + 1 + RUN_DOWN_RIGHT_OFFSET) << SPRITE_SHIFT,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.playerXPosition - SPRITE_HEIGHT,
        this.#playerYPosition + SPRITE_HEIGHT,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    }

    return true;
  }

  move(direction) {
    this.#isPlayerRunning = false;

    switch (direction) {
      case UP: {
        this.#isTapperServing = false;
        this.#lastRow = this.currentRow;
        this.currentRow -= 1;

        if (this.currentRow === 0) {
          this.currentRow = 4;
        }

        this.#goState = GO_1;
        this.#lastPlayerXPosition = this.playerXPosition;
        this.playerXPosition = ROW_X_POSITIONS[this.currentRow];
        this.#playerYPosition = ROW_Y_POSITIONS[this.currentRow];
        SoundManager.play(BARMAN_ZIP_UP);
        break;
      }

      case DOWN: {
        this.#isTapperServing = false;
        this.#lastRow = this.currentRow;
        this.currentRow += 1;

        if (this.currentRow === 5) {
          this.currentRow = 1;
        }

        this.#goState = GO_1;
        this.#lastPlayerXPosition = this.playerXPosition;
        this.playerXPosition = ROW_X_POSITIONS[this.currentRow];
        this.#playerYPosition = ROW_Y_POSITIONS[this.currentRow];
        SoundManager.play(BARMAN_ZIP_DOWN);
        break;
      }

      case LEFT: {
        this.#isTapperServing = false;

        if (
          this.#isPlayerGoingLeft &&
          this.playerXPosition > ROW_LEFT_BOUNDS[this.currentRow]
        ) {
          this.playerXPosition -= STEP;
          this.#isPlayerRunning = true;
          this.#playerAction = RUN_UP_L1;

          this.#legState += 2;
          if (this.#legState > RUN_DOWN_4) {
            this.#legState = RUN_DOWN_1;
          }

          Customers.checkBonusCollision(this.currentRow, this.playerXPosition);
        }

        this.#isPlayerGoingLeft = true;
        break;
      }

      case RIGHT: {
        this.#isTapperServing = false;

        if (
          !this.#isPlayerGoingLeft &&
          this.playerXPosition < ROW_RIGHT_BOUNDS[this.currentRow]
        ) {
          this.playerXPosition += STEP;
          this.#isPlayerRunning = true;
          this.#playerAction = RUN_UP_R1;

          this.#legState += 2;
          if (this.#legState > RUN_DOWN_4) {
            this.#legState = RUN_DOWN_1;
          }
        }

        this.#isPlayerGoingLeft = false;
        break;
      }

      case FIRE: {
        if (this.playerXPosition !== ROW_RIGHT_BOUNDS[this.currentRow]) {
          this.#lastRow = this.currentRow;
          this.#goState = GO_1;
          this.#lastPlayerXPosition = this.playerXPosition;
          this.playerXPosition = ROW_X_POSITIONS[this.currentRow];
        }

        if (!this.#isTapperServing) {
          this.#servingCounter = 0;
        }

        this.#isTapperServing = true;
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
              SoundManager.play(SOUND_FULL_MUG);
              break;
            default:
              break;
          }
        }

        break;
      }

      case NONE: {
        if (this.#isTapperServing) {
          this.#tapperState = TAPPER_2;

          if (this.#servingCounter === SERVING_MAX) {
            this.#servingCounter = 0;
            Beers.add(
              this.currentRow,
              this.playerXPosition - SPRITE_WIDTH,
              true,
            );
            this.#isTapperServing = false;
            this.#isPlayerGoingLeft = false;
            this.#playerAction = STAND_R1;
            SoundManager.play(THROW_MUG);
          }
        } else {
          this.#playerAction = this.#isPlayerGoingLeft ? STAND_L1 : STAND_R1;
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
