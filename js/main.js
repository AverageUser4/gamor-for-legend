'use strict';

let levelor = new Levelor({
  backgroundSrc: 'backgrounds/village.jpg',
  levelSize: 5,
});

function gameLoop() {
  if(levelor.ready)
    levelor.gameLoopIteration();
}

setInterval(() => gameLoop(), 33);
