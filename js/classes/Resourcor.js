'use strict';

class Resourcor {

  // loading
  loadIntervalId;
  needToBeLoadedCount = 0;
  loadingAttemptCount = 0;

  // resources
  backgroundImage;
  playerImage;
  playerBulletImage;
  enemyImages = [];
  enemyWeaponImages = [];

  // levelor object
  levelor;

  constructor(levelor) {
    this.levelor = levelor;

    this.loadIntervalId = setInterval(() => this.checkResourcesLoaded(), 100);
  }

  requestImage(propertyName, src) {
    this.needToBeLoadedCount++;
    this[propertyName] = new Image();
    this[propertyName].src = src;
    this[propertyName].addEventListener('load', 
      () => this.needToBeLoadedCount--, { once: true });
  }

  requestEnemyAndEnemyWeaponImages(enemySrc, weaponSrc) {
    this.needToBeLoadedCount += 2;

    this.enemyImages.push(new Image());
    this.enemyImages[this.enemyImages.length - 1].src = enemySrc;
    this.enemyImages[this.enemyImages.length - 1].addEventListener('load', 
      () => this.needToBeLoadedCount--, { once: true });

    this.enemyWeaponImages.push(new Image());
    this.enemyWeaponImages[this.enemyWeaponImages.length - 1].src = weaponSrc;
    this.enemyWeaponImages[this.enemyWeaponImages.length - 1].addEventListener('load', 
      () => this.needToBeLoadedCount--, { once: true });
  }

  checkResourcesLoaded() {
    this.loadingAttemptCount++;
    if(this.loadingAttemptCount >= 50)
      throw new Error('Failed to load required resources.');

    if(this.needToBeLoadedCount > 0)
      return;

    clearInterval(this.loadIntervalId);

    this.levelor.backgroundWidth = this.backgroundImage.naturalWidth;
    this.levelor.mapEndX = this.levelor.backgroundRepeatCount * this.levelor.backgroundWidth;

    let w = this.playerImage.naturalWidth;
    let h = this.playerImage.naturalHeight;
    this.levelor.player = new Player(0, canvasor.height - h, w, h, this.playerImage);

    w = this.playerBulletImage.naturalWidth;
    h = this.playerBulletImage.naturalHeight;
    const y = canvasor.height - h - this.playerImage.naturalHeight / 2;
    this.levelor.playerBullet = new Bullet(-1000, y, w, h, this.playerBulletImage);
    
    w = this.enemyImages[0].naturalWidth;
    h = this.enemyImages[0].naturalHeight;
    this.levelor.allEnemies.push(new Enemy(500, canvasor.height - h, w, h, this.enemyImages[0], this.enemyWeaponImages[0]));
    this.levelor.allEnemies.push(new Enemy(600, canvasor.height - h, w, h, this.enemyImages[0], this.enemyWeaponImages[0]));

    w = this.enemyImages[1].naturalWidth;
    h = this.enemyImages[1].naturalHeight;
    this.levelor.allEnemies.push(new Enemy(700, canvasor.height - h, w, h, this.enemyImages[1], this.enemyWeaponImages[0]));
    this.levelor.allEnemies.push(new Enemy(800, canvasor.height - h, w, h, this.enemyImages[1], this.enemyWeaponImages[0]));
    this.levelor.allEnemies.push(new Enemy(900, canvasor.height - h, w, h, this.enemyImages[1], this.enemyWeaponImages[0]));

    this.levelor.shouldRedraw = true;
    this.levelor.draw();

    this.levelor.ready = true;
  }

}