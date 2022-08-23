'use strict';

let levelor = new Levelor({
  backgroundSrc: 'dungeon.jpg',
  levelSize: 10
});

function gameLoop() {
  levelor.gameLoopIteration();
}

setInterval(() => gameLoop(), 33);