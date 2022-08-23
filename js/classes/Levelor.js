'use strict';

  class Levelor {

  // player
  playerSpeed = 7;
  playerDirection = 'right';
  playerWidth;
  playerHeight;
  #playerX = 0;
  #playerY = 500;
  get playerX() {
    return this.#playerX;
  }
  set playerX(x) {
    this.#playerX = x;
    this.shouldRedraw = true;
  }

  // drawing
  shouldRedraw = true;

  // loading
  loadIntervalId;
  needToBeLoadedCount = 0;
  backgroundImage;
  playerImage;

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
    this.#playerY = canvasor.height - this.playerImage.naturalHeight;

    this.shouldRedraw = true;
    this.draw();
  }

  playerLogic() {
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
    if(this.playerDirection === 'left')
      this.mirrorImage(this.playerImage, this.playerX, this.#playerY, true);
    else
      canvasor.ctx.drawImage(this.playerImage, this.playerX, this.#playerY);

    canvasor.ctx.strokeStyle = 'red';
    canvasor.ctx.strokeRect(this.playerX, this.#playerY, this.playerImage.naturalWidth, this.playerImage.naturalHeight);
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
    this.draw();
  }

}