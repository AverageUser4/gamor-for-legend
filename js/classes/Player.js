'use strict';

class Player {

  ready = false;
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

  constructor(kind) {
    this.image = new Image();

    this.image.addEventListener('load', () => {
      this.furtherConstruction(kind);
    });
    this.image.addEventListener('error', () => console.error(`Couldn\'t load enemy\'s image: ${kind}`));

    this.image.src = `characters/${kind}.png`;
  }

  furtherConstruction(kind) {
    this.width = this.image.naturalWidth;
    this.height = this.image.naturalHeight;

    this.x = 0;
    this.y = canvasor.height - this.height;

    this.bullet = new Bullet(kind, this.height);

    this.ready = true;
  }

  logic(mapEndX) {
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
    if(this.x + this.width > mapEndX)
      this.x = mapEndX - this.width;

    // attack
    if(
        this.bullet.cooldown <= 0 && 
        (interactor.isPressed(' ') || interactor.isPressedMouse())
      )
        this.bullet.getThrown(this.x, this.direction);

    // should redraw
    if(this.shouldRedraw) {
      this.shouldRedraw = false;
      return true;
    }
  }

  getDamaged(damage) {
    this.health -= damage;
    if(this.health <= 0) {
      this.health = 0;
      // this.isDead = true;
    }

    return damage;
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