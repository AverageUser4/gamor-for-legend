'use strict';

  class Enemy {

  ready = false;
  speed = 5;
  width;
  height;
  x = 0;
  y = 500;
  direction;
  health = 40;
  isDead = false;
  distanceToKeep = 300;
  state = 'neutral';
  fightsBack = true;
  bullet;
  damage = 10;
  image;

  constructor(kind, x, playerSpeed, options) {
    this.image = new Image();

    this.image.addEventListener('load', () => {
      this.furtherConstruction(kind, x, playerSpeed, options);
    });
    this.image.addEventListener('error', () => {
      console.error(`Couldn\'t load enemy\'s image: ${kind}`);
      this.furtherConstruction(kind, x, playerSpeed, options, true)
    });

    this.image.src = `characters/${kind}.png`;
  }

  furtherConstruction(kind, x, playerSpeed, options, error = false) {
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

    this.speed = Math.floor(Math.random() * (playerSpeed - 2)) + 2;
    this.distanceToKeep = Math.floor(Math.random() * 181) + 120;

    for(let key in options)
      this[key] = options[key];

    this.direction = Math.floor(Math.random() * 2) ? 'left' : 'right';

    this.bullet = new Bullet(kind, this.height);
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

  getDamaged(damage) {
    this.state = this.fightsBack ? 'aggressive' : 'scared';

    this.health -= damage;
    if(this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }

    return damage;
  }

  draw(translateOffsetX) {
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