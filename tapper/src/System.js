var System = {
  canvasSupported: false,
  canvas: null,
  context2D: null,
  backBuffer: null,
  backBufferContext2D: null,
  wrapper: null,

  double_buffering: false,
  zoom_factor: 1,
  game_width: 0,
  game_height: 0,
  game_width_zoom: 0,
  game_height_zoom: 0,

  initVideo: function (
    wrapperid,
    game_width,
    game_height,
    double_buffering,
    zoom_factor,
  ) {
    this.game_width = game_width;
    this.game_height = game_height;

    this.double_buffering = double_buffering;

    // zoom only work with the double buffering since we
    // actually zoom the backbuffer before rendering it

    if (this.double_buffering) {
      this.zoom_factor = zoom_factor;
    } else {
      this.zoom_factor = 1;
    }

    this.game_width_zoom = this.game_width * this.zoom_factor;
    this.game_height_zoom = this.game_height * this.zoom_factor;

    this.wrapper = document.getElementById(wrapperid);

    this.canvas = document.createElement("canvas");

    this.canvas.setAttribute("width", this.game_width_zoom + "px");
    this.canvas.setAttribute("height", this.game_height_zoom + "px");
    this.canvas.setAttribute("border", 1 + "px solid black");
    this.canvas.setAttribute("style", 1 + "background: #fff");

    this.wrapper.appendChild(this.canvas);

    if (this.canvas.getContext) {
      this.canvasSupported = true;
      this.context2D = this.canvas.getContext("2d");

      // create the back buffer if we use double buffering
      if (this.double_buffering) {
        this.backBuffer = document.createElement("canvas");
        this.backBuffer.width = this.game_width;
        this.backBuffer.height = this.game_height;
        this.backBufferContext2D = this.backBuffer.getContext("2d");
      }
      this.canvasSupported = true;
    } else {
      this.canvasSupported = false;
    }

    return this.canvasSupported;
  },

  getFrameBuffer: function () {
    if (this.double_buffering) {
      return this.backBufferContext2D;
    } else {
      return this.context2D;
    }
  },

  drawFrameBuffer: function () {
    if (this.double_buffering) {
      this.context2D.drawImage(
        this.backBuffer,
        0,
        0,
        this.backBuffer.width,
        this.backBuffer.height,
        0,
        0,
        this.game_width_zoom,
        this.game_height_zoom,
      );
    }
    // else nothing to be done, as we directly render stuff on "context2D"
  },

  random: function (min, max) {
    var ran = Math.floor(Math.random() * (max - min + 1));
    return ran + min;
  },
};

export default System;
