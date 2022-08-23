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
  }

};

canvasor.updatePosition();
window.addEventListener('scroll', () => canvasor.updatePosition());
window.addEventListener('resize', () => canvasor.updatePosition());
