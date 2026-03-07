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
  #enabled = true;
  #audioChannels = [];

  init() {}

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

    this.#audioChannels[soundId] = [soundClip];
    if (sound.channel > 1) {
      for (let channel = 1; channel < sound.channel; channel++) {
        this.#audioChannels[soundId].push(soundClip.cloneNode(true));
      }
    }
  }

  stop(soundId) {
    if (!this.#enabled || !this.#audioChannels[soundId]) {
      return;
    }

    const sound = this.#audioChannels[soundId];
    for (const clip of sound) {
      clip.pause();
    }
  }

  play(soundId, loop = false) {
    if (!this.#enabled || !this.#audioChannels[soundId]) {
      return;
    }

    let freeChannel = 0;
    const clip = this.#audioChannels[soundId];

    for (let i = clip.length; i--; ) {
      if (clip[i].paused || clip[i].ended) {
        freeChannel = i;
        break;
      }
    }

    clip[freeChannel].currentTime = 0;
    clip[freeChannel].loop = loop;
    clip[freeChannel].play();
  }
}

export default new SoundManager();
