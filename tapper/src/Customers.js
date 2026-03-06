import Beerglass, { EMPTY_MUG } from "./Beerglass.js";
import LevelManager, { SCORE_BONUS, SCORE_CUSTOMER } from "./LevelManager.js";
import SoundManager, {
  COLLECT_TIP,
  OUT_DOOR,
  TIP_APPEAR,
} from "./SoundMngr.js";
import ResourceManager from "./RessourceMngr.js";
import GameState, { FPS, STATE_PLAY } from "./GameState.js";

export const STEP = 1;
export const CUST_GREEN_HAT_COWBOY = 0;
export const CUST_WOMAN = 1;
export const CUST_BLACK_GUY = 2;
export const CUST_GRAY_HAT_COWBOY = 3;
export const MAX_CUSTOMER_TYPE = 4;

const REGULAR_1 = 0;
const REGULAR_2 = 1;
const ANGRY_1 = 2;
const ANGRY_2 = 3;
const HOLDING_BEER_1 = 4;
const HOLDING_BEER_2 = 7;
const DRINKING_BEER_1 = 5;
const DRINKING_BEER_2 = 8;

const BONUS_OFFSET = 5;

const CUSTOMER_Y_OFFSET = [0, 32, 64, 96];
const MOVING_PATTERN_ARRAY = [
  null,
  [0, 1, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
  [0, 1, 0, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
  [0, 1, 0, 2, 3, 2, 3, 2, 3],
  [0, 1, 0, 1, 2, 3, 2, 3],
];

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;
const BONUS_TIMEOUT_MS = 10 * 1000;

const CUSTOMER_STATE_WAIT = 0;
const CUSTOMER_STATE_CATCH = 1;
const CUSTOMER_STATE_DRINK = 2;

class Customer {
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
  #fpsMax = FPS >> 3;
  #targetXPosition = 0;
  endOfRow = false;
  isOut = false;

  constructor(row, defaultXPosition, movingPattern, type, position) {
    this.type = type;
    this.#movingPattern = movingPattern;
    this.xPosition = defaultXPosition + (position - 1) * SPRITE_WIDTH;
    this.yPosition = LevelManager.rowYPositions[row];
    this.secondaryYPosition = LevelManager.rowYPositions[row];
    this.row = row;
    this.#leftBound = LevelManager.rowLeftBounds[row];
    this.#rightBound = LevelManager.rowRightBounds[row];
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
          Beerglass.add(this.row, this.xPosition + SPRITE_WIDTH, EMPTY_MUG);
          Customers.checkBonus(this.row, this.xPosition);
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

class CustomersManager {
  #leadingCustomerIndexByRow = [5];
  #maxCustomerPositionByRow = [5];
  #customersList = [];
  #endOfRowCustomer = null;
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
    this.#miscImage = ResourceManager.getImageResource("beerglass");
  }

  reset() {
    for (let count = 1; count < 5; count++) {
      this.#customersList[count] = [];
      this.#leadingCustomerIndexByRow[count] = -1;
    }
    this.#oneReachedEndOfRow = false;
    this.#endOfRowCustomer = false;
    this.#bonus.visible = false;
  }

  add(row, pos, type) {
    const customer = new Customer(
      row,
      LevelManager.rowLeftBounds[row],
      MOVING_PATTERN_ARRAY[row],
      type,
      pos,
    );

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

          SoundManager.play(TIP_APPEAR, false);
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
      SoundManager.play(COLLECT_TIP, false);
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

    if (!customer) {
      return false;
    }

    if (customer.state === CUSTOMER_STATE_WAIT) {
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
    let ret = 0;

    this.#leadingCustomerIndexByRow = [-1, -1, -1, -1, -1];
    this.#maxCustomerPositionByRow = [0, 0, 0, 0, 0];

    for (let rowCount = 1; rowCount < 5; rowCount++) {
      const customerArrayCopy = this.#customersList[rowCount].slice();
      let copyFlag = false;

      for (let i = this.#customersList[rowCount].length; i--; ) {
        const customer = this.#customersList[rowCount][i];

        if (!this.#oneReachedEndOfRow && GameState.state === STATE_PLAY) {
          customer.update();

          if (customer.isOut) {
            customerArrayCopy.splice(i, 1);
            copyFlag = true;
            SoundManager.play(OUT_DOOR, false);
            LevelManager.addScore(SCORE_CUSTOMER);
            continue;
          }

          if (
            customer.xPosition > this.#maxCustomerPositionByRow[rowCount] &&
            customer.state === CUSTOMER_STATE_WAIT
          ) {
            this.#leadingCustomerIndexByRow[rowCount] = i;
            this.#maxCustomerPositionByRow[rowCount] = customer.xPosition;
          }
        }

        if (customer.endOfRow && !this.#oneReachedEndOfRow) {
          this.#oneReachedEndOfRow = true;
          this.#endOfRowCustomer = customer;
          LevelManager.lifeLost();
          ret = rowCount;
        }

        context.drawImage(
          this.#spriteImage,
          customer.sprite,
          CUSTOMER_Y_OFFSET[customer.type],
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          customer.xPosition,
          customer.yPosition,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
        );

        if (customer.state !== CUSTOMER_STATE_WAIT) {
          context.drawImage(
            this.#spriteImage,
            customer.secondarySprite,
            CUSTOMER_Y_OFFSET[customer.type],
            SPRITE_WIDTH,
            SPRITE_HEIGHT,
            customer.xPosition + 32,
            customer.secondaryYPosition,
            SPRITE_WIDTH,
            SPRITE_HEIGHT,
          );
        }
      }

      if (copyFlag) {
        this.#customersList[rowCount] = customerArrayCopy.slice();
      }
    }

    this.drawBonus(context);
    return ret;
  }
}

const Customers = new CustomersManager();

export default Customers;
