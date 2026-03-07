class System {
  #canvas = null;
  #backBuffer = null;

  initVideo(wrapperId, gameWidth, gameHeight, zoomFactor = 1) {
    const wrapper = document.getElementById(wrapperId);
    this.#canvas = document.createElement("canvas");
    this.#canvas.width = gameWidth * zoomFactor;
    this.#canvas.height = gameHeight * zoomFactor;
    wrapper.appendChild(this.#canvas);

    if (zoomFactor === 1) {
      return this.#canvas.getContext("2d");
    } else {
      this.#backBuffer = document.createElement("canvas");
      this.#backBuffer.width = gameWidth;
      this.#backBuffer.height = gameHeight;
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
