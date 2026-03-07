class System {
  #canvasSupported = false;
  #canvas = null;
  #context2D = null;
  #backBuffer = null;
  #backBufferContext2D = null;
  #wrapper = null;

  #doubleBuffering = false;
  #zoomFactor = 1;
  #gameWidth = 0;
  #gameHeight = 0;
  #gameWidthZoom = 0;
  #gameHeightZoom = 0;

  initVideo(wrapperId, gameWidth, gameHeight, doubleBuffering, zoomFactor) {
    this.#gameWidth = gameWidth;
    this.#gameHeight = gameHeight;

    this.#doubleBuffering = doubleBuffering;

    if (this.#doubleBuffering) {
      this.#zoomFactor = zoomFactor;
    } else {
      this.#zoomFactor = 1;
    }

    this.#gameWidthZoom = this.#gameWidth * this.#zoomFactor;
    this.#gameHeightZoom = this.#gameHeight * this.#zoomFactor;

    this.#wrapper = document.getElementById(wrapperId);

    this.#canvas = document.createElement("canvas");
    this.#canvas.setAttribute("width", `${this.#gameWidthZoom}px`);
    this.#canvas.setAttribute("height", `${this.#gameHeightZoom}px`);
    this.#canvas.setAttribute("border", "1px solid black");
    this.#canvas.setAttribute("style", "background: #fff");

    this.#wrapper.appendChild(this.#canvas);

    if (this.#canvas.getContext) {
      this.#canvasSupported = true;
      this.#context2D = this.#canvas.getContext("2d");

      if (this.#doubleBuffering) {
        this.#backBuffer = document.createElement("canvas");
        this.#backBuffer.width = this.#gameWidth;
        this.#backBuffer.height = this.#gameHeight;
        this.#backBufferContext2D = this.#backBuffer.getContext("2d");
      }
    } else {
      this.#canvasSupported = false;
    }

    return this.#canvasSupported;
  }

  getFrameBuffer() {
    if (this.#doubleBuffering) {
      return this.#backBufferContext2D;
    }

    return this.#context2D;
  }

  drawFrameBuffer() {
    if (!this.#doubleBuffering) {
      return;
    }

    this.#context2D.drawImage(
      this.#backBuffer,
      0,
      0,
      this.#backBuffer.width,
      this.#backBuffer.height,
      0,
      0,
      this.#gameWidthZoom,
      this.#gameHeightZoom,
    );
  }

  random(min, max) {
    const randomValue = Math.floor(Math.random() * (max - min + 1));
    return randomValue + min;
  }
}

export default new System();
