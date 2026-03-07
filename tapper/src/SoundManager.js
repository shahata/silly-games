export const BARMAN_ZIP_UP = 0;
export const BARMAN_ZIP_DOWN = 1;
export const OH_SUSANNA = 2;
export const GRAB_MUG = 3;
export const THROW_MUG = 4;
export const MUG_FILL_1 = 5;
export const MUG_FILL_2 = 6;
export const FULL_MUG = 7;
export const POP_OUT = 8;
export const OUT_DOOR = 9;
export const LAUGHING = 10;
export const GET_READY = 11;
export const YOU_LOSE = 12;
export const COLLECT_TIP = 13;
export const TIP_APPEAR = 14;

class SoundManager {
  #audioChannels = [];

  load(soundId, sound, loadCallback) {
    const soundClip = document.createElement("audio");
    soundClip.src = sound.src;
    soundClip.autobuffer = true;
    soundClip.preload = "auto";

    soundClip.addEventListener(
      "canplaythrough",
      function handler() {
        this.removeEventListener("canplaythrough", handler, false);
        loadCallback();
      },
      false,
    );
    soundClip.load();

    this.#audioChannels[soundId] = new Array(sound.channel)
      .fill()
      .map(() => soundClip.cloneNode(true));
  }

  stop(soundId) {
    this.#audioChannels[soundId].forEach((clip) => clip.pause());
  }

  play(soundId, loop = false) {
    const soundClip = this.#audioChannels[soundId].find(
      (clip) => clip.paused || clip.ended,
    );
    soundClip.currentTime = 0;
    soundClip.loop = loop;
    soundClip.play();
  }
}

export default new SoundManager();
