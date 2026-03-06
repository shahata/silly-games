const SoundMngr = {
  BARMAN_ZIP_UP: 0,
  BARMAN_ZIP_DOWN: 1,
  OH_SUZANNA: 2,
  GRAB_MUG: 3,
  THROW_MUG: 4,
  MUG_FILL1: 5,
  MUG_FILL2: 6,
  FULL_MUG: 7,
  POP_OUT: 8,
  OUT_DOOR: 9,
  LAUGHING: 10,
  GETREADYTOSERVE: 11,
  YOU_LOSE: 12,
  COLLECT_TIP: 13,
  TIP_APPEAR: 14,

  _enabled: true,
  _audio_channels: [],

  init() {},

  load(sound_id, sound, loadCallBack) {
    const soundclip = document.createElement("audio");

    soundclip.src = sound.src;
    soundclip.autobuffer = true;
    soundclip.preload = "auto";

    soundclip.addEventListener(
      "canplaythrough",
      function handler() {
        this.removeEventListener("canplaythrough", handler, false);
        loadCallBack();
      },
      false,
    );
    soundclip.load();

    this._audio_channels[sound_id] = [soundclip];
    if (sound.channel > 1) {
      for (let channel = 1; channel < sound.channel; channel++) {
        this._audio_channels[sound_id].push(soundclip.cloneNode(true));
      }
    }
  },

  stop(sound_id) {
    if (this._enabled) {
      const sound = this._audio_channels[sound_id];
      for (let i = sound.length; i--; ) {
        sound[i].pause();
      }
    }
  },

  play(sound_id, loop) {
    if (this._enabled) {
      let free_channel = 0;
      const clip = this._audio_channels[sound_id];

      for (let i = clip.length; i--; ) {
        if (clip[i].paused || clip[i].ended) {
          free_channel = i;
          break;
        }
      }
      clip[free_channel].currentTime = 0;
      clip[free_channel].loop = loop;
      clip[free_channel].play();
    }
  },
};

export default SoundMngr;
