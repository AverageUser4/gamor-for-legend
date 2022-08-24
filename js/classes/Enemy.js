'use strict';

  class Enemy {

  speed = 5;
  width;
  height;
  x = 0;
  y = 500;
  direction = 'left';
  health = 100;
  isDead = false;
  spawnOriginX;
  distanceToKeep = 300;

  // bullet
  bulletCooldownMax = 36;
  bulletCooldown = 0;
  bulletSpeed = 0;
  bulletWidth;
  bulletHeight;
  bulletY = 400;
  bulletX = -1000;

  // taken damage
  damageTaken = 34;
  damageTakenY = 480;

  // images
  image;
  weaponImage;

  constructor(x, y, width, height, image, weaponImage) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.spawnOriginX = x;

    this.image = image;
    this.weaponImage = weaponImage;

    this.speed = Math.floor(Math.random() * 6) + 1;
    this.distanceToKeep = Math.floor(Math.random() * 201) + 200;
  }

  logic(playerX, mapEndX) {
    let returnValue = false;

    // movement
    const distance = Math.abs(this.x - playerX);
    if(distance > this.distanceToKeep && distance < 900) {
      if(this.x > playerX)
        this.x -= this.speed;
      else
        this.x += this.speed;

      returnValue = true;
    } else if(distance < this.distanceToKeep - this.speed) {
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

  getDamaged(damage) {
    this.health -= damage;
    if(this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }

}