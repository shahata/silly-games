import "./modulepreload-polyfill-COaX8i6R.js";
angular.module("angularMemoryGameApp", []);
(function() {
  function GameController(MemoryGame) {
    var tileNames = [
      "8-ball",
      "kronos",
      "baked-potato",
      "dinosaur",
      "rocket",
      "skinny-unicorn",
      "that-guy",
      "zeppelin"
    ];
    this.game = new MemoryGame(tileNames);
  }
  angular.module("angularMemoryGameApp").controller("GameController", GameController);
})();
const __vite_glob_0_0 = "/silly-games/assets/8-ball-D_9Vn-GD.png";
const __vite_glob_0_1 = "/silly-games/assets/back-Db2KKMtv.png";
const __vite_glob_0_2 = "/silly-games/assets/baked-potato-zkIEreom.png";
const __vite_glob_0_3 = "/silly-games/assets/dinosaur-CApzIoh4.png";
const __vite_glob_0_4 = "/silly-games/assets/kronos-BwsMa8gR.png";
const __vite_glob_0_5 = "/silly-games/assets/rocket-4i0xpyYl.png";
const __vite_glob_0_6 = "/silly-games/assets/skinny-unicorn-CclFCvvD.png";
const __vite_glob_0_7 = "/silly-games/assets/that-guy-C9hGFqb9.png";
const __vite_glob_0_8 = "/silly-games/assets/yeoman-BBOISh3g.png";
const __vite_glob_0_9 = "/silly-games/assets/zeppelin-D1lQ3B3s.png";
(function() {
  function memoryGameFactory() {
    function Tile(title) {
      this.title = title;
      this.imageUrl = new URL((/* @__PURE__ */ Object.assign({ "../../images/8-ball.png": __vite_glob_0_0, "../../images/back.png": __vite_glob_0_1, "../../images/baked-potato.png": __vite_glob_0_2, "../../images/dinosaur.png": __vite_glob_0_3, "../../images/kronos.png": __vite_glob_0_4, "../../images/rocket.png": __vite_glob_0_5, "../../images/skinny-unicorn.png": __vite_glob_0_6, "../../images/that-guy.png": __vite_glob_0_7, "../../images/yeoman.png": __vite_glob_0_8, "../../images/zeppelin.png": __vite_glob_0_9 }))[`../../images/${title}.png`], import.meta.url).href;
      this.flipped = false;
    }
    Tile.prototype.flip = function() {
      this.flipped = !this.flipped;
    };
    function makeGrid(tileNames) {
      var tileDeck = [];
      tileNames.forEach(function(name) {
        tileDeck.push(new Tile(name));
        tileDeck.push(new Tile(name));
      });
      var gridDimension = Math.sqrt(tileDeck.length), grid = [];
      for (var row = 0; row < gridDimension; row++) {
        grid[row] = [];
        for (var col = 0; col < gridDimension; col++) {
          var i = Math.floor(Math.random() * tileDeck.length);
          grid[row][col] = tileDeck.splice(i, 1)[0];
        }
      }
      return grid;
    }
    function MemoryGame(tileNames) {
      var currentPair = [];
      this.grid = makeGrid(tileNames);
      this.message = "Click on a tile.";
      this.unmatchedPairs = tileNames.length;
      function hideUnmatchedPairIfNeeded() {
        if (currentPair.length === 2) {
          currentPair[0].flip();
          currentPair[1].flip();
          currentPair = [];
        }
      }
      this.flipTile = function(tile) {
        if (tile.flipped) {
          return;
        }
        hideUnmatchedPairIfNeeded();
        tile.flip();
        currentPair.push(tile);
        if (currentPair.length === 1) {
          this.message = "Pick one more card.";
        } else if (currentPair[0].title !== currentPair[1].title) {
          this.message = "Try again.";
        } else {
          this.unmatchedPairs--;
          this.message = this.unmatchedPairs > 0 ? "Good job! Keep going." : "You win!";
          currentPair = [];
        }
      };
    }
    return MemoryGame;
  }
  angular.module("angularMemoryGameApp").factory("MemoryGame", memoryGameFactory);
})();
