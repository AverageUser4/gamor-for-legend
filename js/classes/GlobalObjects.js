'use strict';

const debugor = {
  debug: false,
}

const colors = {
  red: 'rgb(180, 30, 20)',
  green: 'rgb(10, 120, 15)',
  yellow: 'rgb(220, 200, 15)',
}

const dirs = {
  bgDir: 'resources/images/backgrounds/',
  charDir: 'resources/images/characters/',
  bulDir: 'resources/images/bullets/',
};

const bases = {
  backgroundWidth: 1250,

  playerWidth: 80,
  playerHeight: 100,

  bulletWidth: 100,
  bulletHeight: 25,

  enemyWidth: 90,
  enemyHeight: 110,

  villager: {
    name: 'Wieśniak',
    characterSrc: dirs.charDir + 'villager.png',
    bulletSrc: dirs.bulDir + 'dagger.png'
  },

  burgher: {
    name: 'Mieszczanin',
    characterSrc: dirs.charDir + 'burgher.png',
    bulletSrc: dirs.bulDir + 'dagger.png'
  },

  warrior: {
    name: 'Wojownik',
    characterSrc: dirs.charDir + 'warrior.png',
    bulletSrc: dirs.bulDir + 'dagger.png'
  },

  wizard: {
    name: 'Mag',
    characterSrc: dirs.charDir + 'wizard.png',
    bulletSrc: dirs.bulDir + 'wand.png'
  },

  archer: {
    name: 'Łucznik',
    characterSrc: dirs.charDir + 'archer.png',
    bulletSrc: dirs.bulDir + 'arrow.png'
  },

};