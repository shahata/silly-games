import SoundManager from "./SoundManager.js";

function imageUrl(name) {
  return new URL(`../images/${name}.png`, import.meta.url).href;
}

const IMAGE_DATA = [
  { name: "loading_title", src: imageUrl("loading_title") },
  { name: "game_title", src: imageUrl("game_title") },
  { name: "ready_to_play", src: imageUrl("ready_to_play") },
  { name: "background", src: imageUrl("background") },
  { name: "barman", src: imageUrl("barman") },
  { name: "beer_glass", src: imageUrl("beer_glass") },
  { name: "customers", src: imageUrl("customers") },
  { name: "font", src: imageUrl("font") },
  { name: "misc", src: imageUrl("misc") },
];

const LOGO_WIDTH = 234;
const LOGO_HEIGHT = 104;

class ResourceManager {
  #imageList = {};
  #loadCount = 0;
  #resourceCount = 0;
  #loadedCallback;

  #resourceLoaded = () => {
    if (++this.#loadCount === this.#resourceCount) this.#loadedCallback();
  };

  loadAllResources(loadCallback) {
    this.#loadCount = 0;
    this.#resourceCount = this.preloadImages(this.#resourceLoaded);
    this.#resourceCount += SoundManager.preloadSounds(this.#resourceLoaded);
    this.#loadedCallback = loadCallback;
  }

  preloadImages(loadCallback) {
    this.#imageList = {};
    for (const imageData of IMAGE_DATA) {
      const newImage = new Image();
      newImage.addEventListener("load", loadCallback);
      newImage.src = imageData.src;
      this.#imageList[imageData.name] = newImage;
    }
    return IMAGE_DATA.length;
  }

  displayLoadingScreen(context) {
    context.fillStyle = "black";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fill();
    context.drawImage(
      this.getImageResource("loading_title"),
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
}

export default new ResourceManager();
