import Player from "./Player.js";
import Customers from "./Customers.js";
import LevelManager, { SCORE_EMPTY_BEER } from "./LevelManager.js";
import SoundManager, { GRAB_MUG } from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";
import GameState, { STATE_PLAY } from "./GameState.js";
import BeerGlass from "./BeerGlass.js";

const SPRITE_WIDTH = 32;

class Beers {
  #glasses;
  #spriteImage = ResourceManager.getImageResource("beer_glass");

  reset() {
    this.#glasses = new Array(5).fill(null).map(() => []);
  }

  add(row, xPosition, isFull) {
    this.#glasses[row].push(new BeerGlass(row, xPosition, isFull));
  }

  #checkCollision(glass, row) {
    if (glass.isFull) {
      const customer = Customers.getFirstWaitingCustomer(row);
      if (customer && glass.xPosition <= customer.xPosition + 24) {
        customer.catchBeer();
        return true;
      }
    } else if (Player.row === row) {
      if (glass.xPosition + SPRITE_WIDTH >= Player.xPosition) {
        SoundManager.play(GRAB_MUG);
        LevelManager.addScore(SCORE_EMPTY_BEER);
        return true;
      }
    }
    return false;
  }

  draw(context) {
    for (let row = 1; row <= 4; row++) {
      for (let i = this.#glasses[row].length; i--; i >= 0) {
        const glass = this.#glasses[row][i];
        if (GameState.state === STATE_PLAY) {
          if (glass.update()) return true;
          if (this.#checkCollision(glass, row)) this.#glasses[row].splice(i, 1);
        }
        glass.draw(context, this.#spriteImage);
      }
    }
    return false;
  }
}

export default new Beers();
