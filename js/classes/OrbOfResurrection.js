'use strict';

const orbOfResurrection = {

  x: -1000,
  y: canvasor.height - 100,
  width: 50,
  height: 50,
  ready: false,
  visible: false,
  playerReachDistance: 150,
  
  initialise() {
    this.image = new Image();

    this.image.addEventListener('load', () => {
      this.ready = true;
    });
    this.image.addEventListener('error', () => {
      this.image = null;
    });

    this.image.src = dirs.otherDir + 'orb-of-resurrection.png';
  },

  hide() {
    this.x = -1000;
    this.visible = false;
  },

  show(mapEndX) {
    this.x = Math.floor(Math.random() * (mapEndX - this.width));
    this.visible = true;
  },

  draw(playerX) {
    if(!this.visible)
      return;

    if(this.image)
      canvasor.ctx.drawImage(this.image, this.x, this.y);
    else {
      canvasor.ctx.fillStyle = colors.yellow;
      canvasor.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    if(Math.abs(this.x - playerX) > this.playerReachDistance)
      return;

    canvasor.ctx.font = '16px sans-serif';
    canvasor.ctx.strokeStyle = 'black';
    canvasor.ctx.fillStyle = colors.yellow;

    const w = canvasor.ctx.measureText(`Naciśnij 'C', żeby zebrać.`).width;
    const x = this.x + this.width / 2 - w / 2;
    canvasor.ctx.strokeText(`Naciśnij 'C', żeby zebrać.`, x, this.y - 5);
    canvasor.ctx.fillText(`Naciśnij 'C', żeby zebrać.`, x, this.y - 5);
  },

};

orbOfResurrection.initialise();