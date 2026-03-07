export const BARMAN_ZIP_UP = "zip_up";
export const BARMAN_ZIP_DOWN = "zip_down";
export const OH_SUSANNA = "oh_susanna";
export const GRAB_MUG = "grab_mug";
export const THROW_MUG = "throw_mug";
export const MUG_FILL_1 = "mug_fill1";
export const MUG_FILL_2 = "mug_fill2";
export const FULL_MUG = "full_mug";
export const POP_OUT = "pop_out";
export const OUT_DOOR = "out_door";
export const LAUGHING = "laughing";
export const GET_READY = "get_ready";
export const YOU_LOSE = "you_lose";
export const COLLECT_TIP = "collect_tip";
export const TIP_APPEAR = "tip_appear";

function soundUrl(name) {
  return new URL(`../sounds/${name}.mp3`, import.meta.url).href;
}

const SOUND_DATA = [
  { name: BARMAN_ZIP_UP, src: soundUrl(BARMAN_ZIP_UP), channel: 4 },
  { name: BARMAN_ZIP_DOWN, src: soundUrl(BARMAN_ZIP_DOWN), channel: 4 },
  { name: OH_SUSANNA, src: soundUrl(OH_SUSANNA), channel: 1 },
  { name: GRAB_MUG, src: soundUrl(GRAB_MUG), channel: 2 },
  { name: THROW_MUG, src: soundUrl(THROW_MUG), channel: 4 },
  { name: MUG_FILL_1, src: soundUrl(MUG_FILL_1), channel: 2 },
  { name: MUG_FILL_2, src: soundUrl(MUG_FILL_2), channel: 2 },
  { name: FULL_MUG, src: soundUrl(FULL_MUG), channel: 1 },
  { name: POP_OUT, src: soundUrl(POP_OUT), channel: 4 },
  { name: OUT_DOOR, src: soundUrl(OUT_DOOR), channel: 4 },
  { name: LAUGHING, src: soundUrl(LAUGHING), channel: 1 },
  { name: GET_READY, src: soundUrl(GET_READY), channel: 1 },
  { name: YOU_LOSE, src: soundUrl(YOU_LOSE), channel: 1 },
  { name: COLLECT_TIP, src: soundUrl(COLLECT_TIP), channel: 1 },
  { name: TIP_APPEAR, src: soundUrl(TIP_APPEAR), channel: 1 },
];

class SoundManager {
  #soundList = {};

  preloadSounds(loadCallback) {
    for (const soundData of SOUND_DATA) {
      this.load(soundData, loadCallback);
    }
    return SOUND_DATA.length;
  }

  load(sound, loadCallback) {
    const soundClip = document.createElement("audio");
    soundClip.src = sound.src;
    soundClip.autobuffer = true;
    soundClip.preload = "auto";
    soundClip.addEventListener("canplaythrough", loadCallback, { once: true });
    soundClip.load();
    this.#soundList[sound.name] = new Array(sound.channel)
      .fill()
      .map(() => soundClip.cloneNode(true));
  }

  stop(soundId) {
    this.#soundList[soundId].forEach((clip) => clip.pause());
  }

  play(soundId, loop = false) {
    const soundClip = this.#soundList[soundId].find(
      (clip) => clip.paused || clip.ended,
    );
    if (soundClip) {
      soundClip.currentTime = 0;
      soundClip.loop = loop;
      soundClip.play();
    }
  }
}

export default new SoundManager();
