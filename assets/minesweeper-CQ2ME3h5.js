import "./modulepreload-polyfill-COaX8i6R.js";
angular.module("minesweeperApp", []);
angular.module("minesweeperApp").constant("gameState", {
  LOST: "lost",
  WON: "won",
  PLAYING: "playing"
}).factory(
  "Minefield",
  function MinefieldFactory(minePlanter, gameState, Cell) {
    return function(rows, columns, mines) {
      var game, self = this;
      function getNeighbors(coord) {
        var neighbors = [];
        function pushNeighbor(drow, dcolumn) {
          var actualRow = coord.row + drow;
          var actualColumn = coord.column + dcolumn;
          if (game[actualRow] && game[actualRow][actualColumn]) {
            neighbors.push(game[actualRow][actualColumn]);
          }
        }
        pushNeighbor(-1, -1);
        pushNeighbor(-1, 0);
        pushNeighbor(-1, 1);
        pushNeighbor(0, -1);
        pushNeighbor(0, 1);
        pushNeighbor(1, -1);
        pushNeighbor(1, 0);
        pushNeighbor(1, 1);
        return neighbors;
      }
      function allCells() {
        return game.reduce(function(all, row) {
          return all.concat(row);
        }, []);
      }
      function revealAll() {
        allCells().forEach(function(cell) {
          cell.revealed = true;
        });
      }
      function gameOver(state) {
        self.state = state;
        revealAll();
      }
      function onCellRevealed(cell, auto) {
        if (cell.mine) {
          gameOver(gameState.LOST);
          return;
        }
        if (auto) {
          var neighbors = getNeighbors(cell.coord);
          if (neighbors.filter(function(neighbor) {
            return neighbor.flagged;
          }).length >= cell.count) {
            neighbors.forEach(function(neighbor) {
              neighbor.$reveal();
            });
          }
        } else if (cell.count === 0) {
          getNeighbors(cell.coord).forEach(function(neighbor) {
            neighbor.$reveal();
          });
        }
        var won = allCells().every(function(cell2) {
          return cell2.revealed || cell2.mine;
        });
        if (won) {
          gameOver(gameState.WON);
        }
      }
      function plantMines() {
        minePlanter(rows, columns, mines).forEach(function(coord) {
          game[coord.row][coord.column].mine = true;
          getNeighbors(coord).forEach(function(cell) {
            cell.count++;
          });
        });
      }
      function initGame() {
        game = [];
        for (var row = 0; row < rows; row++) {
          game.push([]);
          for (var column = 0; column < columns; column++) {
            game[row].push(
              new Cell({ row, column }, onCellRevealed)
            );
          }
        }
      }
      initGame();
      plantMines();
      this.game = game;
      this.state = gameState.PLAYING;
    };
  }
);
angular.module("minesweeperApp").controller(
  "MinesweeperCtrl",
  function($scope, Minefield, gameState, $window) {
    $scope.parameters = {
      rows: 10,
      columns: 10,
      mines: 15
    };
    $scope.restart = function() {
      $scope.minefield = new Minefield(
        parseInt($scope.parameters.rows),
        parseInt($scope.parameters.columns),
        parseInt($scope.parameters.mines)
      );
    };
    $scope.$watch("minefield.state", function(newValue) {
      $scope.$evalAsync(function() {
        if (newValue === gameState.LOST) {
          $window.alert("You Lost!");
        } else if (newValue === gameState.WON) {
          $window.alert("You Won!");
        }
      });
    });
    $scope.restart();
  }
);
angular.module("minesweeperApp").directive("onContextmenu", function($parse) {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      var fn = $parse(attrs.onContextmenu);
      element.on("contextmenu", function(e) {
        scope.$apply(function() {
          e.preventDefault();
          fn(scope, { $event: e });
        });
      });
    }
  };
});
angular.module("minesweeperApp").value("random", function(max) {
  return Math.floor(Math.random() * max);
}).factory("minePlanter", function(random) {
  return function(rows, columns, mines) {
    function coordExists(arr, coord2) {
      return arr.some(function(value) {
        return angular.equals(value, coord2);
      });
    }
    var mineArr = [];
    while (mineArr.length !== mines) {
      var coord = { row: random(rows), column: random(columns) };
      if (!coordExists(mineArr, coord)) {
        mineArr.push(coord);
      }
    }
    return mineArr;
  };
});
angular.module("minesweeperApp").factory("Cell", function() {
  return function(coord, onCellRevealed) {
    return {
      count: 0,
      mine: false,
      revealed: false,
      flagged: false,
      coord,
      $autoReveal: function() {
        if (this.revealed) {
          (onCellRevealed || angular.noop)(this, true);
        }
      },
      $reveal: function() {
        if (!this.revealed && !this.flagged) {
          this.revealed = true;
          (onCellRevealed || angular.noop)(this);
        }
      },
      $flag: function() {
        if (!this.revealed) {
          this.flagged = !this.flagged;
        }
      },
      $displayValue: function() {
        if (this.mine) {
          return "*";
        } else {
          return this.count ? this.count : "";
        }
      }
    };
  };
});
