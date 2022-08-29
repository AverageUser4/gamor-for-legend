'use strict';

class Player {

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

  // - base damage
  // - strength
  // - defence
  // - endurance
  // - dexterity

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
    for(let key in playerStats)
      this[key] = playerStats[key];

    this.healthMax = this.health;

    this.image = new Image();

    this.image.addEventListener('load', () => {
      this.furtherConstruction(kind);
    });
    this.image.addEventListener('error', () => {
      console.error(`Couldn\'t load player\'s image: ${kind}`);
      this.furtherConstruction(kind, true);
    });

    this.image.src = bases[kind].characterSrc;
  }

  furtherConstruction(kind, error = false) {
    if(!error) {
      this.width = this.image.naturalWidth;
      this.height = this.image.naturalHeight;
    } else {
      this.width = bases.playerWidth;
      this.height = bases.playerHeight;
      this.image = null;
    }

    this.x = 0;
    this.y = canvasor.height - this.height;

    this.bullet = new Bullet(kind, this.height, this.endurance);

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
      // this.isDead = true;
    }

    return damage;
  }

  draw(translateOffsetX) {
    if(!this.image) {
      canvasor.ctx.fillStyle = 'green';
      canvasor.ctx.fillRect(this.x, this.y, this.width, this.height);
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
  }

}