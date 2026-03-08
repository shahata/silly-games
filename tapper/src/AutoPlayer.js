import Player from "./Player.js";
import Customers from "./Customers.js";
import Beers from "./Beers.js";
import GameState, { STATE_PLAY } from "./GameState.js";

const FILL_PRESSES = 4;
const WIND_COOLDOWN = 6;
const THROW_COOLDOWN = 5;

class AutoPlayer {
  #active = false;
  #cooldown = 0;
  #filling = false;
  #fillCount = 0;

  get active() {
    return this.#active;
  }

  toggle() {
    this.#active = !this.#active;
    this.#cooldown = 0;
    this.#filling = false;
    this.#fillCount = 0;
  }

  update() {
    if (!this.#active || GameState.state !== STATE_PLAY) return;
    if (this.#cooldown-- > 0) return;

    if (this.#filling) {
      this.#continueFilling();
      return;
    }

    const emptyBeerRow = this.#findEmptyBeerRow();
    if (emptyBeerRow) {
      if (Player.row !== emptyBeerRow) {
        this.#switchRow(emptyBeerRow);
      }
      return;
    }

    const targetRow = this.#findMostUrgentRow();
    if (!targetRow) return;

    if (Player.row !== targetRow) {
      this.#switchRow(targetRow);
    } else {
      this.#startFilling();
    }
  }

  #continueFilling() {
    if (this.#fillCount < FILL_PRESSES) {
      Player.move(" ");
      this.#fillCount++;
    } else {
      Player.move(null);
      this.#filling = false;
      this.#fillCount = 0;
      this.#cooldown = THROW_COOLDOWN;
    }
  }

  #startFilling() {
    this.#filling = true;
    this.#fillCount = 1;
    Player.move(" ");
  }

  #switchRow(targetRow) {
    const diff = (targetRow - Player.row + 4) % 4;
    Player.move(diff <= 2 ? "ArrowDown" : "ArrowUp");
    this.#cooldown = WIND_COOLDOWN;
  }

  #findEmptyBeerRow() {
    const glasses = Beers.glasses;
    let bestRow = 0;
    let bestX = 0;
    for (let row = 1; row <= 4; row++) {
      if (!glasses[row]) continue;
      for (const glass of glasses[row]) {
        if (!glass.isFull && glass.xPosition > bestX) {
          bestX = glass.xPosition;
          bestRow = row;
        }
      }
    }
    return bestRow || null;
  }

  #findMostUrgentRow() {
    const glasses = Beers.glasses;
    const customers = Customers.customers;
    let bestRow = 0;
    let bestX = 0;
    for (let row = 1; row <= 4; row++) {
      if (glasses[row] && glasses[row].some((g) => g.isFull)) continue;
      if (!customers[row]) continue;
      for (const customer of customers[row]) {
        if (customer.waiting() && customer.xPosition > bestX) {
          bestX = customer.xPosition;
          bestRow = row;
        }
      }
    }
    return bestRow || null;
  }
}

export default new AutoPlayer();
