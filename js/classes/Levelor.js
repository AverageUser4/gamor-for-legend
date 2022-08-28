'use strict';

class Levelor {

  player;

  shouldRedraw = true;

  backgroundImage;
  backgroundWidth;
  backgroundRepeatCount = 1;
  mapEndX;
  translateOffsetX = 0;
  playerOffsetMoveBackgroundStart = 300;

  enemyLimit = 5;
  allEnemies = [];

  allDamagesOrHeals = [];

  ready = false;

  constructor(options) {
    if(!Object.hasOwn(options, 'backgroundSrc'))
      throw new Error('No background source provided in options object of Levelor constuctor.');

    if(Object.hasOwn(options, 'levelSize'))
      this.backgroundRepeatCount = options.levelSize;

    this.requestImage('backgroundImage', options.backgroundSrc)
      .then(() => this.onAllLoaded())
      .catch((src) => {
        // it can catch error in onAllLoaded()
        console.error(`Unable to load image: ${src}`);
        this.onAllLoaded(true);
      })
  }

  requestImage(propertyName, src) {
    return new Promise((resolve, reject) => {
      this[propertyName] = new Image();
      
      this[propertyName].addEventListener('load', 
        () => resolve(), { once: true });
      this[propertyName].addEventListener('error', 
        () => reject(src), { once: true });

      this[propertyName].src = src;
    });
  }

  onAllLoaded(error = false) {
    if(error) {
      this.backgroundWidth = bases.backgroundWidth;
      this.backgroundImage = null;
    }
    else
      this.backgroundWidth = this.backgroundImage.naturalWidth;

    this.mapEndX = this.backgroundRepeatCount * this.backgroundWidth;

    this.player = new Player('warrior');
    
    for(let i = 0; i < Math.floor(Math.random() * 4) + 2; i++)
      this.spawnEnemy('peasant', Math.floor(Math.random() * 450) + 250) ;

    this.player.image.addEventListener('ready', () => {
      this.ready = true;
      this.draw();
    });
  }

  spawnEnemy(kind, x = 500, options) {
    this.allEnemies.push(new Enemy(kind, x, this.player.speed, options));    
  }

  trySpawningEnemy() {
    if(this.allEnemies.length >= this.enemyLimit)
        return;

    let kind = Math.floor(Math.random() * 2) ? 'peasant' : 'burgher';
    kind += Math.floor(Math.random() * 2) ? '' : 'Woman';
    kind += Math.floor(Math.random() * 2) ? '' : 'Alt';

    if(
        this.player.x > canvasor.width + this.playerOffsetMoveBackgroundStart && 
        Math.floor(Math.random() * 2)
      ) {
      // spawn on left side of the player
      const random = Math.floor(Math.random() * canvasor.width);
      const start = this.player.x - canvasor.width;
      const x = start + random;
      this.spawnEnemy(kind, x);
    } else {
      // spawn on right side of the player
      const random = Math.floor(Math.random() * canvasor.width);
      const start = this.player.x;
      const x = start + random;
      this.spawnEnemy(kind, x);
    }
  }

  despawnDistant() {
    let index = -1;

    for(let i = 0; i < this.allEnemies.length; i++) {
      const distance = Math.abs(this.allEnemies[i].x - this.player.x);
      if(distance > canvasor.width * 2) {
          index = i;
          break;
        }
    }

    if(index !== -1)
      this.allEnemies.splice(index, 1);
  }

  gameLoopIteration() {
    this.trySpawningEnemy();
    this.despawnDistant();

    if(this.player.logic(this.mapEndX))
      this.shouldRedraw = true;
    
    this.cameraMovement();

    let returnObject = this.player.bullet.logic(this.allEnemies);

    if(returnObject.shouldRedraw)
      this.shouldRedraw = true;

    if(Object.hasOwn(returnObject, 'i')) {
      const i = returnObject.i;

      const dealt = this.allEnemies[i].getDamaged(this.player.damage);

      this.allDamagesOrHeals.push(
        new HealOrDamage('damage', this.allEnemies[i].x, this.allEnemies[i].y, dealt));

      if(this.allEnemies[i].isDead)
        this.allEnemies.splice(i, 1);
    }

    for(let val of this.allEnemies) {
      if(val.logic(this.player.x, this.mapEndX))
        this.shouldRedraw = true;

      returnObject = val.bullet.logic([this.player]);

      if(returnObject.shouldRedraw)
        this.shouldRedraw = true;

      if(Object.hasOwn(returnObject, 'i')) {
        const dealt = this.player.getDamaged(val.damage);

        this.allDamagesOrHeals.push(
          new HealOrDamage('damage', this.player.x, this.player.y, dealt));
      }
    }

    const toBeSpliced = [];
    for(let val of this.allDamagesOrHeals) {
      val.logic();
      this.shouldRedraw = true;
      if(val.opacity === 0)
        toBeSpliced.push(val);
    }

    for(let val of toBeSpliced)
      this.allDamagesOrHeals.splice(this.allDamagesOrHeals.indexOf(val), 1);

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

    for(let val of this.allEnemies)
      val.bullet.draw(this.translateOffsetX);

    for(let val of this.allDamagesOrHeals)
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

      if(!this.backgroundImage) {
        canvasor.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        canvasor.ctx.fillRect(x, 0, canvasor.width, canvasor.height);
      } else {
        canvasor.ctx.drawImage(this.backgroundImage, x, 0);
      }
    }
  }

  drawUI() {
    // background
    canvasor.ctx.fillStyle = '#523b0a';
    canvasor.ctx.fillRect(-this.translateOffsetX, 0, canvasor.width, 50);
    canvasor.ctx.fillStyle = '#402e07';
    canvasor.ctx.fillRect(-this.translateOffsetX, 50, canvasor.width, 4);

    // player image and frame
    canvasor.ctx.fillStyle = '#555';
    canvasor.ctx.fillRect(-this.translateOffsetX + 5, 6, 40, 40);

    if(!this.player.noImage) {
      canvasor.ctx.save();
      canvasor.ctx.scale(0.43, 0.43);
      canvasor.ctx.drawImage(this.player.image, -this.translateOffsetX * 2.3256 + 19, 10);
      canvasor.ctx.restore();
    }

    canvasor.ctx.lineWidth = 2;
    canvasor.ctx.strokeStyle = '#111';
    canvasor.ctx.strokeRect(-this.translateOffsetX + 5, 6, 40, 40);

    // health
    canvasor.ctx.fillStyle = '#555';
    canvasor.ctx.fillRect(-this.translateOffsetX + 65, 6, 325, 40);

    canvasor.ctx.fillStyle = colors.green;
    let fillAmount = this.player.health / this.player.healthMax * 325;
    canvasor.ctx.fillRect(-this.translateOffsetX + 65, 6, fillAmount, 40);

    canvasor.ctx.strokeStyle = 'black';
    canvasor.ctx.strokeRect(-this.translateOffsetX + 65, 6, 325, 40);

    canvasor.ctx.fillStyle = '#111';
    canvasor.ctx.font = '16px sans-serif';
    canvasor.ctx.fillText(`HP: ${this.player.health} / ${this.player.healthMax}`,
      -this.translateOffsetX + 75, 32);

    // fatigue
    canvasor.ctx.fillStyle = '#555';
    canvasor.ctx.fillRect(-this.translateOffsetX + 410, 6, 325, 40);

    canvasor.ctx.fillStyle = colors.yellow;
    fillAmount = this.player.bullet.cooldown / this.player.bullet.cooldownMax * 325;
    canvasor.ctx.fillRect(-this.translateOffsetX + 410, 6, fillAmount, 40);

    canvasor.ctx.strokeRect(-this.translateOffsetX + 410, 6, 325, 40);

    canvasor.ctx.fillStyle = '#111';
    canvasor.ctx.fillText(`FP: ${this.player.bullet.cooldown} / ${this.player.bullet.cooldownMax}`,
      -this.translateOffsetX + 425, 32);

    // status effect
    canvasor.ctx.fillStyle = '#555';
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