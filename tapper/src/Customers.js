import Customer from "./Customer.js";
import LevelManager, {
  SCORE_BONUS,
  SCORE_CUSTOMER,
  ROW_LEFT_BOUNDS,
  ROW_RIGHT_BOUNDS,
  ROW_Y_POSITIONS,
} from "./LevelManager.js";
import SoundManager, {
  COLLECT_TIP,
  OUT_DOOR,
  TIP_APPEAR,
} from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";
import GameState, { STATE_PLAY } from "./GameState.js";

const BONUS_OFFSET = 5;
const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;
const BONUS_TIMEOUT_MS = 10 * 1000;

class Customers {
  #leadingCustomerByRow;
  #customersList;
  #spriteImage = ResourceManager.getImageResource("customers");
  #miscImage = ResourceManager.getImageResource("beer_glass");

  #bonus = {
    visible: false,
    timeoutReached: true,
    xPosition: 100,
    yPosition: 0,
    row: 1,
  };

  reset() {
    this.#customersList = new Array(5).fill(null).map(() => []);
    this.#leadingCustomerByRow = new Array(5).fill(null);
    this.#bonus.timeoutReached = true;
    this.#bonus.visible = false;
  }

  add(row, pos, type) {
    this.#customersList[row].push(new Customer(row, type, pos));
  }

  checkBonus(row, customerXPosition) {
    if (!this.#bonus.visible && this.#bonus.timeoutReached) {
      if (
        customerXPosition - ROW_LEFT_BOUNDS[row] <
        (ROW_RIGHT_BOUNDS[row] - ROW_LEFT_BOUNDS[row]) / 3
      ) {
        if (Math.floor(Math.random() * 6) === row) {
          this.#bonus.visible = true;
          this.#bonus.row = row;
          this.#bonus.xPosition = customerXPosition;
          this.#bonus.yPosition = ROW_Y_POSITIONS[row] + 16;
          this.#bonus.timeoutReached = false;

          setTimeout(() => {
            this.#bonus.visible = false;
            this.#bonus.timeoutReached = true;
          }, BONUS_TIMEOUT_MS);

          SoundManager.play(TIP_APPEAR);
        }
      }
    }
  }

  checkBonusCollision(row, xPosition) {
    if (
      this.#bonus.visible &&
      this.#bonus.row === row &&
      xPosition <= this.#bonus.xPosition + SPRITE_WIDTH
    ) {
      this.#bonus.visible = false;
      LevelManager.addScore(SCORE_BONUS);
      SoundManager.play(COLLECT_TIP);
    }
  }

  #drawBonus(context) {
    if (this.#bonus.visible) {
      context.drawImage(
        this.#miscImage,
        BONUS_OFFSET * SPRITE_WIDTH,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        this.#bonus.xPosition,
        this.#bonus.yPosition,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
      );
    }
  }

  getFirstWaitingCustomer(row) {
    return this.#leadingCustomerByRow[row];
  }

  count() {
    return (
      this.#customersList[1].length +
      this.#customersList[2].length +
      this.#customersList[3].length +
      this.#customersList[4].length
    );
  }

  draw(context) {
    for (let row = 1; row <= 4; row++) {
      this.#leadingCustomerByRow[row] = null;
      for (let i = this.#customersList[row].length; i--; i >= 0) {
        const customer = this.#customersList[row][i];
        if (GameState.state === STATE_PLAY) {
          if (customer.update()) return true;
          if (customer.xPosition < ROW_LEFT_BOUNDS[row]) {
            this.#customersList[row].splice(i, 1);
            SoundManager.play(OUT_DOOR);
            LevelManager.addScore(SCORE_CUSTOMER);
          } else if (customer.waiting()) {
            const first = this.#leadingCustomerByRow[row]?.xPosition || 0;
            if (customer.xPosition > first) {
              this.#leadingCustomerByRow[row] = customer;
            }
          }
        }
        customer.draw(context, this.#spriteImage);
      }
    }
    this.#drawBonus(context);
    return false;
  }
}

export default new Customers();
