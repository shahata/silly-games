import Player, { DOWN, FIRE, LEFT, NONE, RIGHT, UP } from "./Player.js";
import Customers from "./Customers.js";
import Beers from "./Beers.js";
import LevelManager from "./LevelManager.js";
import SoundManager, {
  GET_READY,
  LAUGHING,
  OH_SUSANNA,
  YOU_LOSE,
} from "./SoundManager.js";
import System from "./System.js";
import ResourceManager from "./ResourceManager.js";
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
    this.#frameBuffer = System.initVideo("tapperJS", 512, 480);
    SoundManager.init();
    GameState.changeState(STATE_LOADING);
    setInterval(() => this.onUpdateFrame(), 1000 / FPS);
    ResourceManager.loadAllResources(() => this.loaded());
  }

  loaded() {
    LevelManager.init();
    Player.init();
    Beers.init();
    Customers.init();

    document.addEventListener("keydown", (event) => this.onKeyPress(event));
    document.addEventListener("keyup", (event) => this.onKeyRelease(event));

    GameState.changeState(STATE_MENU);

    const newGameButton = document.getElementById("tapper-new-game");
    if (newGameButton) {
      newGameButton.addEventListener("click", () => {
        SoundManager.stop(OH_SUSANNA);
        GameState.changeState(STATE_MENU);
      });
    }
  }

  reset() {
    GameState.changeState(STATE_READY);
    Player.reset();
    Beers.reset();
    Customers.reset();
    LevelManager.reset();

    SoundManager.play(GET_READY, false);
    setTimeout(() => {
      if (GameState.state === STATE_READY) {
        GameState.changeState(STATE_PLAY);
        SoundManager.play(OH_SUSANNA, true);
      }
    }, 2.5 * 1000);
  }

  lost() {
    Player.lost();
    Beers.stop();
    Customers.stop();

    SoundManager.stop(OH_SUSANNA);

    if (LevelManager.lives <= 0) {
      GameState.changeState(STATE_GAME_OVER);
      SoundManager.play(YOU_LOSE, false);
    } else {
      GameState.changeState(STATE_LIFE_LOST);
      SoundManager.play(LAUGHING, false);
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
        if (Beers.draw(this.#frameBuffer) !== 0) {
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
