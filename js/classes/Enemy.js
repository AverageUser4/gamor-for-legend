'use strict';

  class Enemy {

  speed = 5;
  width;
  height;
  x = 0;
  y = 500;
  direction = 'left';
  health = 100;

  // bullet
  bulletCooldownMax = 36;
  bulletCooldown = 0;
  bulletSpeed = 0;
  bulletWidth;
  bulletHeight;
  bulletY = 400;
  bulletX = -1000;

  constructor(x, y, options) {
    this.x = x;
    this.y = y;
  }

  logic(playerX, mapEndX) {
    let returnValue = false;

    // movement
    const distance = Math.abs(this.x - playerX);
    if(distance > 300 && distance < 700) {
      if(this.x > playerX)
        this.x -= this.speed;
      else
        this.x += this.speed;

      returnValue = true;
    } else if(distance < 295) {
      if(this.x > playerX)
        this.x += this.speed;
      else
        this.x -= this.speed;

      returnValue = true;
    }

    if(this.x < 0)
      this.x = 0;
    if(this.x + this.width > mapEndX)
      this.x = mapEndX - this.width;

    // direction
    if(playerX < this.x)
      this.direction = 'left';
    else
      this.direction = 'right';
    
    // attack
    //if(something)
      //this.attack();

    return returnValue;
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

}