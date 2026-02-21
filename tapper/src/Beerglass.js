import Player from "./Player.js";
import Customers from "./Customers.js";
import LevelManager from "./LevelManager.js";
import SoundMngr from "./SoundMngr.js";
import RessourceMngr from "./RessourceMngr.js";
import { g_FPS, g_game_state, g_STATE_PLAY } from "./Main.js";

function Glass(row, default_xpos, default_ypos, type) {
  var glassObj = {
    sprite: Beerglass.SPRITE_FULL_1,
    xpos: default_xpos,
    ypos: default_ypos,
    row: row,
    type: type, // FULL / EMPTY MUG
    l_bound: LevelManager.row_lbound[row] - 4,
    r_bound: LevelManager.row_rbound[row] + 16,
    fpscount: 0,
    fpsmax: g_FPS >> 1,

    broken: false,

    update: function () {
      if (type == Beerglass.FULL_MUG) {
        if (this.fpscount++ > this.fpsmax) {
          this.sprite =
            this.sprite == Beerglass.SPRITE_FULL_1
              ? Beerglass.SPRITE_FULL_2
              : Beerglass.SPRITE_FULL_1;
          this.fpscount = 0;
        }

        if (this.xpos > this.l_bound) this.xpos -= Beerglass.STEP;
        else {
          this.broken = true;
          this.sprite = Beerglass.SPRITE_BROKEN;
        }
      } // Beerglass.EMPTY_MUG
      else {
        this.sprite = Beerglass.SPRITE_EMPTY_1;

        if (this.xpos < this.r_bound)
          this.xpos += Customers.STEP; // same speed as the customers
        else {
          this.broken = true;
          this.sprite = Beerglass.SPRITE_FALLING;
          this.xpos += 16;
          this.ypos += Beerglass._spriteheight;
        }
      }
    },
  };
  return glassObj;
}

var Beerglass = {
  //
  SPRITE_FULL_1: 0,
  SPRITE_FULL_2: 32,
  SPRITE_EMPTY_1: 64,
  SPRITE_FALLING: 96, // falling image
  SPRITE_BROKEN: 128, // falling image

  STEP: 4, // moving speed

  FULL_MUG: 0,
  EMPTY_MUG: 1,

  _spritewidth: 32,
  _spriteheight: 32,

  isOneFullGlassBroken: false,
  isOneEmptyGlassBroken: false,

  // define the ypos position of our beer
  //_row_ypos:				[null,  88, 184, 280, 376],

  _glasses_full: new Array(), // [row, Glass Obj]

  _glasses_empty: new Array(), // [row, Glass Obj]

  _spriteimage: null,

  /* ---
		
		Initialize required stuff...
		---									*/

  init: function () {
    // get the beerglass sprites
    this._spriteimage = RessourceMngr.getImageRessource("beerglass");
  },

  /* ---
	
		to be called before each new game
		
		---										*/

  reset: function () {
    // reset our arrays.
    for (var count = 1; count < 5; count++) {
      // if this freeing memory when object have been allocated before ?
      this._glasses_full[count] = [];
      this._glasses_empty[count] = [];
    }

    this.isOneFullGlassBroken = false;
    this.isOneEmptyGlassBroken = false;
  },

  /* ---
	
		add a new glass
		
		row where the beer is thrown
		type (full / empty)
		---										*/

  add: function (row, xpos, type) {
    // new glass (starting x position as parameter)
    var glass = new Glass(row, xpos, LevelManager.row_ypos[row] + 8, type);

    // add it to the corresponding array
    if (type == Beerglass.FULL_MUG) this._glasses_full[row].push(glass);
    else this._glasses_empty[row].push(glass);
  },

  /* ---
	
		Stop the beer (live lost)
		
		---										*/
  stop: function () {
    //this._game_play = false;
  },

  /* ---
	
		check for collision with customers
		
		return true if we meet one :)
		
		---										*/
  checkCustomerCollision: function (glass, row) {
    var cust_pos = Customers.getFirstCustomerPos(row) + 24;

    if (glass.xpos <= cust_pos) {
      // notify back the Customer object
      return Customers.beerCollisionDetected(row);
    }
    return false;
  },

  /* ---
	
		check for collision with customers
		
		return true if we meet one :)
		
		---										*/
  checkPlayerCollision: function (glass, row) {
    if (
      Player._currentrow == row &&
      glass.xpos + this._spritewidth >= Player._player_xpos
    ) {
      //console.log("Waou.. you catch an empty mug !");

      SoundMngr.play(SoundMngr.GRAB_MUG, false);

      LevelManager.addScore(LevelManager.SCORE_EMPTY_BEER);
      return true;
    }
    return false;
  },

  /* ---
		
		draw the beer glass(es) in the specified canvas context
		return >0 if a beer fall at the end of a row
		
		---														*/

  draw: function (context) {
    var ret = 0;

    //  loop unroll
    ret += Beerglass.drawFullMug(context, 1);
    ret += Beerglass.drawEmptyMug(context, 1);

    ret += Beerglass.drawFullMug(context, 2);
    ret += Beerglass.drawEmptyMug(context, 2);

    ret += Beerglass.drawFullMug(context, 3);
    ret += Beerglass.drawEmptyMug(context, 3);

    ret += Beerglass.drawFullMug(context, 4);
    ret += Beerglass.drawEmptyMug(context, 4);

    return ret;
  },

  /* ---
		
		draw the full beer glass(es) in the specified canvas context
		return the current row if a beer fall at the end of a row
		
		---														*/

  drawFullMug: function (context /*2D Canvas context*/, rowcount) {
    var glass;
    var ret = 0;
    var collision = false;

    var glassArrayCopy;

    // we copy the array, since we will maybe remove some glasses
    glassArrayCopy = this._glasses_full[rowcount].slice();

    //console.log("drawing %d beers on row %d  !", this._glasses_full[rowcount].length, rowcount);
    for (var i = this._glasses_full[rowcount].length; i--; ) {
      // ----------  draw the beers ! ----------------------//

      glass = this._glasses_full[rowcount][i];

      if (!this.isOneFullGlassBroken && g_game_state == g_STATE_PLAY) {
        glass.update();

        if (glass.broken) {
          if (!this.isOneFullGlassBroken) {
            this.isOneFullGlassBroken = true;
            //this._brokenGlass = glass;
            LevelManager.lifeLost();
            ret = rowcount;
          }
        } else {
          collision = Beerglass.checkCustomerCollision(glass, rowcount);
        }
      }

      if (collision) {
        // if a collision we remove it.
        glassArrayCopy.splice(i, 1);
      } // else draw the beer
      else {
        context.drawImage(
          this._spriteimage,
          glass.sprite,
          0,
          this._spritewidth,
          this._spriteheight,
          glass.xpos,
          glass.ypos,
          this._spritewidth,
          this._spriteheight,
        );
      }
    } // end for

    // if we found a collision, we remove the glass(es)
    if (collision) {
      // copy over the new array
      this._glasses_full[rowcount] = glassArrayCopy.slice();
    }

    return ret;
  },

  /* ---
		
		draw the empty beer glass(es) in the specified canvas context
		return the current row if a beer fall at the end of the row
		
		---														*/

  drawEmptyMug: function (context /*2D Canvas context*/, rowcount) {
    var glass;
    var ret = 0;
    var collision = false;

    var glassArrayCopy;

    // we copy the array, since we will maybe remove some glasses
    glassArrayCopy = this._glasses_empty[rowcount].slice();

    for (var i = this._glasses_empty[rowcount].length; i--; ) {
      // ----------  draw the empty beers ! ----------------------//

      glass = this._glasses_empty[rowcount][i];

      if (!this.isOneEmptyGlassBroken && g_game_state == g_STATE_PLAY) {
        glass.update();

        if (glass.broken) {
          if (!this.isOneEmptyGlassBroken) {
            this.isOneEmptyGlassBroken = true;
            //this._brokenGlass = glass;
            LevelManager.lifeLost();
            ret = rowcount;
          }
        } else {
          collision = Beerglass.checkPlayerCollision(glass, rowcount);
        }
      }

      if (collision) {
        // if a collision we remove it.
        glassArrayCopy.splice(i, 1);
      } // else draw the beer
      else {
        context.drawImage(
          this._spriteimage,
          glass.sprite,
          0,
          this._spritewidth,
          this._spriteheight,
          glass.xpos,
          glass.ypos,
          this._spritewidth,
          this._spriteheight,
        );
      }
    } // end for

    // if we found a collision, we remove the glass(es)
    if (collision) {
      // copy over the new array
      this._glasses_empty[rowcount] = glassArrayCopy.slice();
    }

    return ret;
  },
};

export default Beerglass;
