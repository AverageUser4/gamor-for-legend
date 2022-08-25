'use strict';

  class Enemy {

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

  // images
  image;
  bulletImage;

  constructor(image, bulletImage, playerSpeed, x = 500, options) {
    this.image = image;

    this.width = image.naturalWidth;
    this.height = image.naturalHeight;

    this.x = x;
    this.y = canvasor.height - this.height;

    this.bulletImage = bulletImage;

    this.speed = Math.floor(Math.random() * (playerSpeed - 2)) + 2;
    this.distanceToKeep = Math.floor(Math.random() * 181) + 120;

    for(let key in options)
      this[key] = options[key];

    this.direction = Math.floor(Math.random() * 2) ? 'left' : 'right';

    this.bullet = new Bullet(bulletImage, this.height);

    // window.addEventListener('click', () => this.bullet.getThrown(this.x, this.direction))
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
    
    // attack
    //if(something)
      //this.attack();
    if(this.bullet.cooldown <= 0)
      this.bullet.getThrown(this.x, this.direction);

    return shouldRedraw;
  }

  attack() {

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
    if(this.direction === 'right')
      canvasor.ctx.drawImage(this.image, this.x, this.y);
    else
      canvasor.mirrorImage(this.image, this.x, this.y, true, false, translateOffsetX);

    // debug
    canvasor.ctx.strokeStyle = 'red';
    // temporary
    canvasor.ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

}