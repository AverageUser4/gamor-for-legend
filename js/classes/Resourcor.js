'use strict';

class Resourcor {

  // resources
  backgroundImage;
  playerImage;
  playerBulletImage;
  enemyImages = [];
  enemyWeaponImages = [];

  requestImage(propertyName, src) {
    return new Promise((resolve, reject) => {
      this[propertyName] = new Image();
      this[propertyName].src = src;
      this[propertyName].addEventListener('load', 
        () => resolve(), { once: true });
      this[propertyName].addEventListener('error', 
        () => reject(src), { once: true });
    });
  }

  requestEnemyAndEnemyWeaponImages(enemySrc, weaponSrc) {
    let loadedCount = 0;

    return new Promise((resolve, reject) => {
      this.enemyImages.push(new Image());
      this.enemyImages[this.enemyImages.length - 1].src = enemySrc;

      this.enemyImages[this.enemyImages.length - 1].addEventListener('load', 
        () => {
          loadedCount++;
          if(loadedCount === 2)
            resolve();
        }, { once: true });

      this.enemyImages[this.enemyImages.length - 1].addEventListener('error',
        () => {
          reject(enemySrc);
        }, { once: true });
  
      this.enemyWeaponImages.push(new Image());
      this.enemyWeaponImages[this.enemyWeaponImages.length - 1].src = weaponSrc;

      this.enemyWeaponImages[this.enemyWeaponImages.length - 1].addEventListener('load', 
        () => {
          loadedCount++;
          if(loadedCount === 2)
            resolve();
        }, { once: true });
        
      this.enemyWeaponImages[this.enemyWeaponImages.length - 1].addEventListener('error',
        () => {
          reject(weaponSrc);
        }, { once: true });
    });
  }

}