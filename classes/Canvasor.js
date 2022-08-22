'use strict';

class Canvasor {

  static {
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    const rect = this.canvas.getBoundingClientRect(); 
    this.width = rect.width;
    this.height = rect.height;

    this.updatePosition = () => {
      const rect = this.canvas.getBoundingClientRect(); 
      this.x = rect.left;
      this.y = rect.top;
      console.log(this.x, this.y);
    };

    window.addEventListener('scroll', () => this.updatePosition());
  }

}