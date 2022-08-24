'use strict';

let levelor = new Levelor({
  backgroundSrc: 'backgrounds/village.jpg',
  levelSize: 5,
  enemyImagesSources: [
    {
      enemySrc: 'characters/villager.png',
      weaponSrc: 'weapons/dagger.png'
    },
    {
      enemySrc: 'characters/burgher.png',
      weaponSrc: 'weapons/dagger.png'
    }, 
  ],
});

function gameLoop() {
  levelor.gameLoopIteration();
}

setInterval(() => gameLoop(), 33);