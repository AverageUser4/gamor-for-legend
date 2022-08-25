'use strict';

class DamageTaken {

  // should always redraw when there is at least
  // one instance of this class

  x;
  y;
  amount;
  opacity = 1;

  constructor(x, y, amount) {
    this.x = x;
    this.y = y;
    this.amount = amount;
  }

  logic() {
    this.y -= 5;
    this.opacity -= 0.05;
    if(this.opacity < 0)
      this.opacity = 0;
  }

  draw() {
    canvasor.ctx.globalAlpha = this.opacity;

    canvasor.ctx.fillStyle = 'red';
    canvasor.ctx.fillText(`-${this.amount} HP!`, this.x, this.y);

    canvasor.ctx.globalAlpha = 1;
  }

}