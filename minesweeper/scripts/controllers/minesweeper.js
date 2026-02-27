import gameState from "../services/game-state.js";
import Minefield from "../services/minefield.js";

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

export default MinesweeperCtrl;
