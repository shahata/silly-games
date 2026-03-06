export function Cell(coord, onCellRevealed) {
  return {
    count: 0,
    mine: false,
    revealed: false,
    flagged: false,
    coord,
    $autoReveal() {
      if (this.revealed) {
        onCellRevealed?.(this, true);
      }
    },
    $reveal() {
      if (!this.revealed && !this.flagged) {
        this.revealed = true;
        onCellRevealed?.(this);
      }
    },
    $flag() {
      if (!this.revealed) {
        this.flagged = !this.flagged;
      }
    },
    $displayValue() {
      if (this.mine) {
        return "*";
      } else {
        return this.count ? this.count : "";
      }
    },
  };
}
