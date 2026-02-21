import Beerglass from "./Beerglass.js";
import LevelManager from "./LevelManager.js";
import SoundMngr from "./SoundMngr.js";
import RessourceMngr from "./RessourceMngr.js";
import { g_FPS, g_game_state, g_STATE_PLAY } from "./Main.js";

function oneCustomer(row, default_xpos, movingPattern, type) {
  var CustomerObj = {
    STATE_WAIT: 0,
    STATE_CATCH: 1,
    STATE_DRINK: 2,

    STEP: Customers.STEP,

    state: 0,

    type: type,

    sprite: 0,
    sprite2: 0,

    movingPattern: movingPattern,
    animationCounter: -1,

    xpos: default_xpos,
    ypos: LevelManager.row_ypos[row],
    ypos2: LevelManager.row_ypos[row],

    row: row,
    l_bound: LevelManager.row_lbound[row],
    r_bound: LevelManager.row_rbound[row],

    fpscount: 0,
    fpsmax: g_FPS >> 3,
    newxpos: 0,

    EndOfRow: false,
    isOut: false,

    update: function () {
      switch (this.state) {
        case this.STATE_WAIT: {
          if (this.fpscount++ > this.fpsmax) {
            this.animationCounter++;
            this.sprite = this.movingPattern[this.animationCounter] << 5; //* 32;
            if (this.animationCounter == this.movingPattern.length)
              this.animationCounter = -1;
            this.fpscount = 0;
          }

          if (this.movingPattern[this.animationCounter] < 2) {
            if (this.xpos < this.r_bound) this.xpos += this.STEP;
            else this.EndOfRow = true;
          }
          break;
        }
        case this.STATE_CATCH: {
          this.xpos -= this.STEP * 2;
          if (this.xpos < this.l_bound) {
            this.isOut = true;
          } else if (this.xpos < this.newxpos) {
            this.fpscount = 0;
            this.animationCounter = 0;
            this.state = this.STATE_DRINK;
            this.sprite = Customers.DRINKING_BEER_1 << 5;
            this.sprite2 = Customers.DRINKING_BEER_2 << 5;
            this.ypos2 = this.ypos;
          }
          break;
        }
        case this.STATE_DRINK: {
          if (this.fpscount++ > this.fpsmax) {
            this.animationCounter++;
            this.fpscount = 0;
          }
          if (this.animationCounter == 3) {
            this.state = this.STATE_WAIT;
            this.animationCounter = -1;
            this.fpscount = 0;
            this.sprite = this.movingPattern[0] << 5;
            Beerglass.add(
              this.row,
              this.xpos + Customers._spritewidth,
              Beerglass.EMPTY_MUG,
            );
            Customers.checkBonus(this.row, this.xpos);
          }
          break;
        }
      }
    },

    catchBeer: function () {
      this.newxpos = this.xpos - ((this.r_bound - this.l_bound) / 5) * 2;
      this.state = this.STATE_CATCH;
      this.sprite = Customers.HOLDING_BEER_1 << 5;
      this.sprite2 = Customers.HOLDING_BEER_2 << 5;
      this.ypos2 = this.ypos + 8;
    },
  };
  return CustomerObj;
}

var Customers = {
  STEP: 1,
  CUST_GREEN_HAT_COWBOY: 0,
  CUST_WOMEM: 1,
  CUST_BLACK_GUY: 2,
  CUST_GRAY_HAT_COWBOY: 3,
  MAX_CUSTOMER_TYPE: 4,

  REGULAR_1: 0,
  REGULAR_2: 1,
  ANGRY_1: 2,
  ANGRY_2: 3,
  HOLDING_BEER_1: 4,
  HOLDING_BEER_2: 7,
  DRINKING_BEER_1: 5,
  DRINKING_BEER_2: 8,

  BONUS_OFF: 5,

  _cust_y_offset: [0, 32, 64, 96],
  _movingPatternArray: [
    null, // no row 0
    [0, 1, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3], // row 1
    [0, 1, 0, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3], // row 2
    [0, 1, 0, 2, 3, 2, 3, 2, 3], // row 3
    [0, 1, 0, 1, 2, 3, 2, 3], // row 4
  ],
  _customerxpos: [5],
  _maxpos: [5],
  _customersList: new Array(), // [row, Cust Obj]
  _endOfTheRowCustomer: null,
  _spriteimage: null,
  _miscImage: null,
  _spritewidth: 32,
  _spriteheight: 32,

  _bonus: {
    visible: false,
    timeout: 10 * 1000, // 10ms
    timeout_reached: true,
    row: 1,
    xpos: 100,
  },
  init: function () {
    this._spriteimage = RessourceMngr.getImageRessource("customers");
    this._miscImage = RessourceMngr.getImageRessource("beerglass");
  },

  reset: function () {
    for (var count = 1; count < 5; count++) {
      this._customersList[count] = [];
      this._customerxpos[count] = -1;
    }
    this.oneReachEndOfRow = false;
    this._endOfTheRowCustomer = false;
    this._bonus.visible = false;
  },

  add: function (row, pos, type) {
    var cust = new oneCustomer(
      row,
      LevelManager.row_lbound[row],
      this._movingPatternArray[row],
      type,
    );
    cust.xpos += (pos - 1) * this._spritewidth;
    this._customersList[row].push(cust);
  },

  checkBonus: function (row, customerxpos) {
    if (!this._bonus.visible && this._bonus.timeout_reached) {
      if (
        customerxpos <
        LevelManager.row_lbound[row] +
          (LevelManager.row_rbound[row] - LevelManager.row_lbound[row]) / 3
      ) {
        var randomrow = Math.floor(Math.random() * 6);
        if (randomrow == row) {
          this._bonus.visible = true;
          this._bonus.row = row;
          this._bonus.xpos = customerxpos;
          this._bonus.ypos = LevelManager.row_ypos[row] + 16;
          this._bonus.timeout_reached = false;
          setTimeout(
            "Customers._bonus.visible = false; Customers._bonus.timeout_reached = true",
            this._bonus.timeout,
          );
          SoundMngr.play(SoundMngr.TIP_APPEAR, false);
        }
      }
    }
  },

  checkBonusCollision: function (row, xpos) {
    if (
      this._bonus.visible &&
      this._bonus.row == row &&
      xpos <= this._bonus.xpos + this._spritewidth
    ) {
      this._bonus.visible = false;
      LevelManager.addScore(LevelManager.SCORE_BONUS);
      SoundMngr.play(SoundMngr.COLLECT_TIP, false);
    }
  },

  drawBonus: function (context) {
    if (this._bonus.visible) {
      context.drawImage(
        this._miscImage,
        this.BONUS_OFF << 5,
        0,
        this._spritewidth,
        this._spriteheight,
        this._bonus.xpos,
        this._bonus.ypos,
        this._spritewidth,
        this._spriteheight,
      );
    }
  },

  stop: function () {
    // to be optimized.... :)
  },

  getFirstCustomerPos: function (row) {
    /// there is a bug somewhere that cause an execption if the second condition is not checked
    if (
      this._customerxpos[row] != -1 &&
      this._customersList[row][this._customerxpos[row]]
    )
      return this._customersList[row][this._customerxpos[row]].xpos;
  },

  beerCollisionDetected: function (row) {
    // only validate the collision if the customer is in wait state
    if (this._customersList[row][this._customerxpos[row]].state == 0) {
      // change the customer status
      this._customersList[row][this._customerxpos[row]].catchBeer();
      return true;
    } else return false;
  },

  isAnyCustomer: function () {
    return (
      this._customersList[1].length +
      this._customersList[2].length +
      this._customersList[3].length +
      this._customersList[4].length
    );
  },

  draw: function (context /*2D Canvas context*/) {
    var cust;
    var ret = 0;
    var custArrayCopy = null;
    var copyFlag = false;

    this._customerxpos = [-1, -1, -1, -1, -1];
    this._maxpos = [0, 0, 0, 0, 0];

    for (var rowcount = 1; rowcount < 5; rowcount++) {
      custArrayCopy = this._customersList[rowcount].slice();

      for (var i = this._customersList[rowcount].length; i--; ) {
        cust = this._customersList[rowcount][i];

        if (!this.oneReachEndOfRow && g_game_state == g_STATE_PLAY) {
          cust.update();

          if (cust.isOut) {
            custArrayCopy.splice(i, 1);
            copyFlag = true;
            SoundMngr.play(SoundMngr.OUT_DOOR, false);
            LevelManager.addScore(LevelManager.SCORE_CUSTOMER);
            continue;
          } else {
            if (
              cust.xpos > this._maxpos[rowcount] &&
              cust.state == cust.STATE_WAIT
            ) {
              this._customerxpos[rowcount] = i;
              this._maxpos[rowcount] = cust.xpos;
            }
          }
        }

        if (cust.EndOfRow && this.oneReachEndOfRow == false) {
          this.oneReachEndOfRow = true;
          this._endOfTheRowCustomer = cust;
          LevelManager.lifeLost();
          ret = rowcount;
        }

        context.drawImage(
          this._spriteimage,
          cust.sprite,
          this._cust_y_offset[cust.type],
          this._spritewidth,
          this._spriteheight,
          cust.xpos,
          cust.ypos,
          this._spritewidth,
          this._spriteheight,
        );

        if (cust.state != cust.STATE_WAIT) {
          context.drawImage(
            this._spriteimage,
            cust.sprite2,
            this._cust_y_offset[cust.type],
            this._spritewidth,
            this._spriteheight,
            cust.xpos + 32,
            cust.ypos2,
            this._spritewidth,
            this._spriteheight,
          );
        }
      }

      if (copyFlag) {
        this._customersList[rowcount] = custArrayCopy.slice();
      }
    }
    this.drawBonus(context);
    return ret;
  },
};

export default Customers;
