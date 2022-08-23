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
  },

  pressedMouseButtons: new Set(),
  removeMouseButtonTimeoutId: 'gdsgsd',

  mouseDown(e) {
    clearTimeout(this.removeMouseButtonTimeoutId);
    this.pressedMouseButtons.add(e.button);
  },

  mouseUp(e) {
    clearTimeout(this.removeMouseButtonTimeoutId);
    this.removeMouseButtonTimeoutId = setTimeout(
      () => {
        this.pressedMouseButtons.delete(e.button);
      }, 50
    );
  },

  isPressedMouse(button = 0) {
    return this.pressedMouseButtons.has(button);
  }

};

window.addEventListener('keydown', (e) => interactor.keyDown(e));
window.addEventListener('keyup', (e) => interactor.keyUp(e));
window.addEventListener('mousedown', (e) => interactor.mouseDown(e));
window.addEventListener('mouseup', (e) => interactor.mouseUp(e));