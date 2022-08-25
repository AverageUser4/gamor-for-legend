'use strict';

class Player {

  healthMax = 100;
  health = 100;
  speed = 7;
  width;
  height;
  #x = 0;
  y = 500;
  #direction = 'right';
  image;
  damage = 15;
  bullet;

  get x() {
    return this.#x;
  }
  set x(x) {
    this.#x = x;
    this.shouldRedraw = true;
  }

  get direction() {
    return this.#direction;
  }
  set direction(direction) {
    this.#direction = direction;
    this.shouldRedraw = true;
  }

  // returned after logic
  shouldRedraw = false;

  constructor(image, bulletImage) {
    this.image = image;

    this.width = image.naturalWidth;
    this.height = image.naturalHeight;

    this.x = 0;
    this.y = canvasor.height - this.height;

    this.bullet = new Bullet(bulletImage, this.height);
  }

  logic(mapEndX, playerBulletCooldown) {
    const returnObject = { shouldRedraw: false, shouldAttack: false };

    // movement
    if(interactor.isPressed('a') || interactor.isPressed('ArrowLeft')) {
      this.x -= this.speed;
      this.direction = 'left';
    }

    if(interactor.isPressed('d') || interactor.isPressed('ArrowRight')) {
      this.x += this.speed;
      this.direction = 'right';
    }

    if(interactor.isPressed('s') || interactor.isPressed('ArrowDown'))
      this.direction = 'right';
    if(interactor.isPressed('w') || interactor.isPressed('ArrowUp'))
      this.direction = 'left';

    if(this.x < 0)
      this.x = 0;
    if(this.x + this.playerWidth > mapEndX)
      this.x = mapEndX - this.playerWidth;

    // attack
    if(
        playerBulletCooldown <= 0 && 
        (interactor.isPressed(' ') || interactor.isPressedMouse())
      )
        returnObject.shouldAttack = true;

    if(this.shouldRedraw) {
      returnObject.shouldRedraw = true;
      this.shouldRedraw = false;
    }

    return returnObject;
  }

  draw(translateOffsetX) {
    if(this.direction === 'right')
      canvasor.ctx.drawImage(this.image, this.x, this.y);
    else
      canvasor.mirrorImage(this.image, this.x, this.y, true, false, translateOffsetX);      

    // debug
    canvasor.ctx.strokeStyle = 'red';
    canvasor.ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

}