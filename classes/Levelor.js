'use strict';

  class Levelor {

  // loading
  loadIntervalId;
  needToBeLoadedCount = 0;
  backgroundImage;
  playerImage;

  // drawing
  shouldRedraw = true;

  // background, position, etc.
  mapEndX;
  backgroundRepeatCount = 2;
  translateOffsetX = 0;

  constructor() {
    this.ctx = Canvasor.ctx;

    this.requestImage('backgroundImage', 'village.jpg');
    this.requestImage('playerImage', 'player.png');

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
    this.playerY = this.canvasHeight - this.playerImage.naturalHeight;

    this.draw();

    setInterval(() => this.gameLoop(), 33);
  }

  gameLoop() {
    this.playerLogic();

    if(this.shouldRedraw)
      this.draw();
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