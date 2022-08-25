'use strict';

class Levelor {

  // loading
  resourcor;
  promiseArray = [];

  // metadata
  ready = false;

  // player
  player

  // drawing
  shouldRedraw = true;

  // background, position, etc.
  backgroundWidth;
  backgroundRepeatCount = 1;
  mapEndX;
  translateOffsetX = 0;
  playerOffsetMoveBackgroundStart = 300;

  // enemies
  enemyKinds = [];
  allEnemies = [];

  // damages taken
  allDamagesTaken = [];

  constructor(options) {
    if(!Object.hasOwn(options, 'backgroundSrc'))
      throw new Error('No background source provided in options object of Levelor constuctor.');
    if(!Object.hasOwn(options, 'enemyImagesSources'))
      throw new Error('You need to provide image source for at least one enemy and its weapon');

    if(Object.hasOwn(options, 'levelSize'))
      this.backgroundRepeatCount = options.levelSize;

    this.resourcor = new Resourcor();

    this.promiseArray.push(this.resourcor.requestImage('backgroundImage', options.backgroundSrc));
    this.promiseArray.push(this.resourcor.requestImage('playerImage', 'characters/player.png'));
    this.promiseArray.push(this.resourcor.requestImage('playerBulletImage', 'weapons/dagger.png'));
    for(let val of options.enemyImagesSources)
      this.promiseArray.push(this.resourcor.requestEnemyAndEnemyWeaponImages(val.enemySrc, val.weaponSrc));

    Promise.all(this.promiseArray)
      .then(() => this.onAllLoaded())
      .catch((src) => {
        // it can catch error in onAllLoaded()
        throw new Error(`Unable to load image: ${src}`);
      });
  }

  onAllLoaded() {
    this.backgroundWidth = this.resourcor.backgroundImage.naturalWidth;
    this.mapEndX = this.backgroundRepeatCount * this.backgroundWidth;

    this.player = new Player(this.resourcor.playerImage, this.resourcor.playerBulletImage);
    
    for(let i = 0; i < this.resourcor.enemyImages.length; i++) {
      let w = this.resourcor.enemyImages[i].naturalWidth;
      let h = this.resourcor.enemyImages[i].naturalHeight;
      this.enemyKinds.push({ 
        image: this.resourcor.enemyImages[i],
        bulletImage: this.resourcor.enemyWeaponImages[i],
        width: w,
        height: h
      });
    }
    
    for(let i = 0; i < 5; i++)
      this.spawnEnemy();

    this.shouldRedraw = true;
    this.draw();

    this.ready = true;
  }

  spawnEnemy(enemyKindIndex, x = 500) {
    if(typeof enemyKindIndex === 'undefined')
      enemyKindIndex = Math.floor(Math.random() * this.enemyKinds.length);

    const kind = this.enemyKinds[enemyKindIndex];

    this.allEnemies.push(new Enemy(kind.image, kind.bulletImage, this.player.speed, x));    
  }

  gameLoopIteration() {
    let returnObject = this.player.logic(this.mapEndX, this.player.bullet.cooldown);
    if(returnObject.shouldRedraw)
      this.shouldRedraw = true;
    if(returnObject.shouldAttack)
      this.player.bullet.getThrown(this.player.x, this.player.direction);
    
    this.cameraMovement();

    returnObject = this.player.bullet.logic(this.allEnemies);
    if(returnObject.shouldRedraw)
      this.shouldRedraw = true;
    if(Object.hasOwn(returnObject, 'i')) {
      const i = returnObject.i;

      const dealt = this.allEnemies[i].getDamaged(this.player.damage);

      this.allDamagesTaken.push(
        new HealOrDamage('damage', this.allEnemies[i].x, this.allEnemies[i].y, dealt));

      if(this.allEnemies[i].isDead)
        this.allEnemies.splice(i, 1);
    }

    for(let val of this.allEnemies)
      if(val.logic(this.player.x, this.mapEndX))
        this.shouldRedraw = true;

    const toBeSpliced = [];
    for(let val of this.allDamagesTaken) {
      val.logic();
      this.shouldRedraw = true;
      if(val.opacity === 0)
        toBeSpliced.push(val);
    }

    for(let val of toBeSpliced)
      this.allDamagesTaken.splice(this.allDamagesTaken.indexOf(val), 1);

    this.draw();
  }

  draw() {
    if(!this.shouldRedraw)
      return;

    this.shouldRedraw = false;

    console.log(`X: ${this.player.x}`);

    canvasor.ctx.save();
    canvasor.ctx.translate(this.translateOffsetX, 0);

    this.drawBackground();
    this.drawUI();

    this.player.draw(this.translateOffsetX);

    for(let val of this.allEnemies)
      val.draw(this.translateOffsetX);

    this.player.bullet.draw(this.translateOffsetX);

    for(let val of this.allDamagesTaken)
      val.draw(); 

    canvasor.ctx.restore();
  }

  drawBackground() {
    let x = -this.backgroundWidth;

    for(let i = 0; i < this.backgroundRepeatCount; i++) {
      x += this.backgroundWidth;

      if(
          x + this.backgroundWidth < this.player.x - this.playerOffsetMoveBackgroundStart ||
          x  > this.player.x + canvasor.width - this.playerOffsetMoveBackgroundStart
        )
          continue; 

      canvasor.ctx.drawImage(this.resourcor.backgroundImage, x, 0);
    }
  }

  drawUI() {
    // background
    canvasor.ctx.fillStyle = '#523b0a';
    canvasor.ctx.fillRect(-this.translateOffsetX, 0, canvasor.width, 50);
    canvasor.ctx.fillStyle = '#402e07';
    canvasor.ctx.fillRect(-this.translateOffsetX, 50, canvasor.width, 4);

    // player image and frame
    canvasor.ctx.fillStyle = '#666';
    canvasor.ctx.fillRect(-this.translateOffsetX + 5, 6, 40, 40);

    canvasor.ctx.save();
    canvasor.ctx.scale(0.43, 0.43);
    canvasor.ctx.drawImage(this.resourcor.playerImage, -this.translateOffsetX * 2.3256 + 19, 10);
    canvasor.ctx.restore();

    canvasor.ctx.lineWidth = 2;
    canvasor.ctx.strokeStyle = '#111';
    canvasor.ctx.strokeRect(-this.translateOffsetX + 5, 6, 40, 40);

    // health
    canvasor.ctx.fillStyle = 'green';
    let fillAmount = this.player.health / this.player.healthMax * 325;
    canvasor.ctx.fillRect(-this.translateOffsetX + 65, 6, fillAmount, 40);

    canvasor.ctx.fillStyle = 'red';
    canvasor.ctx.strokeRect(-this.translateOffsetX + 65, 6, 325, 40);

    canvasor.ctx.fillStyle = '#111';
    canvasor.ctx.font = '16px sans-serif';
    canvasor.ctx.fillText(`HP: ${this.player.health} / ${this.player.healthMax}`,
      -this.translateOffsetX + 75, 32);

    // fatigue
    canvasor.ctx.fillStyle = 'yellow';
    fillAmount = this.player.bullet.cooldown / this.player.bullet.cooldownMax * 325;
    canvasor.ctx.fillRect(-this.translateOffsetX + 410, 6, fillAmount, 40);

    canvasor.ctx.strokeRect(-this.translateOffsetX + 410, 6, 325, 40);

    canvasor.ctx.fillStyle = '#111';
    canvasor.ctx.fillText(`FP: ${this.player.bullet.cooldown} / ${this.player.bullet.cooldownMax}`,
      -this.translateOffsetX + 425, 32);

    // status effect
    canvasor.ctx.fillStyle = '#666';
    canvasor.ctx.fillRect(-this.translateOffsetX + 755, 6, 40, 40);
    canvasor.ctx.strokeRect(-this.translateOffsetX + 755, 6, 40, 40);
    canvasor.ctx.font = '24px sans-serif';
    canvasor.ctx.fillText('🚫', -this.translateOffsetX + 763, 35);
  }

  cameraMovement() {
    if(this.player.x < this.playerOffsetMoveBackgroundStart)
      return;

    this.translateOffsetX = -this.player.x + this.playerOffsetMoveBackgroundStart;

    const checkTranslate = this.backgroundWidth * -this.backgroundRepeatCount + canvasor.width;
    if(this.translateOffsetX < checkTranslate)
      this.translateOffsetX = checkTranslate;
  }

}