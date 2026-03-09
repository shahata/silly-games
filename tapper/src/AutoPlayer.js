import Player from "./Player.js";
import Customers from "./Customers.js";
import Beers from "./Beers.js";
import Tip from "./Tip.js";
import GameState, { STATE_PLAY } from "./GameState.js";
import { ROW_RIGHT_BOUNDS, ROW_LEFT_BOUNDS } from "./LevelManager.js";

const FILL_PRESSES = 4;
const SWITCH_COOLDOWN = 0;
const SPRITE_WIDTH = 32;
const EXIT_FRACTION = 0.4; // catchBeer pushes back 40% of row length

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

    let bestCatch = { type: "idle", score: Infinity };
    let bestServe = { type: "idle", score: Infinity };
    let bestEntranceServe = { type: "idle", score: Infinity };

    for (let row = 1; row <= 4; row++) {
      const fullBeers = glasses[row]
        ? glasses[row].filter((g) => g.isFull).length
        : 0;

      const switchCost = row === Player.row ? 0 : 3;
      const rowLength = ROW_RIGHT_BOUNDS[row] - ROW_LEFT_BOUNDS[row];
      const exitThreshold = ROW_LEFT_BOUNDS[row] + rowLength * EXIT_FRACTION;

      // Customer urgency: serve if more waiting customers than beers in flight
      if (customers[row]) {
        let waitingCount = 0;
        for (const customer of customers[row]) {
          if (customer.waiting()) waitingCount++;
        }

        if (waitingCount > fullBeers) {
          for (const customer of customers[row]) {
            if (customer.waiting()) {
              const distFromEnd = ROW_RIGHT_BOUNDS[row] - customer.xPosition;
              const score = distFromEnd + switchCost;
              if (customer.xPosition < exitThreshold) {
                // Entrance-area: exits without empty, may tip
                if (score < bestEntranceServe.score) {
                  bestEntranceServe = { type: "serve", row, score };
                }
              } else {
                if (score < bestServe.score) {
                  bestServe = { type: "serve", row, score };
                }
              }
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
            if (score < bestCatch.score) {
              bestCatch = { type: "catch", row, score };
            }
          }
        }
      }
    }

    // Priority: catch empties > serve bar-area customers > serve entrance customers > tip
    // But entrance customers get priority over bar-area when nothing is urgent
    const hasUrgentCatch = bestCatch.score < 80;
    const hasUrgentServe = bestServe.score < 80;

    if (hasUrgentCatch && bestCatch.score <= bestServe.score) return bestCatch;
    if (hasUrgentServe) return bestServe;
    if (bestEntranceServe.type !== "idle") return bestEntranceServe;
    if (bestCatch.type !== "idle") return bestCatch;
    if (bestServe.type !== "idle") return bestServe;
    if (Tip.visible) return { type: "tip" };
    return { type: "idle" };
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
