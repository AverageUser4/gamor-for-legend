'use strict';

  class Player {

  x = 0;
  y = 500;
  speed = 7;
  direction = 'right';
  width;
  height;

  constructor() {

  }

  logic() {
    if(this.pressedKeys.has('a') || this.pressedKeys.has('ArrowLeft')) {
      this.playerX -= this.playerSpeed;
      this.shouldRedraw = true;
      this.playerDirection = 'left';
    }

    if(this.pressedKeys.has('d') || this.pressedKeys.has('ArrowRight')) {
      this.playerX += this.playerSpeed;
      this.shouldRedraw = true;
      this.playerDirection = 'right';
    }


    if(this.playerX < 0)
      this.playerX = 0;
    if(this.playerX + this.playerWidth > this.mapEndX)
      this.playerX = this.mapEndX - this.playerWidth;


    // camera movement
    if(this.playerX >= 300)
      this.translateOffsetX = -this.playerX + 300;

    const checkTranslate = this.backgroundImage.naturalWidth * -this.backgroundRepeatCount + 800;
    if(this.translateOffsetX < checkTranslate)
      this.translateOffsetX = checkTranslate;
  }

}