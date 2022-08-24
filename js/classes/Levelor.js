'use strict';

class Levelor {

  // metadata
  ready = false;

  // player
  player

  // playerBullet
  playerBulletCanDamage = true;
  playerBulletCooldownMax = 36;
  playerBulletCooldown = 0;
  playerBulletSpeed = 0;
  playerBulletWidth;
  playerBulletHeight;
  playerBulletYBase = 400;
  #playerBulletY = 400;
  #playerBulletX = -1000;

  get playerBulletY() {
    return this.#playerBulletY;
  }
  set playerBulletY(y) {
    this.#playerBulletY = y;
    this.shouldRedraw = true;
  }

  get playerBulletX() {
    return this.#playerBulletX;
  }
  set playerBulletX(x) {
    this.#playerBulletX = x;
    this.shouldRedraw = true;
  }

  // drawing
  shouldRedraw = true;

  // loading
  loadIntervalId;
  needToBeLoadedCount = 0;
  backgroundImage;
  backgroundWidth;
  playerImage;
  playerBulletImage;
  enemyImages = [];
  enemyWeaponImages = [];
  loadingAttemptCount = 0;

  // background, position, etc.
  playerOffsetMoveBackgroundStart = 300;
  mapEndX;
  backgroundRepeatCount = 1;
  translateOffsetX = 0;

  // enemies
  allEnemies = [];

  constructor(options) {
    if(!Object.hasOwn(options, 'backgroundSrc'))
      throw new Error('No background source provided in options object of Levelor constuctor.');
    if(!Object.hasOwn(options, 'enemyImagesSources'))
      throw new Error('You need to provide image source for at least one enemy and its weapon');

    if(Object.hasOwn(options, 'levelSize'))
      this.backgroundRepeatCount = options.levelSize;

    canvasor.ctx = canvasor.ctx;

    this.requestImage('backgroundImage', options.backgroundSrc);
    this.requestImage('playerImage', 'characters/player.png');
    this.requestImage('playerBulletImage', 'weapons/dagger.png');
    for(let val of options.enemyImagesSources)
      this.requestEnemyAndEnemyWeaponImages(val.enemySrc, val.weaponSrc);

    this.loadIntervalId = setInterval(() => this.checkResourcesLoaded(), 100);
  }

  requestImage(propertyName, src) {
    this.needToBeLoadedCount++;
    this[propertyName] = new Image();
    this[propertyName].src = src;
    this[propertyName].addEventListener('load', 
      () => this.needToBeLoadedCount--, { once: true });
  }

  requestEnemyAndEnemyWeaponImages(enemySrc, weaponSrc) {
    this.needToBeLoadedCount += 2;

    this.enemyImages.push(new Image());
    this.enemyImages[this.enemyImages.length - 1].src = enemySrc;
    this.enemyImages[this.enemyImages.length - 1].addEventListener('load', 
      () => this.needToBeLoadedCount--, { once: true });

    this.enemyWeaponImages.push(new Image());
    this.enemyWeaponImages[this.enemyWeaponImages.length - 1].src = weaponSrc;
    this.enemyWeaponImages[this.enemyWeaponImages.length - 1].addEventListener('load', 
      () => this.needToBeLoadedCount--, { once: true });
  }

  checkResourcesLoaded() {
    this.loadingAttemptCount++;
    if(this.loadingAttemptCount >= 50)
      throw new Error('Failed to load required resources.');
    if(this.needToBeLoadedCount > 0)
      return;

    clearInterval(this.loadIntervalId);

    this.backgroundWidth = this.backgroundImage.naturalWidth;
    this.mapEndX = this.backgroundRepeatCount * this.backgroundWidth;

    let w = this.playerImage.naturalWidth;
    let h = this.playerImage.naturalHeight;
    this.player = new Player(0, canvasor.height - h, w, h, this.playerImage);

    this.playerBulletWidth = this.playerBulletImage.naturalWidth;
    this.playerBulletHeight = this.playerBulletImage.naturalHeight;
    this.playerBulletY = canvasor.height -
      this.playerBulletImage.naturalHeight - this.playerImage.naturalHeight / 2;
    this.playerBulletYBase = this.playerBulletY;
    
    w = this.enemyImages[0].naturalWidth;
    h = this.enemyImages[0].naturalHeight;
    this.allEnemies.push(new Enemy(500, canvasor.height - h, w, h, this.enemyImages[0], this.enemyWeaponImages[0]));
    this.allEnemies.push(new Enemy(600, canvasor.height - h, w, h, this.enemyImages[0], this.enemyWeaponImages[0]));

    w = this.enemyImages[1].naturalWidth;
    h = this.enemyImages[1].naturalHeight;
    this.allEnemies.push(new Enemy(700, canvasor.height - h, w, h, this.enemyImages[1], this.enemyWeaponImages[0]));
    this.allEnemies.push(new Enemy(800, canvasor.height - h, w, h, this.enemyImages[1], this.enemyWeaponImages[0]));
    this.allEnemies.push(new Enemy(900, canvasor.height - h, w, h, this.enemyImages[1], this.enemyWeaponImages[0]));

    this.shouldRedraw = true;
    this.draw();

    this.ready = true;
  }

  gameLoopIteration() {
    const playerReturnObject = this.player.logic(this.mapEndX, this.playerBulletCooldown);
    if(playerReturnObject.shouldRedraw)
      this.shouldRedraw = true;
    if(playerReturnObject.shouldAttack)
      this.playerAttack();
    
    this.cameraMovement();
    this.playerBulletLogic();

    for(let val of this.allEnemies) {
      if(val.logic(this.player.x, this.mapEndX))
        this.shouldRedraw = true;
    }

    this.draw();
  }

  draw() {
    if(!this.shouldRedraw)
      return;

    this.shouldRedraw = false;

    console.log(`X: ${this.player.x}`);

    canvasor.ctx.save();
    canvasor.ctx.translate(this.translateOffsetX, 0);

    this.drawBackground();
    this.drawUI();

    this.player.draw(this.translateOffsetX);

    for(let val of this.allEnemies) {
      val.draw(this.translateOffsetX);
    }

    this.drawPlayerBullet();

    canvasor.ctx.restore();
  }

  cameraMovement() {
    if(this.player.x < this.playerOffsetMoveBackgroundStart)
      return;

    this.translateOffsetX = -this.player.x + this.playerOffsetMoveBackgroundStart;

    const checkTranslate = this.backgroundWidth * -this.backgroundRepeatCount + canvasor.width;
    if(this.translateOffsetX < checkTranslate)
      this.translateOffsetX = checkTranslate;
  }

  playerAttack() {
    this.playerBulletCanDamage = true;
    this.playerBulletY = this.playerBulletYBase;

    this.playerBulletCooldown = this.playerBulletCooldownMax;
    this.playerBulletSpeed = this.player.speed * 3;

    this.playerBulletX = this.player.x;

    if(this.player.direction === 'left')
      this.playerBulletSpeed *= -1;
  }

  playerBulletLogic() {
    if(this.playerBulletCooldown <= 0)
      return;

    this.playerBulletX += this.playerBulletSpeed;
    this.playerBulletCooldown--;

    if(this.playerBulletCooldown <= 0) {
      this.playerBulletX = -1000;
      return;
    }

    if(!this.playerBulletCanDamage) {
      if(this.playerBulletSpeed > 0)
        this.playerBulletY += this.playerBulletSpeed * 2;
      else
        this.playerBulletY -= this.playerBulletSpeed * 2;
      return;
    }

    for(let i = 0; i < this.allEnemies.length; i++) {
      console.log(this.playerBulletX, this.playerBulletWidth, this.allEnemies[i].width)
      if(
          this.playerBulletX + this.playerBulletWidth - 35 >= this.allEnemies[i].x &&
          this.playerBulletX <= this.allEnemies[i].x + this.allEnemies[i].width 
        ) {
          this.playerBulletCanDamage = false;
          this.allEnemies[i].getDamaged(66);
          if(this.allEnemies[i].isDead)
            this.allEnemies.splice(i, 1);
          break;
        }
    }
  }

  drawBackground() {
    let x = -this.backgroundWidth;

    for(let i = 0; i < this.backgroundRepeatCount; i++) {
      x += this.backgroundWidth;

      if(
          x + this.backgroundWidth < this.player.x - this.playerOffsetMoveBackgroundStart ||
          x  > this.player.x + canvasor.width - this.playerOffsetMoveBackgroundStart
        )
          continue; 

      canvasor.ctx.drawImage(this.backgroundImage, x, 0);
    }
  }

  drawPlayerBullet() {
    if(this.playerBulletSpeed > 0)
      canvasor.ctx.drawImage(this.playerBulletImage, this.playerBulletX, this.playerBulletY);
    else if(this.playerBulletSpeed < 0)
      canvasor.mirrorImage(this.playerBulletImage, this.playerBulletX, this.playerBulletY, true, false, this.translateOffsetX);

    // debug
    canvasor.ctx.strokeStyle = 'red';
    canvasor.ctx.strokeRect(this.playerBulletX, this.playerBulletY, this.playerBulletWidth,  this.playerBulletHeight);
  }

  drawUI() {
    // background
    canvasor.ctx.fillStyle = '#523b0a';
    canvasor.ctx.fillRect(-this.translateOffsetX, 0, canvasor.width, 50);
    canvasor.ctx.fillStyle = '#402e07';
    canvasor.ctx.fillRect(-this.translateOffsetX, 50, canvasor.width, 4);

    // player image and frame
    canvasor.ctx.fillStyle = '#666';
    canvasor.ctx.fillRect(-this.translateOffsetX + 5, 6, 40, 40);

    canvasor.ctx.save();
    canvasor.ctx.scale(0.43, 0.43);
    canvasor.ctx.drawImage(this.playerImage, -this.translateOffsetX * 2.3256 + 19, 10);
    canvasor.ctx.restore();

    canvasor.ctx.lineWidth = 2;
    canvasor.ctx.strokeStyle = '#111';
    canvasor.ctx.strokeRect(-this.translateOffsetX + 5, 6, 40, 40);

    // health
    canvasor.ctx.fillStyle = 'green';
    let fillAmount = this.player.health / this.player.healthMax * 325;
    canvasor.ctx.fillRect(-this.translateOffsetX + 65, 6, fillAmount, 40);

    canvasor.ctx.fillStyle = 'red';
    canvasor.ctx.strokeRect(-this.translateOffsetX + 65, 6, 325, 40);

    canvasor.ctx.fillStyle = '#111';
    canvasor.ctx.font = '16px sans-serif';
    canvasor.ctx.fillText(`HP: ${this.player.health} / ${this.player.healthMax}`,
      -this.translateOffsetX + 75, 32);

    // fatigue
    canvasor.ctx.fillStyle = 'yellow';
    fillAmount = this.playerBulletCooldown / this.playerBulletCooldownMax * 325;
    canvasor.ctx.fillRect(-this.translateOffsetX + 410, 6, fillAmount, 40);

    canvasor.ctx.strokeRect(-this.translateOffsetX + 410, 6, 325, 40);

    canvasor.ctx.fillStyle = '#111';
    canvasor.ctx.fillText(`FP: ${this.playerBulletCooldown} / ${this.playerBulletCooldownMax}`,
      -this.translateOffsetX + 425, 32);

    // status effect
    canvasor.ctx.fillStyle = '#666';
    canvasor.ctx.fillRect(-this.translateOffsetX + 755, 6, 40, 40);
    canvasor.ctx.strokeRect(-this.translateOffsetX + 755, 6, 40, 40);
    canvasor.ctx.font = '24px sans-serif';
    canvasor.ctx.fillText('🚫', -this.translateOffsetX + 763, 35);
  }

}