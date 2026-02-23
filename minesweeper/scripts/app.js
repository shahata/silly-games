import MinesweeperCtrl from "./controllers/minesweeper.js";
import onContextmenu from "./directives/on-contextmenu.js";
import "../styles/main.css";

angular
  .module("minesweeperApp", [])
  .controller("MinesweeperCtrl", MinesweeperCtrl)
  .directive("onContextmenu", onContextmenu);
