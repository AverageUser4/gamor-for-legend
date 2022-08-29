'use strict';

class Player {

  class = 'warrior';

  speed = 7;
  healthMax;
  health;
  damage;
  strength;
  defence;
  endurance;
  dexterity;
  
  #x = 0;
  y = 500;
  #direction = 'right';

  width;
  height;
  
  image;
  bullet;

  isDead = false;

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

  constructor(startOnEnd, mapEndX) {
    for(let key in playerStats)
      this[key] = playerStats[key];

    this.healthMax = this.health;

    this.image = new Image();

    this.image.addEventListener('load', () => {
      this.furtherConstruction(startOnEnd, mapEndX);
    });
    this.image.addEventListener('error', () => {
      console.error(`Couldn\'t load player\'s image: ${this.class}`);
      this.furtherConstruction(startOnEnd, mapEndX, true);
    });

    this.image.src = bases[this.class].characterSrc;
  }

  furtherConstruction(startOnEnd, mapEndX, error = false) {
    if(!error) {
      this.width = this.image.naturalWidth;
      this.height = this.image.naturalHeight;
    } else {
      this.width = bases.playerWidth;
      this.height = bases.playerHeight;
      this.image = null;
    }

    if(startOnEnd) {
      this.direction = 'left';
      this.x = mapEndX - this.width;
    }

    this.y = canvasor.height - this.height;

    this.bullet = new Bullet(this.class, this.height, this.endurance);

    this.bullet.image.addEventListener('ready', () => {
      this.image.dispatchEvent(new Event('ready'));
    });
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
        !this.isDead &&
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

  getResurrected() {
    this.health = this.healthMax;
    this.isDead = false;
  }

  dealDamage() {
    const min = this.damage / 2;
    const max = this.damage * 2;
    return Math.floor(Math.random() * max) + min;
  }

  getDamaged(damage) {
    damage = Math.round(damage - this.defence);

    if(damage < 0)
      damage = 0;

    this.health -= damage;

    if(this.health <= 0) {
      this.health = 0;
        this.isDead = true;
    }

    return damage;
  }

  draw(translateOffsetX) {
    if(this.isDead) {
      canvasor.ctx.globalAlpha = 0.5;
    }

    if(!this.image) {
      canvasor.ctx.fillStyle = 'green';
      canvasor.ctx.fillRect(this.x, this.y, this.width, this.height);
      canvasor.ctx.globalAlpha = 1;
      return;
    }

    if(this.direction === 'right')
      canvasor.ctx.drawImage(this.image, this.x, this.y);
    else
      canvasor.mirrorImage(this.image, this.x, this.y, true, false, translateOffsetX);      

    if(debugor.debug) {
      canvasor.ctx.strokeStyle = 'red';
      canvasor.ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    canvasor.ctx.globalAlpha = 1;
  }

}