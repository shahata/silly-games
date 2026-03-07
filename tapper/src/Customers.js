import Customer from "./Customer.js";
import LevelManager, { SCORE_BONUS, SCORE_CUSTOMER } from "./LevelManager.js";
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
  #leadingCustomerIndexByRow = [5];
  #maxCustomerPositionByRow = [5];
  #customersList = [];
  #spriteImage = null;
  #miscImage = null;
  #oneReachedEndOfRow = false;

  #bonus = {
    visible: false,
    timeoutReached: true,
    row: 1,
    xPosition: 100,
    yPosition: 0,
  };

  init() {
    this.#spriteImage = ResourceManager.getImageResource("customers");
    this.#miscImage = ResourceManager.getImageResource("beer_glass");
  }

  reset() {
    for (let count = 1; count <= 4; count++) {
      this.#customersList[count] = [];
      this.#leadingCustomerIndexByRow[count] = -1;
    }
    this.#oneReachedEndOfRow = false;
    this.#bonus.visible = false;
  }

  add(row, pos, type) {
    const customer = new Customer(row, type, pos);

    this.#customersList[row].push(customer);
  }

  checkBonus(row, customerXPosition) {
    if (!this.#bonus.visible && this.#bonus.timeoutReached) {
      if (
        customerXPosition <
        LevelManager.rowLeftBounds[row] +
          (LevelManager.rowRightBounds[row] - LevelManager.rowLeftBounds[row]) /
            3
      ) {
        const randomRow = Math.floor(Math.random() * 6);
        if (randomRow === row) {
          this.#bonus.visible = true;
          this.#bonus.row = row;
          this.#bonus.xPosition = customerXPosition;
          this.#bonus.yPosition = LevelManager.rowYPositions[row] + 16;
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

  drawBonus(context) {
    if (this.#bonus.visible) {
      context.drawImage(
        this.#miscImage,
        BONUS_OFFSET << 5,
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

  stop() {}

  getFirstCustomerPosition(row) {
    if (
      this.#leadingCustomerIndexByRow[row] !== -1 &&
      this.#customersList[row][this.#leadingCustomerIndexByRow[row]]
    ) {
      return this.#customersList[row][this.#leadingCustomerIndexByRow[row]]
        .xPosition;
    }

    return undefined;
  }

  beerCollisionDetected(row) {
    const customerIndex = this.#leadingCustomerIndexByRow[row];
    const customer = this.#customersList[row][customerIndex];

    if (customer?.waiting()) {
      customer.catchBeer();
      return true;
    }

    return false;
  }

  isAnyCustomer() {
    return (
      this.#customersList[1].length +
      this.#customersList[2].length +
      this.#customersList[3].length +
      this.#customersList[4].length
    );
  }

  draw(context) {
    let lost = false;

    this.#leadingCustomerIndexByRow = [-1, -1, -1, -1, -1];
    this.#maxCustomerPositionByRow = [0, 0, 0, 0, 0];

    for (let rowCount = 1; rowCount <= 4; rowCount++) {
      const customerArrayCopy = this.#customersList[rowCount].slice();
      let copyFlag = false;

      for (let i = this.#customersList[rowCount].length; i--; ) {
        const customer = this.#customersList[rowCount][i];

        if (!this.#oneReachedEndOfRow && GameState.state === STATE_PLAY) {
          customer.update();

          if (customer.isOut) {
            customerArrayCopy.splice(i, 1);
            copyFlag = true;
            SoundManager.play(OUT_DOOR);
            LevelManager.addScore(SCORE_CUSTOMER);
            continue;
          }

          if (
            customer.xPosition > this.#maxCustomerPositionByRow[rowCount] &&
            customer.waiting()
          ) {
            this.#leadingCustomerIndexByRow[rowCount] = i;
            this.#maxCustomerPositionByRow[rowCount] = customer.xPosition;
          }
        }

        if (customer.endOfRow && !this.#oneReachedEndOfRow) {
          this.#oneReachedEndOfRow = true;
          LevelManager.lifeLost();
          lost = true;
        }

        customer.draw(context, this.#spriteImage);
      }

      if (copyFlag) {
        this.#customersList[rowCount] = customerArrayCopy.slice();
      }
    }

    this.drawBonus(context);
    return lost;
  }
}

const customers = new Customers();

export default customers;
