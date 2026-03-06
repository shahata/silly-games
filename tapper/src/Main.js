import Player, { DOWN, FIRE, LEFT, NONE, RIGHT, UP } from "./Player.js";
import Customers from "./Customers.js";
import Beerglass from "./Beerglass.js";
import LevelManager from "./LevelManager.js";
import SoundMngr, {
  GET_READY_TO_SERVE,
  LAUGHING,
  OH_SUZANNA,
  YOU_LOSE,
} from "./SoundMngr.js";
import System from "./System.js";
import ResourceManager from "./RessourceMngr.js";
import GameState, {
  FPS,
  STATE_GAME_OVER,
  STATE_LIFE_LOST,
  STATE_LOADING,
  STATE_MENU,
  STATE_PLAY,
  STATE_READY,
} from "./GameState.js";

class GameRunner {
  #isKeyPressAllowed = true;
  #frameBuffer = null;

  initialize() {
    if (!System.initVideo("tapperJS", 512, 480, false, 1.0)) {
      alert(
        "Sorry but no beer for you, your browser does not support html 5 canvas. Please try with another one!",
      );
      return;
    }

    this.#frameBuffer = System.getFrameBuffer();
    SoundMngr.init();
    GameState.changeState(STATE_LOADING);

    setInterval(() => {
      this.onUpdateFrame();
    }, 1000 / FPS);

    ResourceManager.loadAllResources(() => this.loaded());
  }

  loaded() {
    LevelManager.init();
    Player.init();
    Beerglass.init();
    Customers.init();

    document.addEventListener("keydown", (event) => this.onKeyPress(event));
    document.addEventListener("keyup", (event) => this.onKeyRelease(event));

    GameState.changeState(STATE_MENU);

    const newGameButton = document.getElementById("tapper-new-game");
    if (newGameButton) {
      newGameButton.addEventListener("click", () => {
        SoundMngr.stop(OH_SUZANNA);
        GameState.changeState(STATE_MENU);
      });
    }
  }

  reset() {
    GameState.changeState(STATE_READY);
    Player.reset();
    Beerglass.reset();
    Customers.reset();
    LevelManager.reset();

    SoundMngr.play(GET_READY_TO_SERVE, false);
    setTimeout(() => {
      if (GameState.state === STATE_READY) {
        GameState.changeState(STATE_PLAY);
        SoundMngr.play(OH_SUZANNA, true);
      }
    }, 2.5 * 1000);
  }

  lost() {
    Player.lost();
    Beerglass.stop();
    Customers.stop();

    SoundMngr.stop(OH_SUZANNA);

    if (LevelManager.life <= 0) {
      GameState.changeState(STATE_GAME_OVER);
      SoundMngr.play(YOU_LOSE, false);
    } else {
      GameState.changeState(STATE_LIFE_LOST);
      SoundMngr.play(LAUGHING, false);
      setTimeout(() => this.reset(), 3 * 1000);
    }
  }

  onUpdateFrame() {
    switch (GameState.state) {
      case STATE_LOADING:
        ResourceManager.displayLoadingScreen(this.#frameBuffer);
        break;
      case STATE_MENU:
        LevelManager.displayGameTitle(this.#frameBuffer);
        break;
      case STATE_READY:
        LevelManager.displayReadyToPlay(this.#frameBuffer);
        break;
      default:
        LevelManager.drawLevelBackground(this.#frameBuffer);
        if (Customers.draw(this.#frameBuffer) !== 0) {
          this.lost();
        }
        if (Beerglass.draw(this.#frameBuffer) !== 0) {
          this.lost();
        }
        this.#isKeyPressAllowed = Player.draw(this.#frameBuffer);
        LevelManager.drawGameHUD(this.#frameBuffer);
        if (GameState.state === STATE_GAME_OVER) {
          LevelManager.displayGameOver(this.#frameBuffer);
        }
        break;
    }

    System.drawFrameBuffer();
  }

  onKeyPress(event) {
    let preventDefault = false;
    if (!this.#isKeyPressAllowed) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        if (GameState.state === STATE_PLAY) {
          Player.move(UP);
        }
        preventDefault = true;
        break;
      case "ArrowDown":
        if (GameState.state === STATE_PLAY) {
          Player.move(DOWN);
        }
        preventDefault = true;
        break;
      case "ArrowLeft":
        if (GameState.state === STATE_PLAY) {
          Player.move(LEFT);
        }
        preventDefault = true;
        break;
      case "ArrowRight":
        if (GameState.state === STATE_PLAY) {
          Player.move(RIGHT);
        }
        preventDefault = true;
        break;
      case " ":
        if (GameState.state === STATE_PLAY) {
          Player.move(FIRE);
        }
        preventDefault = true;
        break;
      case "Enter":
        switch (GameState.state) {
          case STATE_MENU:
            LevelManager.newGame();
            this.reset();
            break;
          case STATE_GAME_OVER:
            GameState.changeState(STATE_MENU);
            break;
          default:
            break;
        }
        preventDefault = true;
        break;
      default:
        break;
    }

    if (preventDefault) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  onKeyRelease(event) {
    let preventDefault = false;
    if (!this.#isKeyPressAllowed) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
        preventDefault = true;
        break;
      case "ArrowLeft":
      case "ArrowRight":
      case " ":
        if (GameState.state === STATE_PLAY) {
          Player.move(NONE);
        }
        preventDefault = true;
        break;
      default:
        break;
    }

    if (preventDefault) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}

const Game = new GameRunner();

window.onload = function () {
  Game.initialize();
};
