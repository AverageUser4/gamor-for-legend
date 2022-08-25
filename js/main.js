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
  if(levelor.ready)
    levelor.gameLoopIteration();
}

setInterval(() => gameLoop(), 33);

// enemy can die, that will cause issue with flying bullet
// when player is moving or enemy is too far away the bullet is bugged