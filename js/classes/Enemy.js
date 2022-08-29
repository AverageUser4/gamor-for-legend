'use strict';

  class Enemy {

  width;
  height;
  direction;

  x = 0;
  y = 500;

  speed = 5;
  health = 40;
  healthMax = 40;
  level = 1;
  damage = 5;
  strength;
  defence;
  
  kind;
  state = 'neutral';
  isDead = false;
  fightsBack = true;
  distanceToKeep = 300;

  image;

  bullet;

  constructor(kind, x, options) {
    for(let key in options)
      this[key] = options[key];

    if(this.level <= 0)
      this.level = 1;

    this.damage = 5 * this.level;
    this.strength = 1 * this.level;
    this.defence = 1 * this.level;
    this.health = 40 * this.level;
    this.healthMax = this.health;

    this.image = new Image();

    this.image.addEventListener('load', () => {
      this.furtherConstruction(kind, x);
    });
    this.image.addEventListener('error', () => {
      console.error(`Couldn\'t load enemy\'s image: ${kind}`);
      this.furtherConstruction(kind, x, true)
    });

    this.kind = bases[kind];
    this.image.src = this.kind.characterSrc;
  }

  furtherConstruction(kind, x, error = false) {
    if(!error) {
      this.width = this.image.naturalWidth;
      this.height = this.image.naturalHeight;
    } else {
      this.width = bases.enemyWidth;
      this.height = bases.enemyHeight;
      this.image = null;
    }

    this.x = x;
    this.y = canvasor.height - this.height;

    this.speed = Math.floor(Math.random() * (playerStats.speed - 2)) + 2;
    this.distanceToKeep = Math.floor(Math.random() * 181) + 120;

    this.direction = Math.floor(Math.random() * 2) ? 'left' : 'right';

    this.bullet = new Bullet(kind, this.height);

    this.bullet.image.addEventListener('ready', () => {
      this.image.dispatchEvent(new Event('ready'));
    });
  }

  logic(playerX, mapEndX) {
    // definies if should redraw
    let shouldRedraw = false;

    if(this.state === 'neutral') {
      if(!Math.floor(Math.random() * 200)) {
        this.direction = this.direction === 'left' ? 'right' : 'left';
        return true;
      }
      return false;
    }

    const distance = Math.abs(this.x - playerX);

    if(this.state === 'aggressive')
      shouldRedraw = this.aggressiveLogic(playerX, distance);

    if(this.state === 'scared')
      shouldRedraw = this.scaredLogic(playerX, distance);

    if(this.x < 0)
      this.x = 0;
    if(this.x + this.width > mapEndX)
      this.x = mapEndX - this.width;

    return shouldRedraw;
  }

  scaredLogic(playerX, distance) {
    if(
        distance > 500 && playerX >= 300 ||
        distance > 800
      )
      return false;

    if(this.x > playerX) {
      this.x += this.speed;
      this.direction = 'right';
    }
    else {
      this.x -= this.speed
      this.direction = 'left'
    }

    return true;
  }

  aggressiveLogic(playerX, distance) {
    let shouldRedraw = false;

    // movement
    if(distance > this.distanceToKeep && distance < 900) {
      if(this.x > playerX)
        this.x -= this.speed;
      else
        this.x += this.speed;

      shouldRedraw = true;
    } else if(distance < this.distanceToKeep - this.speed * 2) {
      if(this.x > playerX)
        this.x += this.speed;
      else
        this.x -= this.speed;

      shouldRedraw = true;
    }

    // direction
    if(playerX < this.x)
      this.direction = 'left';
    else
      this.direction = 'right';
    
    if(
        this.bullet.cooldown <= 0 &&
        !Math.floor(Math.random() * 20)
      )
        this.bullet.getThrown(this.x, this.direction);

    return shouldRedraw;
  }

  bulletLogic() {
    if(this.bulletCooldown <= 0)
      return;

    this.bulletX += this.bulletSpeed;
    this.bulletCooldown--;

    if(this.bulletCooldown <= 0)
      this.bulletX = -1000;
  }

  dealDamage() {
    const min = this.damage / 2;
    const max = this.damage * 2;
    return Math.floor(Math.random() * max) + min;
  }

  getDamaged(damage) {
    this.state = this.fightsBack ? 'aggressive' : 'scared';

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
    // name and level
    canvasor.ctx.font = 'bold 12px sans-serif';

    const textWidth = canvasor.ctx.measureText(`${this.kind.name}, poziom ${this.level}`).width;
    const textX = this.x + this.width / 2 - textWidth / 2;

    canvasor.ctx.strokeStyle = 'black';
    canvasor.ctx.strokeText(`${this.kind.name}, poziom ${this.level}`, textX, this.y - 16);
    canvasor.ctx.fillStyle = colors.red;
    canvasor.ctx.fillText(`${this.kind.name}, poziom ${this.level}`, textX, this.y - 16);

    // health bar
    canvasor.ctx.strokeStyle = 'black';
    canvasor.ctx.strokeRect(this.x - 1, this.y - 9, this.width + 2, 6);

    canvasor.ctx.fillStyle = '#222';
    canvasor.ctx.fillRect(this.x, this.y - 8, this.width, 4);

    canvasor.ctx.fillStyle = colors.green;
    canvasor.ctx.fillRect(this.x, this.y - 8, this.width * (this.health / this.healthMax), 4);

    if(!this.image) {
      canvasor.ctx.fillStyle = 'red';
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