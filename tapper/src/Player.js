import Customers from "./Customers.js";
import Beerglass from "./Beerglass.js";
import SoundMngr from "./SoundMngr.js";
import RessourceMngr from "./RessourceMngr.js";

var Player = {
  STEP: 16,
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3,
  FIRE: 4,
  NONE: 6,

  STAND_L1: 0,
  STAND_L2: 1,
  STAND_R1: 8,
  STAND_R2: 9,
  RUN_UP_L1: 12,
  RUN_UP_R1: 13,
  RUN_DOWN_1: 14,
  RUN_DOWN_2: 16,
  RUN_DOWN_3: 18,
  RUN_DOWN_4: 20,

  RUN_DOWN_RIGHT_OFF: 8,

  TAPPER_1: 30, // free
  TAPPER_2: 31, // hold
  TAPPER_3: 32, // serve

  SERVE_UP_1_1: 33,
  SERVE_UP_1_2: 34,
  SERVE_DOWN_1: 35,

  SERVE_UP_2_1: 36,
  SERVE_UP_2_2: 37,
  SERVE_DOWN_2: 38,

  BEER_FILL: [null, 39, 40, 41, 42],

  SERVING_MAX: 4,

  LOST_1: 43,
  LOST_2: 44,

  // ----- SPRITE TABLE (barman.png) Offset END ----///
  GO1: 4,
  GO2: 5,
  GO3: 6,
  GO4: 7,

  // Global Player Variable,
  _spritewidth: 32,
  _spriteheight: 32,
  _spriteshift: 5, // this variable is useless, it's just for me to remember (<<5 = * 32)

  // bartender sprites
  _spriteimage: null,

  // some variable to manage animation
  _goState: 0, // disapearing image
  _legState: 0, // leg animation when running
  _tapperState: 0, // to animate the beertender serving
  _servingcounter: 0, // to animate the beer serving

  // hold the default pos when changing row
  _row_xpos: [null, 336, 368, 400, 432],
  _row_ypos: [null, 96, 192, 288, 384],

  // define the row moving limit
  _row_lbound: [null, 128, 96, 64, 32],
  _row_rbound: [null, 336, 368, 400, 432],

  // current player sprite to be displayed
  _player_action: null,

  _game_play: false,

  _currentrow: 2,

  _lastrow: 0,
  _lastplayer_xpos: null,

  _player_goleft: true,
  _player_running: false,
  _tapper_serving: false,

  // default position (at end of the second row)
  _player_xpos: 336,
  _player_ypos: 192,

  fpscount: 0,
  leg_anim_timing: 20,

  init: function () {
    this._spriteimage = RessourceMngr.getImageRessource("barman");
  },

  reset: function () {
    // default position (at end of the second row)
    this._currentrow = 2;
    this._lastrow = 0;
    this._player_xpos = 336;
    this._player_ypos = 192;

    this._player_action = 0;

    // default state for each animation
    this._goState = this.GO1;
    this._legState = this.RUN_DOWN_1 - 2;
    this._tapperState = this.TAPPER_1;

    this._lastrow = 0;

    this._player_goleft = true;

    this._player_running = false;

    this._game_play = true;

    this._tapper_serving = false;
  },

  lost: function () {
    this._player_running = false;
    this._tapper_serving = false;
    this._game_play = false;
    this._player_action = this.LOST_1;
  },

  setAnimation: function () {
    if (this.fpscount++ > this.leg_anim_timing && this._game_play) {
      if (this._player_goleft) {
        this._player_action =
          this._player_action == this.STAND_L1 ? this.STAND_L2 : this.STAND_L1;
      } else {
        this._player_action =
          this._player_action == this.STAND_R1 ? this.STAND_R2 : this.STAND_R1;
      }
      this.fpscount = 0;
    }
  },

  drawTapper: function (context) {
    for (var rownum = 1; rownum < 5; rownum++) {
      if (
        this._currentrow != rownum ||
        !this._tapper_serving ||
        this._goState != 0
      ) {
        // Draw the tapper (free one)
        context.drawImage(
          this._spriteimage,
          this.TAPPER_1 << this._spriteshift,
          0,
          this._spritewidth,
          this._spriteheight,
          this._row_rbound[rownum] + 12,
          this._row_ypos[rownum] - 24,
          this._spritewidth,
          this._spriteheight,
        );
      } else {
        // Draw the tapper (hold, serve)
        context.drawImage(
          this._spriteimage,
          this._tapperState << this._spriteshift,
          0,
          this._spritewidth,
          this._spriteheight,
          this._row_rbound[rownum] + 12,
          this._row_ypos[rownum] - 30,
          this._spritewidth,
          this._spriteheight,
        );
      }
    }
  },

  drawServing: function (context /*2D Canvas context*/) {
    // fill the glass :)
    for (var i = 1, count = this._servingcounter + 1; i < count; i++) {
      context.drawImage(
        this._spriteimage,
        this.BEER_FILL[i] << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._player_xpos + 12,
        this._player_ypos + 2,
        this._spritewidth,
        this._spriteheight,
      );
    }

    if (this._tapperState == this.TAPPER_2) {
      // Draw the bartender (up)
      context.drawImage(
        this._spriteimage,
        this.SERVE_UP_1_1 << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._player_xpos - 20,
        this._player_ypos + 2,
        this._spritewidth,
        this._spriteheight,
      );

      // Draw the bartender (up part with the glass)
      context.drawImage(
        this._spriteimage,
        this.SERVE_UP_1_2 << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._player_xpos + 12,
        this._player_ypos + 2,
        this._spritewidth,
        this._spriteheight,
      );

      // draw second tile (down)
      context.drawImage(
        this._spriteimage,
        this.SERVE_DOWN_1 << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._player_xpos - 20,
        this._player_ypos + this._spriteheight + 2,
        this._spritewidth,
        this._spriteheight,
      );
    } else {
      // Draw the bartender (up)
      context.drawImage(
        this._spriteimage,
        this.SERVE_UP_2_1 << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._player_xpos - 20,
        this._player_ypos + 2,
        this._spritewidth,
        this._spriteheight,
      );

      // Draw the bartender (up2)
      context.drawImage(
        this._spriteimage,
        this.SERVE_UP_2_2 << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._player_xpos + 12,
        this._player_ypos + 2,
        this._spritewidth,
        this._spriteheight,
      );

      // draw second tile (down)
      context.drawImage(
        this._spriteimage,
        this.SERVE_DOWN_2 << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._player_xpos - 20,
        this._player_ypos + this._spriteheight + 2,
        this._spritewidth,
        this._spriteheight,
      );
    }
  },

  draw: function (context /*2D Canvas context*/) {
    // Draw the 4 tapper
    Player.drawTapper(context);

    // if lastrow !=0 means the player changed row
    // and we need to draw the small fancy animation
    // !! this is done here to ensure it's played and finished before next move
    if (this._lastrow != 0) {
      // Draw the go animation
      context.drawImage(
        this._spriteimage,
        this._goState << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._lastplayer_xpos,
        this._row_ypos[this._lastrow],
        this._spritewidth,
        this._spriteheight,
      );
      this._goState += 1;

      if (this._goState > this.GO4) {
        this._goState = 0;
        // small trick
        this._lastrow = 0;

        return true;
      }
      return false;
    }

    if (this._tapper_serving) {
      Player.drawServing(context);
      return true;
    }

    // Regular character drawing

    context.drawImage(
      this._spriteimage,
      this._player_action << this._spriteshift,
      0,
      this._spritewidth,
      this._spriteheight,
      this._player_xpos,
      this._player_ypos,
      this._spritewidth,
      this._spriteheight,
    );

    // if not running display the regular legs
    if (!this._player_running) {
      // manage the standing leg animation
      Player.setAnimation();

      // draw second tile (down)
      // the bottom part is 2 tile next to the up one
      context.drawImage(
        this._spriteimage,
        (2 + this._player_action) << this._spriteshift,
        0,
        this._spritewidth,
        this._spriteheight,
        this._player_xpos,
        this._player_ypos + this._spriteheight,
        this._spritewidth,
        this._spriteheight,
      );
    } // else display the running legs
    else {
      if (this._player_goleft) {
        // draw second tile (down)
        context.drawImage(
          this._spriteimage,
          this._legState << this._spriteshift,
          0,
          this._spritewidth,
          this._spriteheight,
          this._player_xpos,
          this._player_ypos + this._spriteheight,
          this._spritewidth,
          this._spriteheight,
        );

        // display the second leg title on the bottom right of the player
        context.drawImage(
          this._spriteimage,
          (this._legState + 1) << this._spriteshift,
          0,
          this._spritewidth,
          this._spriteheight,
          this._player_xpos + this._spriteheight,
          this._player_ypos + this._spriteheight,
          this._spritewidth,
          this._spriteheight,
        );
      } else {
        // draw second tile (down)
        context.drawImage(
          this._spriteimage,
          (this._legState + this.RUN_DOWN_RIGHT_OFF) << this._spriteshift,
          0,
          this._spritewidth,
          this._spriteheight,
          this._player_xpos,
          this._player_ypos + this._spriteheight,
          this._spritewidth,
          this._spriteheight,
        );

        // display the second leg title on the bottom right of the player
        context.drawImage(
          this._spriteimage,
          (this._legState + 1 + this.RUN_DOWN_RIGHT_OFF) << this._spriteshift,
          0,
          this._spritewidth,
          this._spriteheight,
          this._player_xpos - this._spriteheight,
          this._player_ypos + this._spriteheight,
          this._spritewidth,
          this._spriteheight,
        );
      }
    }

    return true;
  },

  move: function (direction) {
    //this._tapper_serving = false;
    this._player_running = false;

    switch (direction) {
      case this.UP: {
        // cancel any ongoing serving
        //this._servingcounter = 0;
        this._tapper_serving = false;

        this._lastrow = this._currentrow;
        this._currentrow -= 1;
        if (this._currentrow == 0) this._currentrow = 4;
        // to manage the "going out" animation
        this._goState = this.GO1;
        this._lastplayer_xpos = this._player_xpos;
        // set new default position on the new row
        this._player_xpos = this._row_xpos[this._currentrow];
        this._player_ypos = this._row_ypos[this._currentrow];
        //this._player_running = false;

        SoundMngr.play(SoundMngr.BARMAN_ZIP_UP);

        break;
      }
      case this.DOWN: {
        // cancel any ongoing serving
        //this._servingcounter = 0;
        this._tapper_serving = false;

        this._lastrow = this._currentrow;
        this._currentrow += 1;
        if (this._currentrow == 5) this._currentrow = 1;
        // to manage the "going out" animation
        this._goState = this.GO1;
        this._lastplayer_xpos = this._player_xpos;
        // set new default position on the new row
        this._player_xpos = this._row_xpos[this._currentrow];
        this._player_ypos = this._row_ypos[this._currentrow];
        //this._player_running = false;

        SoundMngr.play(SoundMngr.BARMAN_ZIP_DOWN);

        break;
      }

      case this.LEFT: {
        // cancel any ongoing serving
        //this._servingcounter = 0;
        this._tapper_serving = false;

        //this._player_running = false;
        if (
          this._player_goleft &&
          this._player_xpos > this._row_lbound[this._currentrow]
        ) {
          this._player_xpos -= this.STEP;
          this._player_running = true;
          this._player_action = this.RUN_UP_L1;

          // synchronize bottom leg animation with the key press
          this._legState += 2;
          if (this._legState > this.RUN_DOWN_4)
            this._legState = this.RUN_DOWN_1;

          Customers.checkBonusCollision(this._currentrow, this._player_xpos);
        }
        this._player_goleft = true;
        break;
      }

      case this.RIGHT: {
        // cancel any ongoing serving
        //this._servingcounter = 0;
        this._tapper_serving = false;

        //this._player_running = false;
        if (
          !this._player_goleft &&
          this._player_xpos < this._row_rbound[this._currentrow]
        ) {
          this._player_xpos += this.STEP;
          this._player_running = true;
          this._player_action = this.RUN_UP_R1;

          // synchronize bottom leg animation with the key press
          this._legState += 2;
          if (this._legState > this.RUN_DOWN_4)
            this._legState = this.RUN_DOWN_1;
        }
        this._player_goleft = false;
        break;
      }

      case this.FIRE: {
        // if not near the tapper, move it first :)
        if (this._player_xpos != this._row_rbound[this._currentrow]) {
          // break;
          this._lastrow = this._currentrow;
          // to manage the "going out" animation
          this._goState = this.GO1;

          this._lastplayer_xpos = this._player_xpos;
          // set new default position on the new row
          this._player_xpos = this._row_xpos[this._currentrow];
        }

        // reset the counter if we were not previously serving a beer
        if (this._tapper_serving == false) this._servingcounter = 0;

        this._tapper_serving = true;

        this._tapperState = this.TAPPER_3;

        if (this._servingcounter < this.SERVING_MAX) {
          this._servingcounter += 1;

          switch (this._servingcounter) {
            case 1:
              SoundMngr.play(SoundMngr.MUG_FILL1);
              break;
            case 2:
            case 3:
              SoundMngr.play(SoundMngr.MUG_FILL2);
              break;
            case this.SERVING_MAX:
              SoundMngr.play(SoundMngr.FULL_MUG);
              break;
          }
        }

        break;
      }

      case this.NONE: {
        // Tapper hold/serve
        if (this._tapper_serving) {
          this._tapperState = this.TAPPER_2;

          if (this._servingcounter == this.SERVING_MAX) {
            this._servingcounter = 0;
            //launch a beer !
            Beerglass.add(
              this._currentrow,
              this._player_xpos - this._spritewidth,
              Beerglass.FULL_MUG,
            );
            //console.log("Beer Served !");
            this._tapper_serving = false;
            // and obviously, when we finished serving we are looking to the rigth
            this._player_goleft = false;
            this._player_action = this.STAND_R1;
            SoundMngr.play(SoundMngr.THROW_MUG);
          }
        }
        // manage other events
        else {
          // go back for the standing position
          //this._player_running = false;
          if (this._player_goleft) this._player_action = this.STAND_L1;
          else this._player_action = this.STAND_R1;

          // reset the running animation
          this._legState = this.RUN_DOWN_1 - 2;
        }

        break;
      }

      default:
        break;
    }
  },
};

export default Player;
