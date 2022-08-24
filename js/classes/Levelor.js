'use strict';

class Levelor {

  // player
  playerHealthMax = 100;
  playerHealth = 90;
  playerSpeed = 7;
  playerWidth;
  playerHeight;
  #playerX = 0;
  playerY = 500;
  #playerDirection = 'right';

  get playerDirection() {
    return this.#playerDirection;
  }
  set playerDirection(direction) {
    this.#playerDirection = direction;
    this.shouldRedraw = true;
  }

  get playerX() {
    return this.#playerX;
  }
  set playerX(x) {
    this.#playerX = x;
    this.shouldRedraw = true;
  }

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
  playerImage;
  playerBulletImage;
  enemyImage;

  // background, position, etc.
  mapEndX;
  backgroundRepeatCount = 1;
  translateOffsetX = 0;

  // enemies
  enemyWidth;
  enemyHeight;
  allEnemies = [];

  constructor(options) {
    if(!Object.hasOwn(options, 'backgroundSrc'))
      throw new Error('No background source provided in options object of Levelor constuctor.');

    if(Object.hasOwn(options, 'levelSize'))
      this.backgroundRepeatCount = options.levelSize;

    canvasor.ctx = canvasor.ctx;

    this.requestImage('backgroundImage', options.backgroundSrc);
    this.requestImage('playerImage', 'characters/player.png');
    this.requestImage('playerBulletImage', 'weapons/dagger.png');
    this.requestImage('enemyImage', 'characters/burgher.png');

    this.loadIntervalId = setInterval(() => this.checkResourcesLoaded(), 100);
  }

  requestImage(propertyName, src) {
    this.needToBeLoadedCount++;
    this[propertyName] = new Image();
    this[propertyName].src = src;
    this[propertyName].addEventListener('load', 
      () => this.needToBeLoadedCount--, { once: true });
  }

  checkResourcesLoaded() {
    if(this.needToBeLoadedCount > 0)
      return;

    clearInterval(this.loadIntervalId);

    this.mapEndX = this.backgroundRepeatCount * this.backgroundImage.naturalWidth;

    this.playerWidth = this.playerImage.naturalWidth;
    this.playerHeight = this.playerImage.naturalHeight;
    this.playerY = canvasor.height - this.playerImage.naturalHeight;

    this.playerBulletWidth = this.playerBulletImage.naturalWidth;
    this.playerBulletHeight = this.playerBulletImage.naturalHeight;
    this.playerBulletY = canvasor.height -
      this.playerBulletImage.naturalHeight - this.playerImage.naturalHeight / 2;
    this.playerBulletYBase = this.playerBulletY;
    
    this.enemyWidth = this.enemyImage.naturalWidth;
    this.enemyHeight = this.enemyImage.naturalHeight;
    this.allEnemies.push(new Enemy(500, canvasor.height - this.enemyHeight, this.enemyWidth, this.enemyHeight));
    this.allEnemies.push(new Enemy(600, canvasor.height - this.enemyHeight, this.enemyWidth, this.enemyHeight));
    this.allEnemies.push(new Enemy(700, canvasor.height - this.enemyHeight, this.enemyWidth, this.enemyHeight));
    this.allEnemies.push(new Enemy(800, canvasor.height - this.enemyHeight, this.enemyWidth, this.enemyHeight));
    this.allEnemies.push(new Enemy(900, canvasor.height - this.enemyHeight, this.enemyWidth, this.enemyHeight));

    this.shouldRedraw = true;
    this.draw();
  }

  gameLoopIteration() {
    this.playerLogic();
    this.playerBulletLogic();

    for(let val of this.allEnemies) {
      if(val.logic(this.playerX, this.mapEndX))
        this.shouldRedraw = true;
    }

    this.draw();
  }

  draw() {
    if(!this.shouldRedraw)
      return;

    this.shouldRedraw = false;

    console.log(`X: ${this.playerX}`);

    canvasor.ctx.save();
    canvasor.ctx.translate(this.translateOffsetX, 0);

    this.drawBackground();
    this.drawUI();

    this.drawPlayer();

    for(let val of this.allEnemies) {
      this.drawEnemy(val);
    }

    this.drawPlayerBullet();

    canvasor.ctx.restore();
  }

  playerLogic() {
    // movement
    if(interactor.isPressed('a') || interactor.isPressed('ArrowLeft')) {
      this.playerX -= this.playerSpeed;
      this.playerDirection = 'left';
    }

    if(interactor.isPressed('d') || interactor.isPressed('ArrowRight')) {
      this.playerX += this.playerSpeed;
      this.playerDirection = 'right';
    }

    if(interactor.isPressed('s') || interactor.isPressed('ArrowDown'))
      this.playerDirection = 'right';
    if(interactor.isPressed('w') || interactor.isPressed('ArrowUp'))
      this.playerDirection = 'left';

    if(this.playerX < 0)
      this.playerX = 0;
    if(this.playerX + this.playerWidth > this.mapEndX)
      this.playerX = this.mapEndX - this.playerWidth;


    // camera movement
    if(this.playerX >= 300) {
      this.translateOffsetX = -this.playerX + 300;

      const checkTranslate = this.backgroundImage.naturalWidth * -this.backgroundRepeatCount + 800;
      if(this.translateOffsetX < checkTranslate)
        this.translateOffsetX = checkTranslate;
    }


    // attack
    if(
        this.playerBulletCooldown <= 0 && 
        (interactor.isPressed(' ') || interactor.isPressedMouse())
      )
        this.playerAttack();
  }

  playerAttack() {
    this.playerBulletCanDamage = true;
    this.playerBulletY = this.playerBulletYBase;

    this.playerBulletCooldown = this.playerBulletCooldownMax;
    this.playerBulletSpeed = this.playerSpeed * 3;

    this.playerBulletX = this.playerX;

    if(this.playerDirection === 'left')
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
      this.playerBulletY += this.playerBulletSpeed * 2;
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
    let x = 0;

    for(let i = 0; i < this.backgroundRepeatCount; i++) {
      canvasor.ctx.drawImage(this.backgroundImage, x, 0);
      x += this.backgroundImage.naturalWidth;
    }
  }

  drawPlayer() {
    if(this.playerDirection === 'right')
      canvasor.ctx.drawImage(this.playerImage, this.playerX, this.playerY);
    else
      this.mirrorImage(this.playerImage, this.playerX, this.playerY, true);      

    // debug
    canvasor.ctx.strokeStyle = 'red';
    canvasor.ctx.strokeRect(this.playerX, this.playerY, this.playerWidth, this.playerHeight);
  }

  drawPlayerBullet() {
    if(this.playerBulletSpeed > 0)
      canvasor.ctx.drawImage(this.playerBulletImage, this.playerBulletX, this.playerBulletY);
    else if(this.playerBulletSpeed < 0)
      this.mirrorImage(this.playerBulletImage, this.playerBulletX, this.playerBulletY, true);

    // debug
    canvasor.ctx.strokeStyle = 'red';
    canvasor.ctx.strokeRect(this.playerBulletX, this.playerBulletY, this.playerBulletWidth,  this.playerBulletHeight);
  }

  drawEnemy(enemy) {
    if(enemy.direction === 'right')
      canvasor.ctx.drawImage(this.enemyImage, enemy.x, enemy.y);
    else
      this.mirrorImage(this.enemyImage, enemy.x, enemy.y, true);      

    canvasor.ctx.fillStyle = 'red';
    canvasor.ctx.fillText(`-${enemy.damageTaken}`, enemy.x, enemy.damageTakenY);

    // debug
    canvasor.ctx.strokeStyle = 'red';
    // temporary
    canvasor.ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
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
    let fillAmount = this.playerHealth / this.playerHealthMax * 325;
    canvasor.ctx.fillRect(-this.translateOffsetX + 65, 6, fillAmount, 40);

    canvasor.ctx.fillStyle = 'red';
    canvasor.ctx.strokeRect(-this.translateOffsetX + 65, 6, 325, 40);

    canvasor.ctx.fillStyle = '#111';
    canvasor.ctx.font = '16px sans-serif';
    canvasor.ctx.fillText(`HP: ${this.playerHealth} / ${this.playerHealthMax}`,
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

  mirrorImage(image, x = 0, y = 0, horizontal = false, vertical = false) {
    /*! https://stackoverflow.com/questions/3129099/how-to-flip-images-horizontally-with-html5 */
    canvasor.ctx.save();
    canvasor.ctx.setTransform(
        horizontal ? -1 : 1, 0,
        0, vertical ? -1 : 1,
        x + (horizontal ? image.width : 0),
        y + (vertical ? image.height : 0)
    );
    canvasor.ctx.drawImage(image, -this.translateOffsetX, 0);
    canvasor.ctx.restore();
  }

}