'use strict';

  class Levelor {

  // player
  playerSpeed = 7;
  playerDirection = 'right';
  playerWidth;
  playerHeight;
  #playerX = 0;
  playerY = 500;
  get playerX() {
    return this.#playerX;
  }
  set playerX(x) {
    this.#playerX = x;
    this.shouldRedraw = true;
  }

  // playerBullet
  playerBulletCooldown = 0;
  playerBulletSpeed = 0;
  playerBulletWidth;
  playerBulletHeight;
  playerBulletY = 400;
  #playerBulletX = -1000;
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

  // background, position, etc.
  mapEndX;
  backgroundRepeatCount = 5;
  translateOffsetX = 0;

  constructor(options) {
    if(!Object.hasOwn(options, 'backgroundSrc'))
      throw new Error('No background source provided in options object of Levelor constuctor.');

    if(Object.hasOwn(options, 'levelSize'))
      this.backgroundRepeatCount = options.levelSize;

    canvasor.ctx = canvasor.ctx;

    this.requestImage('backgroundImage', options.backgroundSrc);
    this.requestImage('playerImage', 'player.png');
    this.requestImage('playerBulletImage', 'dagger.png');

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

    this.shouldRedraw = true;
    this.draw();
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
    this.playerBulletCooldown = 36;
    this.playerBulletSpeed = this.playerSpeed * 3;

    if(this.playerDirection === 'right')
      this.playerBulletX = this.playerX + this.playerWidth;
    else {
      this.playerBulletX = this.playerX - this.playerBulletWidth;
      this.playerBulletSpeed *= -1;
    }
  }

  playerBulletLogic() {
    if(this.playerBulletCooldown <= 0)
      return;

    this.playerBulletX += this.playerBulletSpeed;
    this.playerBulletCooldown--;

    if(this.playerBulletCooldown <= 0)
      this.playerBulletX = -1000;
  }

  draw() {
    if(!this.shouldRedraw)
      return;

    this.shouldRedraw = false;

    console.log(`X: ${this.playerX}`);

    canvasor.ctx.save();
    canvasor.ctx.translate(this.translateOffsetX, 0);

    this.drawBackground();

    this.drawPlayer();
    
    this.drawPlayerBullet();

    canvasor.ctx.restore();
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

    canvasor.ctx.strokeStyle = 'red';
    canvasor.ctx.strokeRect(this.playerX, this.playerY, this.playerWidth, this.playerHeight);
  }

  drawPlayerBullet() {
    if(this.playerBulletSpeed > 0)
      canvasor.ctx.drawImage(this.playerBulletImage, this.playerBulletX, this.playerBulletY);
    else if(this.playerBulletSpeed < 0)
      this.mirrorImage(this.playerBulletImage, this.playerBulletX, this.playerBulletY, true);

    canvasor.ctx.strokeStyle = 'red';
    canvasor.ctx.strokeRect(this.playerBulletX, this.playerBulletY, this.playerBulletWidth,  this.playerBulletHeight);
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

  gameLoopIteration() {
    this.playerLogic();
    this.playerBulletLogic();
    this.draw();
  }

}