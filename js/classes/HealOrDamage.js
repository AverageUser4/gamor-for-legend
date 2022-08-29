'use strict';

class HealOrDamage {

  x;
  y;
  amount;
  healOrDamage;
  opacity = 1;

  constructor(healOrDamage, x, y, amount) {
    this.x = x;
    this.y = y;
    this.amount = amount;
    this.healOrDamage = healOrDamage;
  }

  logic() {
    this.y -= 5;
    this.opacity -= 0.04;
    if(this.opacity < 0)
      this.opacity = 0;
  }

  draw() {
    canvasor.ctx.globalAlpha = this.opacity;
    canvasor.ctx.font = 'bold 16px sans-serif';

    if(this.healOrDamage === 'damage') {
      canvasor.ctx.strokeStyle = 'black';
      canvasor.ctx.strokeText(`-${this.amount} HP!`, this.x, this.y);
      canvasor.ctx.fillStyle = colors.red;
      canvasor.ctx.fillText(`-${this.amount} HP!`, this.x, this.y);
    }
    else {
      canvasor.ctx.strokeStyle = 'black';
      canvasor.ctx.strokeText(`+${this.amount} HP!`, this.x, this.y);
      canvasor.ctx.fillStyle = colors.green;
      canvasor.ctx.fillText(`+${this.amount} HP!`, this.x, this.y);
    }

    canvasor.ctx.globalAlpha = 1;
  }

}