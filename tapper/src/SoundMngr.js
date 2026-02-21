var g_sound_enable = true;

var SoundMngr = {
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

  _audio_channels: new Array(),

  init: function () {},

  load: function (sound_id, sound, loadCallBack) {
    var soundclip = document.createElement("audio");

    soundclip.src = sound.src;
    soundclip.autobuffer = true;
    soundclip.preload = "auto";

    soundclip.addEventListener(
      "canplaythrough",
      function handler(event) {
        this.removeEventListener("canplaythrough", handler, false);
        loadCallBack();
      },
      false,
    );
    soundclip.load();

    this._audio_channels[sound_id] = [soundclip];
    // create other copy channels if necessary
    if (sound.channel > 1) {
      for (var channel = 1; channel < sound.channel; channel++) {
        this._audio_channels[sound_id].push(soundclip.cloneNode(true));
      }
    }
  },

  stop: function (sound_id) {
    if (g_sound_enable) {
      var sound = this._audio_channels[sound_id];
      for (var channel_id = sound.length; channel_id--; ) {
        sound[channel_id].pause();
      }
    }
  },

  play: function (sound_id, loop) {
    if (g_sound_enable) {
      var free_channel = 0;

      var clip = this._audio_channels[sound_id];

      for (var channel_id = clip.length; channel_id--; ) {
        if (clip[channel_id].paused || clip[channel_id].ended) {
          // we found a free channel !
          free_channel = channel_id;
          break;
        }
      }
      // force reset to beginning
      clip[free_channel].currentTime = 0;

      clip[free_channel].loop = loop;

      clip[free_channel].play();
    }
  },
};

export default SoundMngr;
