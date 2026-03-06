function makeTile(title) {
  return {
    title,
    imageUrl: new URL(`../images/${title}.png`, import.meta.url).href,
    flipped: false,
    flip() {
      this.flipped = !this.flipped;
    },
  };
}

function makeGrid(tileNames) {
  const tileDeck = tileNames.flatMap((name) => [makeTile(name), makeTile(name)]);
  const gridDimension = Math.sqrt(tileDeck.length);
  const grid = [];

  for (let row = 0; row < gridDimension; row++) {
    grid[row] = [];
    for (let col = 0; col < gridDimension; col++) {
      const i = Math.floor(Math.random() * tileDeck.length);
      grid[row][col] = tileDeck.splice(i, 1)[0];
    }
  }

  return grid;
}

export function MemoryGame(tileNames) {
  let currentPair = [];
  this.grid = makeGrid(tileNames);
  this.message = "Click on a tile.";
  this.unmatchedPairs = tileNames.length;

  const hideUnmatchedPairIfNeeded = () => {
    if (currentPair.length === 2) {
      currentPair[0].flip();
      currentPair[1].flip();
      currentPair = [];
    }
  };

  this.flipTile = (tile) => {
    if (tile.flipped) return;

    hideUnmatchedPairIfNeeded();
    tile.flip();
    currentPair.push(tile);

    if (currentPair.length === 1) {
      this.message = "Pick one more card.";
    } else if (currentPair[0].title !== currentPair[1].title) {
      this.message = "Try again.";
    } else {
      this.unmatchedPairs--;
      this.message =
        this.unmatchedPairs > 0 ? "Good job! Keep going." : "You win!";
      currentPair = [];
    }
  };
}
