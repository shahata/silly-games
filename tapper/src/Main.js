import Player from "./Player.js";
import Customers from "./Customers.js";
import Beerglass from "./Beerglass.js";
import LevelManager from "./LevelManager.js";
import SoundMngr from "./SoundMngr.js";
import System from "./System.js";
import RessourceMngr from "./RessourceMngr.js";
import GameState from "./GameState.js";

const Game = {
  _keyPressAllowed: true,
  _frameBuffer: null,
  initialize: function () {
    if (!System.initVideo("tapperJS", 512, 480, false, 1.0)) {
      alert(
        "Sorry but no beer for you, your browser does not support html 5 canvas. Please try with another one!",
      );
      return;
    }

    this._frameBuffer = System.getFrameBuffer();

    SoundMngr.init();

    GameState.changeState(GameState.STATE_LOADING);

    setInterval(function () {
      Game.onUpdateFrame();
    }, 1000 / GameState.FPS);

    RessourceMngr.loadAllRessources(Game.loaded);
  },

  loaded: function () {
    LevelManager.init();
    Player.init();
    Beerglass.init();
    Customers.init();

    document.addEventListener("keydown", (e) => Game.onkeypress(e));
    document.addEventListener("keyup", (e) => Game.onkeyrelease(e));

    GameState.changeState(GameState.STATE_MENU);

    const newGameBtn = document.getElementById("tapper-new-game");

    if (newGameBtn) {
      newGameBtn.addEventListener("click", function () {
        SoundMngr.stop(SoundMngr.OH_SUZANNA);
        GameState.changeState(GameState.STATE_MENU);
      });
    }
  },

  reset: function () {
    GameState.changeState(GameState.STATE_READY);
    Player.reset();
    Beerglass.reset();
    Customers.reset();
    LevelManager.reset();

    SoundMngr.play(SoundMngr.GETREADYTOSERVE, false);
    setTimeout(() => {
      if (GameState.getState() === GameState.STATE_READY) {
        GameState.changeState(GameState.STATE_PLAY);
        SoundMngr.play(SoundMngr.OH_SUZANNA, true);
      }
    }, 2.5 * 1000);
  },

  lost: function () {
    Player.lost();
    Beerglass.stop();
    Customers.stop();

    SoundMngr.stop(SoundMngr.OH_SUZANNA);

    if (LevelManager._life <= 0) {
      GameState.changeState(GameState.STATE_GAMEOVER);

      SoundMngr.play(SoundMngr.YOU_LOSE, false);
    } else {
      GameState.changeState(GameState.STATE_LIFELOST);

      SoundMngr.play(SoundMngr.LAUGHING, false);

      setTimeout(() => Game.reset(), 3 * 1000);
    }
  },

  onUpdateFrame: function () {
    switch (GameState.getState()) {
      case GameState.STATE_LOADING: {
        RessourceMngr.displayLoadingScreen(this._frameBuffer);
        break;
      }

      case GameState.STATE_MENU: {
        LevelManager.displayGameTitle(this._frameBuffer);
        break;
      }

      case GameState.STATE_READY: {
        LevelManager.displayReadyToPlay(this._frameBuffer);
        break;
      }
      default:
        {
          LevelManager.drawLevelBackground(this._frameBuffer);
          if (Customers.draw(this._frameBuffer) !== 0) {
            Game.lost();
          }
          if (Beerglass.draw(this._frameBuffer) !== 0) {
            Game.lost();
          }
          this._keyPressAllowed = Player.draw(this._frameBuffer);
          LevelManager.drawGameHUD(this._frameBuffer);
          if (GameState.getState() === GameState.STATE_GAMEOVER) {
            LevelManager.displayGameOver(this._frameBuffer);
          }
        }
        break;
    }
    System.drawFrameBuffer();
  },

  onkeypress: function (e) {
    let preventDefault = false;

    if (!this._keyPressAllowed) return;

    switch (e.key) {
      case "ArrowUp": {
        if (GameState.getState() === GameState.STATE_PLAY)
          Player.move(Player.UP);
        preventDefault = true;
        break;
      }
      case "ArrowDown": {
        if (GameState.getState() === GameState.STATE_PLAY)
          Player.move(Player.DOWN);
        preventDefault = true;
        break;
      }
      case "ArrowLeft": {
        if (GameState.getState() === GameState.STATE_PLAY)
          Player.move(Player.LEFT);
        preventDefault = true;
        break;
      }
      case "ArrowRight": {
        if (GameState.getState() === GameState.STATE_PLAY)
          Player.move(Player.RIGHT);
        preventDefault = true;
        break;
      }
      case " ": {
        if (GameState.getState() === GameState.STATE_PLAY)
          Player.move(Player.FIRE);
        preventDefault = true;
        break;
      }

      case "Enter": {
        switch (GameState.getState()) {
          case GameState.STATE_MENU: {
            LevelManager.newGame();
            Game.reset();
            break;
          }

          case GameState.STATE_GAMEOVER: {
            GameState.changeState(GameState.STATE_MENU);
            break;
          }

          default:
            break;
        }
        preventDefault = true;
        break;
      }

      default:
        break;
    }
    if (preventDefault) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },

  onkeyrelease: function (e) {
    let preventDefault = false;

    if (!this._keyPressAllowed) return;

    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown": {
        preventDefault = true;
        break;
      }
      case "ArrowLeft": {
        if (GameState.getState() === GameState.STATE_PLAY)
          Player.move(Player.NONE);
        preventDefault = true;
        break;
      }
      case "ArrowRight": {
        if (GameState.getState() === GameState.STATE_PLAY)
          Player.move(Player.NONE);
        preventDefault = true;
        break;
      }
      case " ": {
        if (GameState.getState() === GameState.STATE_PLAY)
          Player.move(Player.NONE);
        preventDefault = true;
        break;
      }
      default:
        break;
    }
    if (preventDefault) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
};

window.onload = function () {
  Game.initialize();
};
