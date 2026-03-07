import Player from "./Player.js";
import Customers from "./Customers.js";
import LevelManager, { SCORE_EMPTY_BEER } from "./LevelManager.js";
import SoundManager, { GRAB_MUG } from "./SoundManager.js";
import ResourceManager from "./ResourceManager.js";
import GameState, { FPS, STATE_PLAY } from "./GameState.js";

const SPRITE_FULL_1 = 0;
const SPRITE_FULL_2 = 32;
const SPRITE_EMPTY_1 = 64;
const SPRITE_FALLING = 96;
const SPRITE_BROKEN = 128;

const STEP_FULL = 4;
const STEP_EMPTY = 1;

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

class Glass {
  #sprite = SPRITE_FULL_1;
  xPosition;
  yPosition;
  #isFull;
  #leftBound;
  #rightBound;
  #fpsCount = 0;
  #fpsMax = FPS >> 1;
  broken = false;

  constructor(row, xPosition, isFull) {
    this.xPosition = xPosition;
    this.yPosition = LevelManager.rowYPositions[row] + 8;
    this.#isFull = isFull;
    this.#leftBound = LevelManager.rowLeftBounds[row] - 4;
    this.#rightBound = LevelManager.rowRightBounds[row] + 16;
  }

  update() {
    if (this.#isFull) {
      if (this.#fpsCount++ > this.#fpsMax) {
        this.#sprite =
          this.#sprite === SPRITE_FULL_1 ? SPRITE_FULL_2 : SPRITE_FULL_1;
        this.#fpsCount = 0;
      }

      if (this.xPosition > this.#leftBound) {
        this.xPosition -= STEP_FULL;
      } else {
        this.broken = true;
        this.#sprite = SPRITE_BROKEN;
      }
    } else {
      this.#sprite = SPRITE_EMPTY_1;

      if (this.xPosition < this.#rightBound) {
        this.xPosition += STEP_EMPTY;
      } else {
        this.broken = true;
        this.#sprite = SPRITE_FALLING;
        this.xPosition += 16;
        this.yPosition += SPRITE_HEIGHT;
      }
    }
  }

  draw(context, spriteImage) {
    context.drawImage(
      spriteImage,
      this.#sprite,
      0,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
      this.xPosition,
      this.yPosition,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
    );
  }
}

class Beers {
  #isOneFullGlassBroken = false;
  #isOneEmptyGlassBroken = false;
  #glassesFull = [];
  #glassesEmpty = [];
  #spriteImage = null;

  init() {
    this.#spriteImage = ResourceManager.getImageResource("beer_glass");
  }

  reset() {
    for (let row = 1; row <= 4; row++) {
      this.#glassesFull[row] = [];
      this.#glassesEmpty[row] = [];
    }

    this.#isOneFullGlassBroken = false;
    this.#isOneEmptyGlassBroken = false;
  }

  add(row, xPosition, isFull) {
    const glass = new Glass(row, xPosition, isFull);

    if (isFull) {
      this.#glassesFull[row].push(glass);
    } else {
      this.#glassesEmpty[row].push(glass);
    }
  }

  stop() {}

  #checkCustomerCollision(glass, row) {
    const firstCustomerPosition = Customers.getFirstCustomerPosition(row);
    if (firstCustomerPosition === undefined) {
      return false;
    }

    const customerPosition = firstCustomerPosition + 24;
    if (glass.xPosition <= customerPosition) {
      return Customers.beerCollisionDetected(row);
    }

    return false;
  }

  #checkPlayerCollision(glass, row) {
    if (
      Player.currentRow === row &&
      glass.xPosition + SPRITE_WIDTH >= Player.playerXPosition
    ) {
      SoundManager.play(GRAB_MUG);
      LevelManager.addScore(SCORE_EMPTY_BEER);
      return true;
    }

    return false;
  }

  draw(context) {
    let lost = false;

    for (let row = 1; row <= 4; row++) {
      lost ||= this.drawFullMug(context, row);
      lost ||= this.drawEmptyMug(context, row);
    }

    return lost;
  }

  drawFullMug(context, rowCount) {
    let lost = false;
    const glassArrayCopy = this.#glassesFull[rowCount].slice();
    let copyFlag = false;

    for (let i = this.#glassesFull[rowCount].length; i--; ) {
      const glass = this.#glassesFull[rowCount][i];
      let collision = false;

      if (!this.#isOneFullGlassBroken && GameState.state === STATE_PLAY) {
        glass.update();

        if (glass.broken) {
          if (!this.#isOneFullGlassBroken) {
            this.#isOneFullGlassBroken = true;
            LevelManager.lifeLost();
            lost = true;
          }
        } else {
          collision = this.#checkCustomerCollision(glass, rowCount);
        }
      }

      if (collision) {
        glassArrayCopy.splice(i, 1);
        copyFlag = true;
      } else {
        glass.draw(context, this.#spriteImage);
      }
    }

    if (copyFlag) {
      this.#glassesFull[rowCount] = glassArrayCopy.slice();
    }

    return lost;
  }

  drawEmptyMug(context, rowCount) {
    let lost = false;
    const glassArrayCopy = this.#glassesEmpty[rowCount].slice();
    let copyFlag = false;

    for (let i = this.#glassesEmpty[rowCount].length; i--; ) {
      const glass = this.#glassesEmpty[rowCount][i];
      let collision = false;

      if (!this.#isOneEmptyGlassBroken && GameState.state === STATE_PLAY) {
        glass.update();

        if (glass.broken) {
          if (!this.#isOneEmptyGlassBroken) {
            this.#isOneEmptyGlassBroken = true;
            LevelManager.lifeLost();
            lost = true;
          }
        } else {
          collision = this.#checkPlayerCollision(glass, rowCount);
        }
      }

      if (collision) {
        glassArrayCopy.splice(i, 1);
        copyFlag = true;
      } else {
        glass.draw(context, this.#spriteImage);
      }
    }

    if (copyFlag) {
      this.#glassesEmpty[rowCount] = glassArrayCopy.slice();
    }

    return lost;
  }
}

export default new Beers();
