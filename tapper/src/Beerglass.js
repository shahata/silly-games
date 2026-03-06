import Player from "./Player.js";
import Customers, { STEP as CUSTOMER_STEP } from "./Customers.js";
import LevelManager, { SCORE_EMPTY_BEER } from "./LevelManager.js";
import SoundManager, { GRAB_MUG } from "./SoundMngr.js";
import ResourceManager from "./RessourceMngr.js";
import GameState, { FPS, STATE_PLAY } from "./GameState.js";

const SPRITE_FULL_1 = 0;
const SPRITE_FULL_2 = 32;
const SPRITE_EMPTY_1 = 64;
const SPRITE_FALLING = 96;
const SPRITE_BROKEN = 128;

const STEP = 4;

export const FULL_MUG = 0;
export const EMPTY_MUG = 1;

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

class Glass {
  sprite = SPRITE_FULL_1;
  xPos;
  yPos;
  #row;
  #type;
  #leftBound;
  #rightBound;
  #fpsCount = 0;
  #fpsMax = FPS >> 1;
  broken = false;

  constructor(row, defaultXPos, defaultYPos, type) {
    this.xPos = defaultXPos;
    this.yPos = defaultYPos;
    this.#row = row;
    this.#type = type;
    this.#leftBound = LevelManager.rowLeftBound[row] - 4;
    this.#rightBound = LevelManager.rowRightBound[row] + 16;
  }

  update() {
    if (this.#type === FULL_MUG) {
      if (this.#fpsCount++ > this.#fpsMax) {
        this.sprite =
          this.sprite === SPRITE_FULL_1 ? SPRITE_FULL_2 : SPRITE_FULL_1;
        this.#fpsCount = 0;
      }

      if (this.xPos > this.#leftBound) {
        this.xPos -= STEP;
      } else {
        this.broken = true;
        this.sprite = SPRITE_BROKEN;
      }
    } else {
      this.sprite = SPRITE_EMPTY_1;

      if (this.xPos < this.#rightBound) {
        this.xPos += CUSTOMER_STEP;
      } else {
        this.broken = true;
        this.sprite = SPRITE_FALLING;
        this.xPos += 16;
        this.yPos += SPRITE_HEIGHT;
      }
    }
  }
}

class BeerglassManager {
  #isOneFullGlassBroken = false;
  #isOneEmptyGlassBroken = false;
  #glassesFull = [];
  #glassesEmpty = [];
  #spriteImage = null;

  init() {
    this.#spriteImage = ResourceManager.getImageResource("beerglass");
  }

  reset() {
    for (let count = 1; count < 5; count++) {
      this.#glassesFull[count] = [];
      this.#glassesEmpty[count] = [];
    }

    this.#isOneFullGlassBroken = false;
    this.#isOneEmptyGlassBroken = false;
  }

  add(row, xPos, type) {
    const glass = new Glass(row, xPos, LevelManager.rowYPos[row] + 8, type);

    if (type === FULL_MUG) {
      this.#glassesFull[row].push(glass);
    } else {
      this.#glassesEmpty[row].push(glass);
    }
  }

  stop() {}

  #checkCustomerCollision(glass, row) {
    const firstCustomerPos = Customers.getFirstCustomerPos(row);
    if (firstCustomerPos === undefined) {
      return false;
    }

    const customerPos = firstCustomerPos + 24;
    if (glass.xPos <= customerPos) {
      return Customers.beerCollisionDetected(row);
    }

    return false;
  }

  #checkPlayerCollision(glass, row) {
    if (
      Player.currentRow === row &&
      glass.xPos + SPRITE_WIDTH >= Player.playerXPos
    ) {
      SoundManager.play(GRAB_MUG, false);
      LevelManager.addScore(SCORE_EMPTY_BEER);
      return true;
    }

    return false;
  }

  draw(context) {
    let ret = 0;

    ret += this.drawFullMug(context, 1);
    ret += this.drawEmptyMug(context, 1);

    ret += this.drawFullMug(context, 2);
    ret += this.drawEmptyMug(context, 2);

    ret += this.drawFullMug(context, 3);
    ret += this.drawEmptyMug(context, 3);

    ret += this.drawFullMug(context, 4);
    ret += this.drawEmptyMug(context, 4);

    return ret;
  }

  drawFullMug(context, rowCount) {
    let ret = 0;
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
            ret = rowCount;
          }
        } else {
          collision = this.#checkCustomerCollision(glass, rowCount);
        }
      }

      if (collision) {
        glassArrayCopy.splice(i, 1);
        copyFlag = true;
      } else {
        context.drawImage(
          this.#spriteImage,
          glass.sprite,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          glass.xPos,
          glass.yPos,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
        );
      }
    }

    if (copyFlag) {
      this.#glassesFull[rowCount] = glassArrayCopy.slice();
    }

    return ret;
  }

  drawEmptyMug(context, rowCount) {
    let ret = 0;
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
            ret = rowCount;
          }
        } else {
          collision = this.#checkPlayerCollision(glass, rowCount);
        }
      }

      if (collision) {
        glassArrayCopy.splice(i, 1);
        copyFlag = true;
      } else {
        context.drawImage(
          this.#spriteImage,
          glass.sprite,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          glass.xPos,
          glass.yPos,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
        );
      }
    }

    if (copyFlag) {
      this.#glassesEmpty[rowCount] = glassArrayCopy.slice();
    }

    return ret;
  }
}

export default new BeerglassManager();
