class System {
  #canvas = null;
  #backBuffer = null;
  #gameWidth;
  #gameHeight;
  #zoomFactor;

  initVideo(wrapper, gameWidth, gameHeight, zoomFactor = 1) {
    this.#gameWidth = gameWidth;
    this.#gameHeight = gameHeight;
    this.#canvas = document.createElement("canvas");
    wrapper.appendChild(this.#canvas);
    return this.resize(zoomFactor);
  }

  resize(zoomFactor) {
    if (this.#zoomFactor === zoomFactor) {
      return zoomFactor === 1
        ? this.#canvas.getContext("2d")
        : this.#backBuffer.getContext("2d");
    }
    this.#zoomFactor = zoomFactor;
    this.#canvas.width = this.#gameWidth * zoomFactor;
    this.#canvas.height = this.#gameHeight * zoomFactor;

    if (zoomFactor === 1) {
      this.#backBuffer = null;
      return this.#canvas.getContext("2d");
    } else {
      if (!this.#backBuffer) {
        this.#backBuffer = document.createElement("canvas");
        this.#backBuffer.width = this.#gameWidth;
        this.#backBuffer.height = this.#gameHeight;
      }
      return this.#backBuffer.getContext("2d");
    }
  }

  drawFrameBuffer() {
    if (this.#backBuffer) {
      this.#canvas
        .getContext("2d")
        .drawImage(
          this.#backBuffer,
          0,
          0,
          this.#backBuffer.width,
          this.#backBuffer.height,
          0,
          0,
          this.#canvas.width,
          this.#canvas.height,
        );
    }
  }
}

export default new System();
