'use strict';

const canvas = document.querySelector('canvas');

const canvasor = {

  canvas: canvas,
  ctx: canvas.getContext('2d'),

  width: canvas.getBoundingClientRect().width,
  height: canvas.getBoundingClientRect().height,

  updatePosition() {
    this.x = this.canvas.getBoundingClientRect().left;
    this.y = this.canvas.getBoundingClientRect().top;
  },

  mirrorImage(image, x = 0, y = 0, horizontal = false, vertical = false, translateOffsetX) {
    /*! https://stackoverflow.com/questions/3129099/how-to-flip-images-horizontally-with-html5 */
    canvasor.ctx.save();
    canvasor.ctx.setTransform(
        horizontal ? -1 : 1, 0,
        0, vertical ? -1 : 1,
        x + (horizontal ? image.width : 0),
        y + (vertical ? image.height : 0)
    );
    canvasor.ctx.drawImage(image, -translateOffsetX, 0);
    canvasor.ctx.restore();
  }

};

canvasor.updatePosition();
window.addEventListener('scroll', () => canvasor.updatePosition());
window.addEventListener('resize', () => canvasor.updatePosition());
