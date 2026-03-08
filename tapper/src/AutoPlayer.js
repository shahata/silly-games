import Player from "./Player.js";
import Customers from "./Customers.js";
import Beers from "./Beers.js";
import Tip from "./Tip.js";
import GameState, { STATE_PLAY } from "./GameState.js";
import { ROW_RIGHT_BOUNDS } from "./LevelManager.js";

const FILL_PRESSES = 4;
const SWITCH_COOLDOWN = 0;
const SPRITE_WIDTH = 32;

class AutoPlayer {
  #active = false;
  #cooldown = 0;
  #filling = false;
  #fillCount = 0;
  #collectingTip = false;

  get active() {
    return this.#active;
  }

  toggle() {
    this.#active = !this.#active;
    this.#cooldown = 0;
    this.#filling = false;
    this.#fillCount = 0;
    this.#collectingTip = false;
  }

  update() {
    if (!this.#active || GameState.state !== STATE_PLAY) return;
    if (this.#cooldown-- > 0) return;

    if (this.#filling) {
      this.#continueFilling();
      return;
    }

    if (this.#collectingTip) {
      if (!Tip.visible || Tip.row !== Player.row) {
        this.#collectingTip = false;
        Player.move(null);
      } else {
        Player.move("ArrowLeft");
        return;
      }
    }

    const action = this.#pickAction();

    switch (action.type) {
      case "serve":
        if (Player.row !== action.row) this.#switchRow(action.row);
        else this.#startFilling();
        break;
      case "catch":
        if (Player.row !== action.row) this.#switchRow(action.row);
        break;
      case "tip":
        if (Player.row !== Tip.row) this.#switchRow(Tip.row);
        else {
          this.#collectingTip = true;
          Player.move("ArrowLeft");
        }
        break;
    }
  }

  #pickAction() {
    const glasses = Beers.glasses;
    const customers = Customers.customers;

    // Score each row: combine customer urgency and empty beer urgency
    let bestAction = { type: "idle", score: Infinity };

    for (let row = 1; row <= 4; row++) {
      const hasFullBeer = glasses[row] && glasses[row].some((g) => g.isFull);

      // Prefer staying on current row to avoid switch overhead
      const switchCost = row === Player.row ? 0 : 3;

      // Customer urgency on this row
      if (!hasFullBeer && customers[row]) {
        for (const customer of customers[row]) {
          if (customer.waiting()) {
            const score = ROW_RIGHT_BOUNDS[row] - customer.xPosition + switchCost;
            if (score < bestAction.score) {
              bestAction = { type: "serve", row, score };
            }
          }
        }
      }

      // Empty beer urgency on this row
      if (glasses[row]) {
        const fallPoint = ROW_RIGHT_BOUNDS[row] + SPRITE_WIDTH;
        for (const glass of glasses[row]) {
          if (!glass.isFull) {
            const score = fallPoint - glass.xPosition + switchCost;
            if (score < bestAction.score) {
              bestAction = { type: "catch", row, score };
            }
          }
        }
      }
    }

    // Tip collection when nothing is urgent
    if (bestAction.score > 100 && Tip.visible) {
      return { type: "tip" };
    }

    return bestAction;
  }

  #continueFilling() {
    if (this.#fillCount < FILL_PRESSES) {
      Player.move(" ");
      this.#fillCount++;
    } else {
      Player.move(null);
      this.#filling = false;
      this.#fillCount = 0;
      this.#cooldown = 1;
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
    this.#cooldown = SWITCH_COOLDOWN;
  }
}

export default new AutoPlayer();
