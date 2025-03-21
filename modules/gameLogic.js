import PlayingField from "./playingField.js";
import EnemyHandler from "./enemyHandler.js";
import TowerHandler from "./towerHandler.js";
import Shop from "./shop.js";
import { setHealth, sendMsg, setWaveProgress, setWealth, toggleGameOverlay } from "./uiHook.js";
import { generateEnemyPattern } from "./waveLogic.js";

export default class GameLogic {
  constructor(sceneInformation) {
    this.sceneInformation = sceneInformation;
    this.currentMode = 3;
    this.modeMap = {
      startMenu: 0,
      options: 1,
      deathScreen: 2,
      inGame: {
        normal: 3
      },
    };

    document.getElementById("gl-canvas").addEventListener("click", () => {this.onMouseClick()});
  }

  startGame() {
    // Settings
    let tickIntervall = 1/60 * 1000;

    this.playingField = new PlayingField(this.sceneInformation);
    this.enemyHandler = new EnemyHandler(this.playingField, this.sceneInformation);
    this.towerHandler = new TowerHandler(this.sceneInformation, this.playingField, this.enemyHandler);
    this.shop = new Shop(this.playingField, this.sceneInformation, this.towerHandler);
    this.enemyHandler.addMoney = this.shop.addMoney;
    this.towerHandler.addMoney = this.shop.addMoney;
    // Initial Game State
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.money = 250.0;
    this.maxMoney = Math.max(this.money);
    this.waveCounter = 0;
    this.score = 0;

    this.currentGame = setInterval(() => {this.updateGame()}, tickIntervall);
    // wave settings
    this.currentWave;
    this.wavePattern = [];
    this.turn;
    this.totalEnemies=1;
    this.enemiesSpawned=0;
  }

  stopGame() {
    this.playingField.deactivateTilePlacing(); //optional?
    clearInterval(this.currentWave);
    clearInterval(this.currentGame);
  }

  updateGame() {
    let dmg = this.enemyHandler.doTick();
    this.health -= dmg;
    if (this.health <= 0) {
      this.health = 0;
      toggleGameOverlay(true);
      this.stopGame();
    }
    this.towerHandler.doTick();
    this.money = this.shop.money;
    this.maxMoney = Math.max(this.money, this.maxMoney);
    this.updateStats();
  }

  updateOnFrame(deltaTime) {
    this.enemyHandler.doAnimations(deltaTime);
    this.towerHandler.doAnimations(deltaTime);
    this.playingField.doAnimations();
  }

  onMouseClick() {
  }

  startNewWave = () => {
    if (this.currentWave == undefined || this.currentWave == null) { // check if wave is running
      this.waveCounter += 1;
      //sendMsg("Wave started!", "⚠", 1000);
      this.wavePattern = generateEnemyPattern(this.waveCounter);
      let spawnIntervall = 100; // HERE WE CAN AFFECT WAVE SPAWN SPEED, IMPORTANT TO COMPARE WITH SHOOTING SPEED
      //progress tracking
      this.turn=0;
      this.totalEnemies=0;
      this.enemiesSpawned=0;

      this.wavePattern.forEach(turn => { 
        let sum = 0;
        turn.forEach(val => sum += (val>0?1:0));
        this.totalEnemies = sum;
      })
      console.log(this.totalEnemies);
      this.currentWave = setInterval(() => {this.waveSpawn()}, spawnIntervall);
      this.playingField.deactivateTilePlacing();
    }
  }

  waveSpawn() {
    let turnPattern = this.wavePattern[this.turn];
    const enemyMap = ["formula1","formula2", "monstertruck", "monstertruck2"];
    const currEnemy = turnPattern.shift();
    if (currEnemy > 0) { /*
      let random = Math.random() * 100;
      if (random <= 105 - 4 * Math.log2(this.waveCounter)) {
        if (random <= 110 - 4 * Math.log2(this.waveCounter)) {
          this.enemyHandler.spawnNewEnemy(this.enemyHandler.enemyTypes.formula2);
        } else {
          this.enemyHandler.spawnNewEnemy(this.enemyHandler.enemyTypes.formula1);
        }
      } else {
        if (random <= 114 - 4 * Math.log2(this.waveCounter)) {
          this.enemyHandler.spawnNewEnemy(this.enemyHandler.enemyTypes.monstertruck2);
        } else {
          this.enemyHandler.spawnNewEnemy(this.enemyHandler.enemyTypes.monstertruck);
        }
      }*/
      this.enemyHandler.spawnNewEnemy(this.enemyHandler.enemyTypes[enemyMap[currEnemy]]);
      this.enemiesSpawned += 1;
    }
    if (turnPattern.length <= 0) {
      this.turn += 1;
    }
    if (this.turn >= this.wavePattern.length) { // wave over
      this.shop.money += this.roundReward();
      this.playingField.activateTilePlacing(1);
      clearInterval(this.currentWave);
      this.currentWave=null;
    }
  }

  roundReward = () => {
    const rewards = [50, 50, 50, 100, 100, 100, 250, 250, 250, 500];
    const index = Math.min(Math.round(this.waveCounter/10), 9);
    return rewards[index];
  }

  updateStats() { // tree: no wealth exists yet
    setWaveProgress(this.enemiesSpawned/this.totalEnemies, this.waveCounter);
    setHealth(this.health, this.maxHealth);
    setWealth(this.money, this.maxMoney);
  }
}
