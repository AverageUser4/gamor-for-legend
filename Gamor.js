'use strict';

  class Gamor {

  // drawing
  canvas;
  ctx;
  backgroundImage;
  playerImage;
  shouldRedraw = true;

  // stats and info
  playerX = 0;
  playerY = 500;
  playerSpeed = 7;
  playerDirection = 'right';

  // input / output
  pressedKeys = new Set();

  /*
    mapLength - how many times background should be repeated
  */

  constructor() {
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.backgroundImage = new Image();
    this.backgroundImage.src = 'village.jpg';
    this.backgroundImage.addEventListener('load', () => this.draw(), { once: true });

    this.playerImage = new Image();
    this.playerImage.src = 'player.png';
    this.playerImage.addEventListener('load', () => this.draw(), { once: true });

    setInterval(() => this.gameLoop(), 33);

    // canvas has to have tabindex set
    this.canvas.addEventListener('keydown', (e) => this.keyDown(e));
    this.canvas.addEventListener('keyup', (e) => this.keyUp(e));
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
  }

  draw() {
    this.ctx.drawImage(this.backgroundImage, 0, 0);

    if(this.playerDirection === 'left')
      this.mirrorImage(this.playerImage, this.playerX, this.playerY, true);
    else
      this.ctx.drawImage(this.playerImage, this.playerX, this.playerY);

    this.shouldRedraw = false;
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
    this.ctx.drawImage(image, 0, 0);
    this.ctx.restore();
  }

}