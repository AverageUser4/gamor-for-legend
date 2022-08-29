'use strict';

class Levelor {

  player;

  shouldRedraw = true;

  levelMap = 'town';
  levelDifficulty;

  backgroundImage;
  backgroundWidth;
  backgroundRepeatCount = 10;
  mapEndX;
  translateOffsetX = 0;
  playerOffsetMoveBackgroundStart = 300;

  enemyLimit = 5;
  promisedEnemies = 0;
  allEnemies = [];

  allDamagesOrHeals = [];

  ready = false;
  changeMap;
  nextMap = 'town';
  previousMap;
  canLeaveMap = false;

  startOnEnd = false;

  constructor(levelMap = 'tutorial', levelDifficulty = 0, startOnEnd = false) {  
    this.levelMap = levelMap;
    this.levelDifficulty = levelDifficulty;
    this.startOnEnd = startOnEnd;

    if(this.levelDifficulty === 0) {
      this.previousMap = 'tutorial';
      this.nextMap = 'town';
    } else if(this.levelMap === 'town') {
      this.previousMap = this.levelDifficulty === 1 ? 'tutorial' : 'dungeon';
      this.nextMap = 'field';
    } else if(this.levelMap === 'field') {
      this.previousMap = 'town';
      this.nextMap = 'dungeon';
    } else if(this.levelMap === 'dungeon') {
      this.previousMap = 'field';
      this.nextMap = 'town';
    }

    if(this.levelMap === 'tutorial')
      this.backgroundRepeatCount = 1;

    this.requestImage('backgroundImage', dirs.bgDir + this.levelMap + '.jpg')
      .then(() => this.onAllLoaded())
      .catch((src) => {
        // it can catch error in onAllLoaded()
        console.error(`Unable to load image: ${src}`);
        this.onAllLoaded(true);
      })

    setTimeout(() => this.canLeaveMap = true, 1000);
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

    this.enemyLimit = Math.round(this.backgroundWidth / 400 * this.backgroundRepeatCount);

    this.mapEndX = this.backgroundRepeatCount * this.backgroundWidth;

    this.player = new Player(this.startOnEnd, this.mapEndX);
    
    for(let i = 0; i < Math.floor(Math.random() * 4) + 2; i++)
      this.spawnEnemy(Math.floor(Math.random() * 450) + 250);

    this.player.image.addEventListener('ready', () => {
      this.ready = true;
      this.draw();
    });
  }

  spawnEnemy(x = 500) {
    const options = { level: this.levelDifficulty };
    let kind = 'peasant';

    if(this.levelMap === 'town') {
      kind = 'burgher';
    } else if(this.levelMap === 'tutorial') {
      options.fightsBack = false;
      kind = Math.floor(Math.random() * 2) ? 'burgher' : 'peasant';
    } else if(this.levelMap === 'dungeon') {
      kind = 'enemy';
      switch(Math.floor(Math.random() * 3)) {
        case 0:
          kind += 'Wizard';
          break;

        case 1:
          kind += 'Archer';
          break;

        case 2:
          kind += 'Warrior';
          break;
      }
    }

    if(this.levelMap !== 'dungeon') {
      kind += Math.floor(Math.random() * 2) ? '' : 'Woman';
      kind += Math.floor(Math.random() * 2) ? '' : 'Alt';
    }

    this.promisedEnemies++;
    const enemy = new Enemy(kind, x, options);

    enemy.image.addEventListener('ready', () => {
      this.promisedEnemies--;
      this.allEnemies.push(enemy);
    });
  }

  trySpawningEnemy() {
    if(this.allEnemies.length + this.promisedEnemies >= this.enemyLimit)
        return;

    const x = Math.floor(Math.random() * (this.mapEndX - 150));

    if(Math.abs(this.player.x - x) < 500)
      return;

    this.spawnEnemy(x);
  }


  isInVisibleSpace(x, width) {
    return x + width > -this.translateOffsetX &&
           x < -this.translateOffsetX + canvasor.width;
  }

  gameLoopIteration() {
    if(
        interactor.isPressed('e') &&
        this.canLeaveMap &&
        !this.player.isDead
      ) {
      if(
          this.player.x < 100 &&
          this.levelMap !== 'tutorial'
        ) {
        this.changeMap = { 
          newMap: this.previousMap,
          difficulty: this.levelDifficulty - 1,
          startOnEnd: true,
        };
      } else if(this.player.x > this.mapEndX - this.player.width - 100) {
        this.changeMap = { 
          newMap: this.nextMap, 
          difficulty: this.levelDifficulty + 1,
          startOnEnd: false,
        };
      }
    }

    if(
        this.player.isDead &&
        interactor.isPressed('c') &&
        Math.abs(this.player.x - orbOfResurrection.x)
          <= orbOfResurrection.playerReachDistance 
      ) {
        this.player.getResurrected();
        this.onPlayerResurrection();
        this.shouldRedraw = true;
      }

    if(this.levelMap !== 'tutorial')
      this.trySpawningEnemy();

    if(this.player.logic(this.mapEndX))
      this.shouldRedraw = true;
    
    this.cameraMovement();

    let returnObject = this.player.bullet.logic(this.allEnemies);

    if(returnObject.shouldRedraw)
      this.shouldRedraw = true;

    if(Object.hasOwn(returnObject, 'i')) {
      const i = returnObject.i;

      const dealt = this.allEnemies[i].getDamaged(this.player.dealDamage());

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
        const dealt = this.player.getDamaged(val.dealDamage());

        this.allDamagesOrHeals.push(
          new HealOrDamage('damage', this.player.x, this.player.y, dealt));

        if(this.player.isDead)
          this.onPlayerDeath();
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

    if(this.player.isDead && !orbOfResurrection.visible)
      orbOfResurrection.show(this.mapEndX);

    this.draw();
  }

  onPlayerDeath() {
    orbOfResurrection.show(this.mapEndX);

    for(let val of this.allEnemies) {
      val.state = 'neutral';
    }
  }

  onPlayerResurrection() {
    orbOfResurrection.hide();
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

    for(let val of this.allEnemies) {
      if(this.isInVisibleSpace(val.x, val.width))
        val.draw(this.translateOffsetX);
    }

    this.player.bullet.draw(this.translateOffsetX);

    for(let val of this.allEnemies) {
      if(this.isInVisibleSpace(val.bullet.x, val.bullet.width))
        val.bullet.draw(this.translateOffsetX);
    }

    for(let val of this.allDamagesOrHeals)
      val.draw(); 

    this.drawAreaLeavePrompt();

    orbOfResurrection.draw(this.player.x);

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

  drawAreaLeavePrompt() {
    canvasor.ctx.font = '16px sans-serif';
    canvasor.ctx.strokeStyle = 'black';
    canvasor.ctx.fillStyle = this.player.isDead ? colors.red : colors.yellow;

    if(
        this.player.x < 100 &&
        this.player.direction === 'left' &&
        this.levelMap !== 'tutorial'
      ) {
      if(!this.player.isDead) {
        canvasor.ctx.strokeText(`Naciśnij 'E', żeby wyjść.`, 15, 470);
        canvasor.ctx.fillText(`Naciśnij 'E', żeby wyjść.`, 15, 470);
      } else {
        canvasor.ctx.strokeText(`Musisz odnaleźć kulę ożywienia, żeby wyjść!`, 15, 470);
        canvasor.ctx.fillText(`Musisz odnaleźć kulę ożywienia, żeby wyjść!`, 15, 470);
      }
    } else if
        (
          this.player.x > this.mapEndX - this.player.width - 100 &&
          this.player.direction === 'right'
        ) {
      if(!this.player.isDead) {
        const w = canvasor.ctx.measureText(`Naciśnij 'E', żeby wyjść.`).width;
        canvasor.ctx.strokeText(`Naciśnij 'E', żeby wyjść.`, this.mapEndX - w - 15, 470);
        canvasor.ctx.fillText(`Naciśnij 'E', żeby wyjść.`, this.mapEndX - w - 15, 470);
      } else {
        const w = canvasor.ctx.measureText(`Musisz odnaleźć kulę ożywienia, żeby wyjść!`).width;
        canvasor.ctx.strokeText(`Musisz odnaleźć kulę ożywienia, żeby wyjść!`, this.mapEndX - w - 15, 470);
        canvasor.ctx.fillText(`Musisz odnaleźć kulę ożywienia, żeby wyjść!`, this.mapEndX - w - 15, 470);
      }
    }
  }

  drawUI() {
    // background
    canvasor.ctx.fillStyle = '#523b0a';
    canvasor.ctx.fillRect(-this.translateOffsetX, 0, canvasor.width, 50);
    canvasor.ctx.fillStyle = '#402e07';
    canvasor.ctx.fillRect(-this.translateOffsetX, 50, canvasor.width, 4);


    // position bar background
    canvasor.ctx.fillStyle = '#555';
    canvasor.ctx.fillRect(-this.translateOffsetX, 54, canvasor.width, 8);

    // enemies positions
    canvasor.ctx.fillStyle = colors.red;
    for(let val of this.allEnemies) {
      const x = val.x / this.mapEndX * canvasor.width + - this.translateOffsetX;
      canvasor.ctx.fillRect(x, 54, 5, 8);
    }

    // player's position
    canvasor.ctx.fillStyle = 'rgb(50, 125, 235)';
    const x = this.player.x / this.mapEndX * canvasor.width + - this.translateOffsetX;
    canvasor.ctx.fillRect(x, 54, 5, 8);

    // position bar frame
    canvasor.ctx.strokeStyle = 'black';
    canvasor.ctx.strokeRect(-this.translateOffsetX, 54, canvasor.width, 8);

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