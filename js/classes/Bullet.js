'use strict';

class Bullet {

  canDamage = true;
  cooldownMax = 36;
  cooldown = 0;
  cooldownStep = 1;
  speedBase = 21;
  speed = 0;
  width;
  height;
  yBase = 400;
  #y = 400;
  #x = -1000;
  shouldRedraw = false;
  image;

  get y() {
    return this.#y;
  }
  set y(y) {
    this.#y = y;
    this.shouldRedraw = true;
  }

  get x() {
    return this.#x;
  }
  set x(x) {
    this.#x = x;
    this.shouldRedraw = true;
  }

  constructor(kind, ownerHeight, ownerEndurance = 1) {
    this.cooldownMax = 36 * ownerEndurance;
    this.cooldownStep = ownerEndurance;

    this.image = new Image();

    this.image.addEventListener('load', () => {
      this.furtherConstruction(ownerHeight);
    });
    this.image.addEventListener('error', () => {
      console.error(`Couldn\'t load weapon image: ${kind}`);
      this.furtherConstruction(ownerHeight, true)
    });

    this.image.src = bases[kind].bulletSrc;
  }

  furtherConstruction(ownerHeight, error = false) {
    if(!error) {
      this.width = this.image.naturalWidth;
      this.height = this.image.naturalHeight;
    } else {
      this.width = bases.bulletWidth;
      this.height = bases.bulletHeight;
      this.image = null;
    }

    this.x = -1000;
    this.y = canvasor.height - this.height - ownerHeight / 2;
    this.yBase = this.y;

    this.image.dispatchEvent(new Event('ready'));
  }

  getThrown(throwerX, throwerDirection) {
    this.canDamage = true;
    this.y = this.yBase;

    this.cooldown = this.cooldownMax;

    this.x = throwerX;
    this.speed = this.speedBase;

    if(throwerDirection === 'left')
      this.speed *= -1;
  }

  logic(allTargets) {
    const returnObject = { shouldRedraw: false };

    if(this.cooldown <= 0)
      return returnObject;

    this.x += this.speed;
    this.cooldown -= this.cooldownStep;

    if(this.cooldown < this.cooldownMax * 0.2)
      this.canDamage = false;

    if(this.cooldown <= 0) {
      this.x = -1000;
      return { shouldRedraw: true };
    }

    if(!this.canDamage) {
      if(this.speed > 0)
        this.y += this.speed;
      else
        this.y -= this.speed;
      return { shouldRedraw: true };
    }

    for(let i = 0; i < allTargets.length; i++) {
      if(
          this.x + this.width - 35 >= allTargets[i].x &&
          this.x <= allTargets[i].x + allTargets[i].width 
        ) {
          this.canDamage = false;
          returnObject.i = i;
          break;
        }
    }

    if(this.shouldRedraw) {
      this.shouldRedraw = false;
      returnObject.shouldRedraw = true;
    }
    return returnObject;
  }

  draw(translateOffsetX) {
    if(!this.image) {
      canvasor.ctx.fillStyle = 'yellow';
      canvasor.ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    if(this.speed > 0)
      canvasor.ctx.drawImage(this.image, this.x, this.y);
    else if(this.speed < 0)
      canvasor.mirrorImage(this.image, this.x, this.y, true, false, translateOffsetX);

    if(debugor.debug) {
      canvasor.ctx.strokeStyle = 'red';
      canvasor.ctx.strokeRect(this.x, this.y, this.width,  this.height);
    }
  }

}