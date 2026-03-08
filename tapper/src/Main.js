import Player from "./Player.js";
import Customers from "./Customers.js";
import Beers from "./Beers.js";
import Tip from "./Tip.js";
import LevelManager from "./LevelManager.js";
import SoundManager, {
  GET_READY,
  LAUGHING,
  OH_SUSANNA,
  YOU_LOSE,
} from "./SoundManager.js";
import AutoPlayer from "./AutoPlayer.js";
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
  STATE_PAUSE,
} from "./GameState.js";

const GAME_WIDTH = 512;
const GAME_HEIGHT = 480;
const WRAPPER = document.getElementById("tapperJS");
const CHROME_HEIGHT = WRAPPER.getBoundingClientRect().top;

class Game {
  #isKeyPressAllowed = true;
  #frameBuffer = System.initVideo(
    WRAPPER,
    GAME_WIDTH,
    GAME_HEIGHT,
    this.#calcZoom(),
  );

  constructor() {
    GameState.changeState(STATE_LOADING);
    setInterval(() => this.#onUpdateFrame(), 1000 / FPS);
    ResourceManager.loadAllResources(() => this.#loaded());
    window.addEventListener("resize", () => {
      this.#frameBuffer = System.resize(this.#calcZoom());
    });
  }

  #calcZoom() {
    return Math.min(
      (window.innerWidth - 30) / GAME_WIDTH,
      (window.innerHeight - CHROME_HEIGHT - 30) / GAME_HEIGHT,
    );
  }

  #loaded() {
    document.addEventListener("keydown", (event) => this.#onKeyPress(event));
    document.addEventListener("keyup", (event) => this.#onKeyRelease(event));
    GameState.changeState(STATE_MENU);

    const newGameButton = document.getElementById("tapper-new-game");
    newGameButton.addEventListener("click", () => {
      SoundManager.stop(OH_SUSANNA);
      GameState.changeState(STATE_MENU);
    });
  }

  #reset() {
    GameState.changeState(STATE_READY);
    SoundManager.play(GET_READY);
    setTimeout(() => {
      if (GameState.state === STATE_READY) {
        GameState.changeState(STATE_PLAY);
        SoundManager.play(OH_SUSANNA, true);
        Player.reset();
        Beers.reset();
        Tip.reset();
        Customers.reset();
      }
    }, 2.5 * 1000);
  }

  #lost() {
    Player.lost();
    SoundManager.stop(OH_SUSANNA);
    if (LevelManager.lifeLost() <= 0) {
      GameState.changeState(STATE_GAME_OVER);
      SoundManager.play(YOU_LOSE);
    } else {
      GameState.changeState(STATE_LIFE_LOST);
      SoundManager.play(LAUGHING);
      setTimeout(() => this.#reset(), 3 * 1000);
    }
  }

  #onUpdateFrame() {
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
        if (
          Customers.draw(this.#frameBuffer) ||
          Beers.draw(this.#frameBuffer)
        ) {
          this.#lost();
        }
        Tip.draw(this.#frameBuffer);
        AutoPlayer.update();
        this.#isKeyPressAllowed = Player.draw(this.#frameBuffer);
        if (GameState.state === STATE_GAME_OVER) {
          LevelManager.displayTextOverlay(this.#frameBuffer, "Game Over !");
        } else if (GameState.state === STATE_PAUSE) {
          LevelManager.displayTextOverlay(this.#frameBuffer, "Game Paused");
        }
        break;
    }
    System.drawFrameBuffer();
  }

  #onKeyPress(event) {
    if (!this.#isKeyPressAllowed) return;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
      case " ":
        Player.move(event.key);
        break;
      case "Enter":
        if (GameState.state === STATE_MENU) {
          LevelManager.newGame();
          this.#reset();
        } else if (GameState.state === STATE_GAME_OVER) {
          GameState.changeState(STATE_MENU);
        }
        break;
      case "Tab":
        AutoPlayer.toggle();
        break;
      case "Escape":
        if (GameState.state === STATE_PLAY) {
          GameState.changeState(STATE_PAUSE);
          SoundManager.stop(OH_SUSANNA);
        } else if (GameState.state === STATE_PAUSE) {
          GameState.changeState(STATE_PLAY);
          SoundManager.play(OH_SUSANNA, true);
        }
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  #onKeyRelease(event) {
    if (!this.#isKeyPressAllowed) return;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
      case " ":
        Player.move(null);
        break;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

new Game();
