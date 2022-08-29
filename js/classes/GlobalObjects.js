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
  otherDir: 'resources/images/other/',
};

const bases = {
  backgroundWidth: 1250,

  playerWidth: 80,
  playerHeight: 100,

  bulletWidth: 100,
  bulletHeight: 25,

  enemyWidth: 90,
  enemyHeight: 110,

  peasant: {
    name: 'Chłop',
    characterSrc: dirs.charDir + 'peasant.png',
    bulletSrc: dirs.bulDir + 'pitchfork.png'
  },

  peasantAlt: {
    name: 'Chłop',
    characterSrc: dirs.charDir + 'peasant-2.png',
    bulletSrc: dirs.bulDir + 'pitchfork.png'
  },

  peasantWoman: {
    name: 'Chłopka',
    characterSrc: dirs.charDir + 'peasant-woman.png',
    bulletSrc: dirs.bulDir + 'pitchfork.png'
  },

  peasantWomanAlt: {
    name: 'Chłopka',
    characterSrc: dirs.charDir + 'peasant-woman-2.png',
    bulletSrc: dirs.bulDir + 'pitchfork.png'
  },

  burgher: {
    name: 'Mieszczanin',
    characterSrc: dirs.charDir + 'burgher.png',
    bulletSrc: dirs.bulDir + 'stick.png'
  },

  burgherAlt: {
    name: 'Mieszczanin',
    characterSrc: dirs.charDir + 'burgher-2.png',
    bulletSrc: dirs.bulDir + 'stick.png'
  },

  burgherWoman: {
    name: 'Mieszczanka',
    characterSrc: dirs.charDir + 'burgher-woman.png',
    bulletSrc: dirs.bulDir + 'stick.png'
  },

  burgherWomanAlt: {
    name: 'Mieszczanka',
    characterSrc: dirs.charDir + 'burgher-woman-2.png',
    bulletSrc: dirs.bulDir + 'stick.png'
  },

  enemyWarrior: {
    name: 'Wojownik',
    characterSrc: dirs.charDir + 'enemy-warrior.png',
    bulletSrc: dirs.bulDir + 'dagger.png'
  },

  enemyWizard: {
    name: 'Mag',
    characterSrc: dirs.charDir + 'enemy-wizard.png',
    bulletSrc: dirs.bulDir + 'wand.png'
  },

  enemyArcher: {
    name: 'Łucznik',
    characterSrc: dirs.charDir + 'enemy-archer.png',
    bulletSrc: dirs.bulDir + 'arrow.png'
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