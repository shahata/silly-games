import Customer from "./Customer.js";
import LevelManager, {
  SCORE_CUSTOMER,
  ROW_LEFT_BOUNDS,
} from "./LevelManager.js";
import SoundManager, { OUT_DOOR, POP_OUT } from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";
import GameState, { FPS, STATE_PLAY } from "./GameState.js";

const SPAWN_INTERVAL = 3 * FPS;

const CUSTOMER_GREEN_HAT_COWBOY = 0;
const CUSTOMER_WOMAN = 1;
const CUSTOMER_BLACK_GUY = 2;
const CUSTOMER_GRAY_HAT_COWBOY = 3;
const MAX_CUSTOMER_TYPE = 4;

class Customers {
  #leadingCustomerByRow;
  #customersList;
  #spriteImage = ResourceManager.getImageResource("customers");
  #wave;
  #lastRandomRow;
  #spawnTimer;

  reset() {
    this.#wave = LevelManager.difficulty * 2 >= this.#wave ? this.#wave - 1 : 0;
    this.#lastRandomRow = -1;
    this.#customersList = new Array(5).fill(null).map(() => []);
    this.#leadingCustomerByRow = new Array(5).fill(null);
    this.#spawn();
  }

  #add(row, position, type) {
    this.#customersList[row].push(new Customer(row, position, type));
  }

  #spawn() {
    this.#spawnTimer = 0;
    if (this.#count() < 2) {
      if (this.#wave++ === LevelManager.difficulty * 2)
        LevelManager.increaseDifficulty();
      for (let i = 1; i <= LevelManager.difficulty; i++) {
        this.#add(1, i, CUSTOMER_GREEN_HAT_COWBOY);
        this.#add(2, i, CUSTOMER_WOMAN);
        this.#add(3, i, CUSTOMER_BLACK_GUY);
        this.#add(4, i, CUSTOMER_GRAY_HAT_COWBOY);
        SoundManager.play(POP_OUT);
      }
    } else {
      const randomRow = Math.floor(Math.random() * 5);
      if (randomRow !== 0 && randomRow !== this.#lastRandomRow) {
        const randomCustomerType = Math.floor(
          Math.random() * MAX_CUSTOMER_TYPE,
        );
        this.#add(randomRow, 1, randomCustomerType);
        SoundManager.play(POP_OUT);
        this.#lastRandomRow = randomRow;
      }
    }
  }

  get customers() {
    return this.#customersList;
  }

  getFirstWaitingCustomer(row) {
    return this.#leadingCustomerByRow[row];
  }

  #count() {
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

    if (GameState.state === STATE_PLAY && (this.#spawnTimer += GameState.speed) >= SPAWN_INTERVAL)
      this.#spawn();

    return false;
  }
}

export default new Customers();
