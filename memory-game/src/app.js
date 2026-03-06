import { MemoryGame } from "./game.js";
import "./app.css";

function GameController() {
  const tileNames = [
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
  this.popupDismissed = false;

  this.dismissPopup = () => {
    this.popupDismissed = true;
  };

  this.restart = () => {
    this.game = new MemoryGame(tileNames);
    this.popupDismissed = false;
  };
}

angular
  .module("angularMemoryGameApp", [])
  .controller("GameController", GameController);
