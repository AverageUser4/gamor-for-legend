'use strict';

const interactor = {

  pressedKeys: new Set(),

  keyDown(e) {
    this.pressedKeys.add(e.key);
  },

  keyUp(e) {
    this.pressedKeys.delete(e.key);
  },

  isPressed(key) {
    return this.pressedKeys.has(key);
  }

};

window.addEventListener('keydown', (e) => interactor.keyDown(e));
window.addEventListener('keyup', (e) => interactor.keyUp(e));