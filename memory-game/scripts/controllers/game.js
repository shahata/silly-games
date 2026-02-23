"use strict";

(function () {
  function GameController(MemoryGame) {
    var tileNames = [
      "8-ball",
      "kronos",
      "baked-potato",
      "dinosaur",
      "rocket",
      "skinny-unicorn",
      "that-guy",
      "zeppelin",
    ];

    this.game = new MemoryGame(tileNames);
  }

  GameController.$inject = ["MemoryGame"];

  angular
    .module("angularMemoryGameApp")
    .controller("GameController", GameController);
})();
