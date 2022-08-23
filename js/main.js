'use strict';

let levelor = new Levelor({
  backgroundSrc: 'village.jpg',
  levelSize: 10
});

function gameLoop() {
  levelor.gameLoopIteration();
}

setInterval(() => gameLoop(), 33);