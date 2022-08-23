'use strict';

  class Player {

  x;
  y;
  speed;
  direction = 'right';
  width;
  height;

  constructor(x = 0, y = 500, speed = 7) {
    this.x = x;
    this.y = y;
    this.speed = speed;
  }

  logic() {
    if(Interactor.isPressed('a') || Interactor.isPressed('ArrowLeft')) {
      this.playerX -= this.playerSpeed;
      this.shouldRedraw = true;
      this.playerDirection = 'left';
    }

    if(Interactor.isPressed('d') || Interactor.isPressed('ArrowRight')) {
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