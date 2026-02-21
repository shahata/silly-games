import SoundMngr from "./SoundMngr.js";
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

var g_imageData = [
  { name: "game_title", src: gameTitleImage },
  { name: "pregame", src: pregameImage },
  { name: "level-1", src: level1Image },
  { name: "barman", src: barmanImage },
  { name: "beerglass", src: beerglassImage },
  { name: "customers", src: customersImage },
  { name: "font", src: fontImage },
  { name: "misc", src: miscImage },
];

var g_soundData = [
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

var RessourceMngr = {
  imageList: null,

  loadCount: 0,

  loadingscreenLogo: null,

  loadingTitleName: loadingTitleImage,
  logoWidth: 234,
  logoHeight: 104,

  ressourceCount: 0,

  _loadedCallBack: undefined,

  checkLoadStatus: function () {
    //console.log ("%d/%d", RessourceMngr.loadCount, RessourceMngr.ressourceCount);
    if (RessourceMngr.loadCount == RessourceMngr.ressourceCount) {
      // callback function when loaded is finished
      RessourceMngr._loadedCallBack();
    } else {
      setTimeout(() => RessourceMngr.checkLoadStatus(), 100);
    }
  },

  loadAllRessources: function (loadCallBack) {
    RessourceMngr.ressourceCount = RessourceMngr.preloadImages(g_imageData);
    RessourceMngr.ressourceCount += RessourceMngr.preLoadSounds(g_soundData);
    RessourceMngr._loadedCallBack = loadCallBack;
    setTimeout(() => RessourceMngr.checkLoadStatus(), 100);
  },

  ressourceLoaded: function () {
    RessourceMngr.loadCount++;
  },

  preloadImages: function (/* Array */ images) {
    this.imageList = new Array();
    for (var i = 0; i < images.length; i++) {
      var newImage = new Image();
      this.imageList.push(images[i].name);
      newImage.src = images[i].src;
      newImage.onLoad = RessourceMngr.ressourceLoaded();
      this.imageList[images[i].name] = newImage;
    }
    return images.length;
  },

  preLoadSounds: function (soundData) {
    for (var i = 0; i < soundData.length; ++i) {
      SoundMngr.load(i, soundData[i], RessourceMngr.ressourceLoaded);
    }
    return soundData.length;
  },

  displayLoadingScreen: function (context) {
    this.loadingscreenLogo = new Image();
    this.loadingscreenLogo.src = this.loadingTitleName;

    context.fillStyle = "black";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fill();
    context.drawImage(
      this.loadingscreenLogo,
      (context.canvas.width - this.logoWidth) / 2,
      (context.canvas.height - this.logoHeight) / 2,
    );

    var percent = RessourceMngr.loadCount / RessourceMngr.ressourceCount;
    var width = Math.floor(percent * context.canvas.width);

    context.strokeStyle = "gray";
    context.strokeRect(0, 299, context.canvas.width, 20);
    context.fillStyle = "gray";
    context.fillRect(0, 299, width, 20);

    context.fillStyle = "white";
    context.font = "bold 14px Courier";
    context.textBaseline = "top";
    context.fillText("Loading...", 218, 300);
  },

  getImageRessource: function (name) {
    return this.imageList[name];
  },
};

export default RessourceMngr;
