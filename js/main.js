'use strict';

let levelor = new Levelor();

function gameLoop() {
  if(levelor.ready)
    levelor.gameLoopIteration();
}

setInterval(() => gameLoop(), 33);

/*
  - game loop starts without checking wheter enemies and their bullets
  are ready, this may cause some issues
  - puting all resources to one object and starting the game when it 
  loads them seems like a good idea (there won't be to many)
  - entire game can be procedurally generated (great idea)
*/