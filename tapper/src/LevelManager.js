import Customers from "./Customers.js";
import SoundManager, { POP_OUT } from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";
import GameState, { STATE_PLAY } from "./GameState.js";

export const ROW_LEFT_BOUNDS = [null, 120, 88, 56, 24];
export const ROW_RIGHT_BOUNDS = [null, 304, 334, 368, 400];
export const ROW_Y_POSITIONS = [null, 80, 176, 272, 368];

export const SCORE_BONUS = 1500;
export const SCORE_EMPTY_BEER = 100;
export const SCORE_CUSTOMER = 50;

const MAX_LIFE = 3;
const TIME_STEP_SECONDS = 3;

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

const CUSTOMER_GREEN_HAT_COWBOY = 0;
const CUSTOMER_WOMAN = 1;
const CUSTOMER_BLACK_GUY = 2;
const CUSTOMER_GRAY_HAT_COWBOY = 3;
const MAX_CUSTOMER_TYPE = 4;

class LevelManager {
  #lives;
  #difficulty;
  #score;
  #wave;
  #lastRandomRow;
  #fontImage = ResourceManager.getImageResource("font");
  #miscImage = ResourceManager.getImageResource("misc");
  #gameTitleImage = ResourceManager.getImageResource("game_title");
  #backgroundImage = ResourceManager.getImageResource("background");
  #readyToPlayImage = ResourceManager.getImageResource("ready_to_play");

  #addCustomer() {
    if (GameState.state !== STATE_PLAY) return;

    if (Customers.count() < 2) {
      if (this.#wave++ === this.#difficulty * 2) this.#difficulty++;
      for (let i = 1; i <= this.#difficulty; i++) {
        Customers.add(1, i, CUSTOMER_GREEN_HAT_COWBOY);
        Customers.add(2, i, CUSTOMER_WOMAN);
        Customers.add(3, i, CUSTOMER_BLACK_GUY);
        Customers.add(4, i, CUSTOMER_GRAY_HAT_COWBOY);
        SoundManager.play(POP_OUT);
      }
    } else {
      const randomRow = Math.floor(Math.random() * 5);
      if (randomRow !== 0 && randomRow !== this.#lastRandomRow) {
        const randomCustomerType = Math.floor(
          Math.random() * MAX_CUSTOMER_TYPE,
        );
        Customers.add(randomRow, 1, randomCustomerType);
        SoundManager.play(POP_OUT);
        this.#lastRandomRow = randomRow;
      }
    }

    setTimeout(() => this.#addCustomer(), TIME_STEP_SECONDS * 1000);
  }

  #displayText(context, text, xPosition) {
    for (let i = text.length; i--; ) {
      context.drawImage(
        this.#fontImage,
        text.charAt(i) * FONT_SIZE + FONT_NUM_OFFSET,
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

  #displayLife(context) {
    if (this.#lives <= 0) return;

    let xPosition = SCORE_X_POSITION;
    for (let i = this.#lives; i--; ) {
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

  drawLevelBackground(context) {
    context.drawImage(this.#backgroundImage, 0, 0);
    this.#displayLife(context);
    this.#displayText(context, `${this.#score}`, SCORE_X_POSITION);
    this.#displayText(context, `${this.#difficulty}`, DIFFICULTY_X_POSITION);
  }

  addScore(points) {
    this.#score += points;
  }

  lifeLost() {
    return --this.#lives;
  }

  reset() {
    this.#wave--;
    this.#addCustomer();
  }

  newGame() {
    this.#lastRandomRow = -1;
    this.#lives = MAX_LIFE;
    this.#difficulty = 1;
    this.#score = 0;
    this.#wave = 1;
  }
}

export default new LevelManager();
