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

const STAND_LEFT = [0, 1];
const STAND_RIGHT = [8, 9];
const RUN_UP_LEFT = 12;
const RUN_UP_RIGHT = 13;
const RUN_DOWN = [14, 16, 18, 20];
const RUN_DOWN_RIGHT_OFFSET = 8;
const GO = [4, 5, 6, 7];

const TAPPER = [30, 31, 32];
const SERVE_UP_A = [null, 33, 36];
const SERVE_UP_B = [null, 34, 37];
const SERVE_DOWN = [null, 35, 38];
const BEER_FILL = [39, 40, 41, 42];
const LOST = 43;

const ROW_X_POSITIONS = [null, 336, 368, 400, 432];
const ROW_Y_POSITIONS = [null, 96, 192, 288, 384];
const ROW_LEFT_BOUNDS = [null, 128, 96, 64, 32];
const ROW_RIGHT_BOUNDS = [null, 336, 368, 400, 432];

const STEP = 16;
const DEFAULT_ROW = 2;
const SERVING_MAX = 4;
const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;
const LEG_ANIMATION_TIMING = 20;

class Player {
  #row;
  #lastRow;
  #lastXPosition;
  #xPosition;
  #yPosition;
  #goState;
  #legState;
  #fillState;
  #tapperState;
  #playerAction;
  #faceLeft;
  #isRunning;
  #fpsCount;
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
    this.#lastXPosition = null;
    this.#xPosition = ROW_X_POSITIONS[this.#row];
    this.#yPosition = ROW_Y_POSITIONS[this.#row];

    this.#goState = 0;
    this.#legState = 0;
    this.#fillState = 0;
    this.#tapperState = 0;
    this.#playerAction = STAND_LEFT[0];

    this.#faceLeft = true;
    this.#isRunning = false;
    this.#fpsCount = 0;
  }

  lost() {
    this.#fillState = 0;
    this.#isRunning = false;
    this.#playerAction = LOST;
  }

  #setAnimation() {
    if (GameState.state !== STATE_PLAY) return;
    let x = Math.floor(this.#fpsCount++ / LEG_ANIMATION_TIMING);
    if (this.#faceLeft) this.#playerAction = STAND_LEFT[x % STAND_LEFT.length];
    else this.#playerAction = STAND_RIGHT[x % STAND_RIGHT.length];
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

  #drawSquare(context, fourCorners, offset = [0, 0]) {
    const locations = [
      [0, 0],
      [SPRITE_WIDTH, 0],
      [0, SPRITE_HEIGHT],
      [SPRITE_WIDTH, SPRITE_HEIGHT],
    ];
    for (let i = 0; i < 4; i++) {
      if (fourCorners[i] === null) continue;
      this.#drawSprite(
        context,
        fourCorners[i],
        this.#xPosition + locations[i][0] + offset[0],
        this.#yPosition + locations[i][1] + offset[1],
      );
    }
  }

  #drawTap(context) {
    for (let rowNumber = 1; rowNumber <= 4; rowNumber++) {
      if (this.#row === rowNumber && this.#fillState > 0) {
        this.#drawSprite(
          context,
          TAPPER[this.#tapperState],
          ROW_RIGHT_BOUNDS[rowNumber] + 12,
          ROW_Y_POSITIONS[rowNumber] - 30,
        );
      } else {
        this.#drawSprite(
          context,
          TAPPER[0],
          ROW_RIGHT_BOUNDS[rowNumber] + 12,
          ROW_Y_POSITIONS[rowNumber] - 24,
        );
      }
    }
  }

  #drawServing(context) {
    for (let i = 0; i < this.#fillState; i++) {
      this.#drawSprite(
        context,
        BEER_FILL[i],
        this.#xPosition + 12,
        this.#yPosition + 2,
      );
    }
    this.#drawSquare(
      context,
      [
        SERVE_UP_A[this.#tapperState],
        SERVE_UP_B[this.#tapperState],
        SERVE_DOWN[this.#tapperState],
        null,
      ],
      [-20, 2],
    );
  }

  #drawStanding(context) {
    this.#setAnimation();
    this.#drawSquare(context, [
      this.#playerAction,
      null,
      2 + this.#playerAction,
      null,
    ]);
  }

  #drawRunningLeft(context) {
    this.#drawSquare(context, [
      this.#playerAction,
      null,
      RUN_DOWN[this.#legState],
      RUN_DOWN[this.#legState] + 1,
    ]);
  }

  #drawRunningRight(context) {
    this.#drawSquare(
      context,
      [
        null,
        this.#playerAction,
        RUN_DOWN[this.#legState] + RUN_DOWN_RIGHT_OFFSET + 1,
        RUN_DOWN[this.#legState] + RUN_DOWN_RIGHT_OFFSET,
      ],
      [-SPRITE_WIDTH, 0],
    );
  }

  #drawWind(context) {
    this.#drawSprite(
      context,
      GO[this.#goState],
      this.#lastXPosition,
      ROW_Y_POSITIONS[this.#lastRow],
    );
    return !GO[++this.#goState];
  }

  draw(context) {
    this.#drawTap(context);
    if (GO[this.#goState]) return this.#drawWind(context);
    if (this.#fillState > 0) this.#drawServing(context);
    else if (!this.#isRunning) this.#drawStanding(context);
    else if (this.#faceLeft) this.#drawRunningLeft(context);
    else this.#drawRunningRight(context);
    return true;
  }

  move(key) {
    if (GameState.state !== STATE_PLAY) return;
    this.#isRunning = false;

    switch (key) {
      case "ArrowUp": {
        this.#goState = 0;
        this.#fillState = 0;
        this.#lastRow = this.#row;
        if (--this.#row === 0) this.#row = 4;
        this.#lastXPosition = this.#xPosition;
        this.#xPosition = ROW_X_POSITIONS[this.#row];
        this.#yPosition = ROW_Y_POSITIONS[this.#row];
        SoundManager.play(BARMAN_ZIP_UP);
        break;
      }

      case "ArrowDown": {
        this.#goState = 0;
        this.#fillState = 0;
        this.#lastRow = this.#row;
        if (++this.#row > 4) this.#row = 1;
        this.#lastXPosition = this.#xPosition;
        this.#xPosition = ROW_X_POSITIONS[this.#row];
        this.#yPosition = ROW_Y_POSITIONS[this.#row];
        SoundManager.play(BARMAN_ZIP_DOWN);
        break;
      }

      case "ArrowLeft": {
        this.#fillState = 0;
        if (this.#faceLeft && this.#xPosition > ROW_LEFT_BOUNDS[this.#row]) {
          this.#xPosition -= STEP;
          this.#isRunning = true;
          this.#playerAction = RUN_UP_LEFT;
          this.#legState = (this.#legState + 1) % RUN_DOWN.length;
          Tip.collect(this.#row, this.#xPosition);
        }
        this.#faceLeft = true;
        break;
      }

      case "ArrowRight": {
        this.#fillState = 0;
        if (!this.#faceLeft && this.#xPosition < ROW_RIGHT_BOUNDS[this.#row]) {
          this.#xPosition += STEP;
          this.#isRunning = true;
          this.#playerAction = RUN_UP_RIGHT;
          this.#legState = (this.#legState + 1) % RUN_DOWN.length;
        }
        this.#faceLeft = false;
        break;
      }

      case " ": {
        this.#tapperState = 2;
        this.#faceLeft = false;
        if (this.#xPosition !== ROW_RIGHT_BOUNDS[this.#row]) {
          this.#goState = 0;
          this.#lastRow = this.#row;
          this.#lastXPosition = this.#xPosition;
          this.#xPosition = ROW_X_POSITIONS[this.#row];
        }
        if (this.#fillState < BEER_FILL.length) {
          this.#fillState++;
          if (this.#fillState === BEER_FILL.length) SoundManager.play(FULL_MUG);
          else if (this.#fillState === 1) SoundManager.play(MUG_FILL_1);
          else SoundManager.play(MUG_FILL_2);
        }
        break;
      }

      case null: {
        this.#legState = 0;
        this.#tapperState = 1;
        if (this.#fillState === BEER_FILL.length) {
          this.#fillState = 0;
          Beers.add(this.#row, this.#xPosition - SPRITE_WIDTH, true);
          SoundManager.play(THROW_MUG);
        }
        break;
      }
    }
  }
}

export default new Player();
