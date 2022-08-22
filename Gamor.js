'use strict';

  class Gamor {

  // loading
  loadIntervalId;
  needToBeLoadedCount = 0;

  // drawing
  canvas;
  ctx;
  backgroundImage;
  playerImage;
  shouldRedraw = true;
  canvasWidth = 800;
  canvasHeight = 600;

  // stats and info
  playerX = 0;
  playerY = 500;
  playerSpeed = 7;
  playerDirection = 'right';
  playerWidth;
  playerHeight;

  // input / output
  pressedKeys = new Set();

  // background, position, etc.
  mapEndX;
  backgroundRepeatCount = 2;
  translateOffsetX = 0;

  constructor() {
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.requestImage('backgroundImage', 'village.jpg');
    this.requestImage('playerImage', 'player.png');

    this.loadIntervalId = setInterval(() => this.checkResourcesLoaded(), 100);

    setInterval(() => this.gameLoop(), 33);

    window.addEventListener('keydown', (e) => this.keyDown(e));
    window.addEventListener('keyup', (e) => this.keyUp(e));
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
    this.playerY = this.canvasHeight - this.playerImage.naturalHeight;

    this.draw();
  }

  gameLoop() {
    this.playerLogic();

    if(this.shouldRedraw)
      this.draw();
  }

  playerLogic() {
    if(this.pressedKeys.has('a') || this.pressedKeys.has('ArrowLeft')) {
      this.playerX -= this.playerSpeed;
      this.shouldRedraw = true;
      this.playerDirection = 'left';
    }

    if(this.pressedKeys.has('d') || this.pressedKeys.has('ArrowRight')) {
      this.playerX += this.playerSpeed;
      this.shouldRedraw = true;
      this.playerDirection = 'right';
    }


    if(this.playerX < 0)
      this.playerX = 0;
    if(this.playerX + this.playerWidth > this.mapEndX)
      this.playerX = this.mapEndX - this.playerWidth;


    // camera movement
    if(this.playerX >= 300)
      this.translateOffsetX = -this.playerX + 300;

    const checkTranslate = this.backgroundImage.naturalWidth * -this.backgroundRepeatCount + 800;
    if(this.translateOffsetX < checkTranslate)
      this.translateOffsetX = checkTranslate;
  }

  draw() {
    console.log(`X: ${this.playerX}`);

    this.ctx.save();
    this.ctx.translate(this.translateOffsetX, 0);

    this.drawBackground();

    this.drawPlayer();
    
    this.ctx.restore();

    this.shouldRedraw = false;
  }

  drawBackground() {
    let x = 0;

    for(let i = 0; i < this.backgroundRepeatCount; i++) {
      this.ctx.drawImage(this.backgroundImage, x, 0);
      x += this.backgroundImage.naturalWidth;
    }
  }

  drawPlayer() {
    if(this.playerDirection === 'left')
      this.mirrorImage(this.playerImage, this.playerX, this.playerY, true);
    else
      this.ctx.drawImage(this.playerImage, this.playerX, this.playerY);

    this.ctx.strokeStyle = 'red';
    this.ctx.strokeRect(this.playerX, this.playerY, this.playerImage.naturalWidth, this.playerImage.naturalHeight);
  }
  

  keyDown(e) {
    this.pressedKeys.add(e.key);
  }

  keyUp(e) {
    this.pressedKeys.delete(e.key);
  }

  mirrorImage(image, x = 0, y = 0, horizontal = false, vertical = false) {
    /*! https://stackoverflow.com/questions/3129099/how-to-flip-images-horizontally-with-html5 */
    this.ctx.save();
    this.ctx.setTransform(
        horizontal ? -1 : 1, 0,
        0, vertical ? -1 : 1,
        x + (horizontal ? image.width : 0),
        y + (vertical ? image.height : 0)
    );
    this.ctx.drawImage(image, -this.translateOffsetX, 0);
    this.ctx.restore();
  }

}