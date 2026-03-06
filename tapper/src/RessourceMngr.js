import SoundManager from "./SoundMngr.js";
import loadingTitleImage from "../images/loading_title.png";
import gameTitleImage from "../images/game_title.png";
import pregameImage from "../images/pregame.png";
import level1Image from "../images/level-1.png";
import barmanImage from "../images/barman.png";
import beerglassImage from "../images/beerglass.png";
import customersImage from "../images/customers.png";
import fontImage from "../images/font.png";
import miscImage from "../images/misc.png";
import zipUpSound from "../sounds/zip_up.mp3";
import zipDownSound from "../sounds/zip_down.mp3";
import ohSuzannaSound from "../sounds/oh_suzanna.mp3";
import grabMugSound from "../sounds/grab_mug.mp3";
import throwMugSound from "../sounds/throw_mug.mp3";
import mugFill1Sound from "../sounds/mug_fill1.mp3";
import mugFill2Sound from "../sounds/mug_fill2.mp3";
import fullMugSound from "../sounds/full_mug.mp3";
import popOutSound from "../sounds/pop_out.mp3";
import outDoorSound from "../sounds/out_door.mp3";
import laughingSound from "../sounds/laughing.mp3";
import getReadyToServeSound from "../sounds/get_ready_to_serve.mp3";
import youLoseSound from "../sounds/you_lose.mp3";
import collectTipSound from "../sounds/collect_tip.mp3";
import tipAppearSound from "../sounds/tip_appear.mp3";

const IMAGE_DATA = [
  { name: "game_title", src: gameTitleImage },
  { name: "pregame", src: pregameImage },
  { name: "level-1", src: level1Image },
  { name: "barman", src: barmanImage },
  { name: "beerglass", src: beerglassImage },
  { name: "customers", src: customersImage },
  { name: "font", src: fontImage },
  { name: "misc", src: miscImage },
];

const SOUND_DATA = [
  { name: "zip_up", src: zipUpSound, channel: 4 }, // 0
  { name: "zip_down", src: zipDownSound, channel: 4 }, // 1
  { name: "oh_suzanna", src: ohSuzannaSound, channel: 1 }, // 2
  { name: "grab_mug", src: grabMugSound, channel: 2 }, // 3
  { name: "throw_mug", src: throwMugSound, channel: 4 }, // 4
  { name: "mug_fill1", src: mugFill1Sound, channel: 2 }, // 5
  { name: "mug_fill2", src: mugFill2Sound, channel: 2 }, // 6
  { name: "full_mug", src: fullMugSound, channel: 1 }, // 7
  { name: "pop_out", src: popOutSound, channel: 4 }, // 8
  { name: "out_door", src: outDoorSound, channel: 4 }, // 9
  { name: "laughing", src: laughingSound, channel: 1 }, // 10
  {
    name: "get_ready_to_serve",
    src: getReadyToServeSound,
    channel: 1,
  }, // 11
  { name: "you_lose", src: youLoseSound, channel: 1 }, // 12
  { name: "collect_tip", src: collectTipSound, channel: 1 }, // 13
  { name: "tip_appear", src: tipAppearSound, channel: 1 }, // 14
];

const LOGO_WIDTH = 234;
const LOGO_HEIGHT = 104;
const LOADING_CHECK_INTERVAL_MS = 100;

class ResourceManager {
  #imageList = {};
  #loadCount = 0;
  #loadingScreenLogo = null;
  #resourceCount = 0;
  #loadedCallback;

  #checkLoadStatus() {
    if (this.#loadCount === this.#resourceCount) {
      this.#loadedCallback();
      return;
    }

    setTimeout(() => this.#checkLoadStatus(), LOADING_CHECK_INTERVAL_MS);
  }

  #resourceLoaded = () => {
    this.#loadCount += 1;
  };

  loadAllResources(loadCallback) {
    this.#loadCount = 0;
    this.#resourceCount = this.preloadImages(IMAGE_DATA);
    this.#resourceCount += this.preloadSounds(SOUND_DATA);
    this.#loadedCallback = loadCallback;
    setTimeout(() => this.#checkLoadStatus(), LOADING_CHECK_INTERVAL_MS);
  }

  loadAllRessources(loadCallback) {
    this.loadAllResources(loadCallback);
  }

  preloadImages(images) {
    this.#imageList = {};

    for (let i = 0; i < images.length; i++) {
      const newImage = new Image();
      newImage.addEventListener("load", this.#resourceLoaded);
      newImage.src = images[i].src;
      this.#imageList[images[i].name] = newImage;
    }

    return images.length;
  }

  preloadSounds(soundData) {
    for (let i = 0; i < soundData.length; ++i) {
      SoundManager.load(i, soundData[i], this.#resourceLoaded);
    }

    return soundData.length;
  }

  preLoadSounds(soundData) {
    return this.preloadSounds(soundData);
  }

  displayLoadingScreen(context) {
    if (!this.#loadingScreenLogo) {
      this.#loadingScreenLogo = new Image();
      this.#loadingScreenLogo.src = loadingTitleImage;
    }

    context.fillStyle = "black";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fill();
    context.drawImage(
      this.#loadingScreenLogo,
      (context.canvas.width - LOGO_WIDTH) / 2,
      (context.canvas.height - LOGO_HEIGHT) / 2,
    );

    const percent =
      this.#resourceCount > 0 ? this.#loadCount / this.#resourceCount : 0;
    const width = Math.floor(percent * context.canvas.width);

    context.strokeStyle = "gray";
    context.strokeRect(0, 299, context.canvas.width, 20);
    context.fillStyle = "gray";
    context.fillRect(0, 299, width, 20);

    context.fillStyle = "white";
    context.font = "bold 14px Courier";
    context.textBaseline = "top";
    context.fillText("Loading...", 218, 300);
  }

  getImageResource(name) {
    return this.#imageList[name];
  }

  getImageRessource(name) {
    return this.getImageResource(name);
  }
}

export default new ResourceManager();
