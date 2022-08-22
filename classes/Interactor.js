'use strict';

class Interactor {

  static {
    this.pressedKeys = new Set();
  
    window.addEventListener('keydown', (e) => this.keyDown(e));
    window.addEventListener('keyup', (e) => this.keyUp(e));
  
    this.keyDown = (e) => {
      this.pressedKeys.add(e.key);
    }
  
    this.keyUp = (e) => {
      this.pressedKeys.delete(e.key);
    }

    this.isPressed = (key) => {
      return this.pressedKeys.has(key);
    }
  }

}