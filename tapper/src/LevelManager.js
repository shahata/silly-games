import Customers, {
  CUSTOMER_BLACK_GUY,
  CUSTOMER_GRAY_HAT_COWBOY,
  CUSTOMER_GREEN_HAT_COWBOY,
  CUSTOMER_WOMAN,
  MAX_CUSTOMER_TYPE,
} from "./Customers.js";
import SoundManager, { POP_OUT } from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";
import GameState, { STATE_PLAY } from "./GameState.js";

export const NUM_LEVEL = 1;
export const MAX_LIFE = 3;
const TIME_STEP_SECONDS = 3;

const ROW_LEFT_BOUNDS = [null, 120, 88, 56, 24];
const ROW_RIGHT_BOUNDS = [null, 304, 334, 368, 400];
const ROW_Y_POSITIONS = [null, 80, 176, 272, 368];

const GAME_TITLE_LOGO_WIDTH = 416;
const GAME_TITLE_LOGO_HEIGHT = 160;
const COPYRIGHT_1 = "Based on the Original Tapper Game";
const COPYRIGHT_2 = "(c) 1983 Bally Midway MFG";
const GAME_OVER_TEXT = "GAME OVER !";

const LIFE_ICON_OFFSET = 0;
const ICON_SIZE = 16;
const FONT_Y_OFFSET = 0;
const FONT_NUM_OFFSET = 0;
const FONT_SIZE = 16;
const SCORE_X_POSITION = 100;
const SCORE_Y_POSITION = 8;
const LIFE_Y_POSITION = 24;
const DIFFICULTY_X_POSITION = 376;

export const SCORE_BONUS = 1500;
export const SCORE_EMPTY_BEER = 100;
export const SCORE_CUSTOMER = 50;

class LevelManager {
  rowLeftBounds = ROW_LEFT_BOUNDS;
  rowRightBounds = ROW_RIGHT_BOUNDS;
  rowYPositions = ROW_Y_POSITIONS;

  #score = 0;
  lives = 0;
  #difficulty = 1;
  #wave = 1;
  #lastRow = -1;
  #fontImage = null;
  #miscImage = null;
  #gameTitleImage = null;
  #backgroundImage = null;
  #readyToPlayImage = null;

  init() {
    this.#gameTitleImage = ResourceManager.getImageResource("game_title");
    this.#readyToPlayImage = ResourceManager.getImageResource("ready_to_play");
    this.#backgroundImage = ResourceManager.getImageResource("background");
    this.#fontImage = ResourceManager.getImageResource("font");
    this.#miscImage = ResourceManager.getImageResource("misc");

    this.#score = 0;
    this.lives = MAX_LIFE;
    this.#difficulty = 1;
    this.#wave = 1;
  }

  addCustomer() {
    if (GameState.state !== STATE_PLAY) {
      return;
    }

    if (Customers.isAnyCustomer() < 2) {
      if (this.#wave++ === this.#difficulty * 2) {
        this.#difficulty += 1;
      }

      for (let i = 1; i <= this.#difficulty; i++) {
        Customers.add(1, i, CUSTOMER_GREEN_HAT_COWBOY);
        Customers.add(2, i, CUSTOMER_WOMAN);
        Customers.add(3, i, CUSTOMER_BLACK_GUY);
        Customers.add(4, i, CUSTOMER_GRAY_HAT_COWBOY);
        SoundManager.play(POP_OUT, false);
      }
    } else {
      const randomRow = Math.floor(Math.random() * 5);

      if (randomRow !== 0 && randomRow !== this.#lastRow) {
        const randomCustomerType = Math.floor(
          Math.random() * MAX_CUSTOMER_TYPE,
        );
        Customers.add(randomRow, 1, randomCustomerType);
        SoundManager.play(POP_OUT, false);
        this.#lastRow = randomRow;
      }
    }

    setTimeout(() => this.addCustomer(), TIME_STEP_SECONDS * 1000);
  }

  addScore(points) {
    this.#score += points;
  }

  lifeLost() {
    this.lives -= 1;
  }

  displayScore(context) {
    const scoreText = `${this.#score}`;
    let xPosition = SCORE_X_POSITION;

    for (let i = scoreText.length; i--; ) {
      const offset = scoreText.charAt(i) * FONT_SIZE + FONT_NUM_OFFSET;

      context.drawImage(
        this.#fontImage,
        offset,
        FONT_Y_OFFSET,
        FONT_SIZE,
        FONT_SIZE,
        xPosition,
        SCORE_Y_POSITION,
        FONT_SIZE,
        FONT_SIZE,
      );
      xPosition -= FONT_SIZE;
    }
  }

  displayDifficulty(context) {
    const difficultyText = `${this.#difficulty}`;
    let xPosition = DIFFICULTY_X_POSITION;

    for (let i = difficultyText.length; i--; ) {
      const offset = difficultyText.charAt(i) * FONT_SIZE + FONT_NUM_OFFSET;
      context.drawImage(
        this.#fontImage,
        offset,
        FONT_Y_OFFSET,
        FONT_SIZE,
        FONT_SIZE,
        xPosition,
        SCORE_Y_POSITION,
        FONT_SIZE,
        FONT_SIZE,
      );

      xPosition -= FONT_SIZE;
    }
  }

  displayLife(context) {
    if (this.lives <= 0) {
      return;
    }

    let xPosition = SCORE_X_POSITION;
    for (let i = this.lives; i--; ) {
      context.drawImage(
        this.#miscImage,
        LIFE_ICON_OFFSET,
        0,
        ICON_SIZE,
        ICON_SIZE,
        xPosition,
        LIFE_Y_POSITION,
        ICON_SIZE,
        ICON_SIZE,
      );
      xPosition -= FONT_SIZE;
    }
  }

  displayGameTitle(context) {
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fill();

    context.drawImage(
      this.#gameTitleImage,
      (context.canvas.width - GAME_TITLE_LOGO_WIDTH) / 2,
      280 - GAME_TITLE_LOGO_HEIGHT,
    );

    context.fillStyle = "rgb(255,255,255)";
    context.font = "bold 14px Courier";
    context.textBaseline = "top";

    context.fillText(COPYRIGHT_1, 122, 290);
    context.fillText(COPYRIGHT_2, 154, 310);
    context.fillText("Press [ENTER] to play", 172, 400);
  }

  displayReadyToPlay(context) {
    context.drawImage(this.#readyToPlayImage, 0, 0);
  }

  displayGameOver(context) {
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(
      (context.canvas.width - 180) / 2,
      (context.canvas.height - 32) / 2,
      180,
      32,
    );
    context.fill();

    context.fillStyle = "rgb(255,255,255)";
    context.font = "bold 14px Courier";
    context.textBaseline = "top";

    context.fillText(
      GAME_OVER_TEXT,
      (context.canvas.width - 180) / 2 + 48,
      (context.canvas.height - 32) / 2 + 8,
    );
  }

  reset() {
    for (let i = 1; i <= this.#difficulty; i++) {
      Customers.add(1, i, CUSTOMER_GREEN_HAT_COWBOY);
      Customers.add(2, i, CUSTOMER_WOMAN);
      Customers.add(3, i, CUSTOMER_BLACK_GUY);
      Customers.add(4, i, CUSTOMER_GRAY_HAT_COWBOY);
    }
    this.#lastRow = -1;
    setTimeout(() => this.addCustomer(), TIME_STEP_SECONDS * 1000);
  }

  newGame() {
    this.#score = 0;
    this.lives = MAX_LIFE;
    this.#difficulty = 1;
    this.#wave = 1;
    this.#lastRow = -1;
  }

  drawGameHUD(context) {
    this.displayScore(context);
    this.displayLife(context);
    this.displayDifficulty(context);
  }

  drawLevelBackground(context) {
    context.drawImage(this.#backgroundImage, 0, 0);
  }
}

export default new LevelManager();
