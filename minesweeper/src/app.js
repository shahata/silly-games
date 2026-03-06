import { Minefield, gameState } from "./game.js";
import "./app.css";

function MinesweeperCtrl($scope) {
  $scope.parameters = {
    rows: 10,
    columns: 10,
    mines: 15,
  };

  $scope.dismissPopup = function () {
    $scope.showPopup = false;
  };

  $scope.restart = function () {
    $scope.endMessage = null;
    $scope.showPopup = false;
    $scope.minefield = new Minefield(
      parseInt($scope.parameters.rows),
      parseInt($scope.parameters.columns),
      parseInt($scope.parameters.mines),
    );
  };

  $scope.$watch("minefield.state", function (newValue) {
    $scope.$evalAsync(function () {
      if (newValue === gameState.LOST) {
        $scope.endMessage = "You Lost!";
        $scope.showPopup = true;
      } else if (newValue === gameState.WON) {
        $scope.endMessage = "You Won!";
        $scope.showPopup = true;
      }
    });
  });

  $scope.restart();
}

MinesweeperCtrl.$inject = ["$scope"];

function onContextmenu($parse) {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      var fn = $parse(attrs.onContextmenu);
      element.on("contextmenu", function (e) {
        scope.$apply(function () {
          e.preventDefault();
          fn(scope, { $event: e });
        });
      });
    },
  };
}

onContextmenu.$inject = ["$parse"];

angular
  .module("minesweeperApp", [])
  .controller("MinesweeperCtrl", MinesweeperCtrl)
  .directive("onContextmenu", onContextmenu);
