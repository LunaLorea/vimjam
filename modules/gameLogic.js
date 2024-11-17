import PlayingField from "./playingField.js";
import EnemyHandler from "./enemyHandler.js";
import TowerHandler from "../models/towerHandler.js";
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
      let spawnIntervall = 1*1000; // HERE WE CAN AFFECT WAVE SPAWN SPEED, IMPORTANT TO COMPARE WITH SHOOTING SPEED
      //progress tracking
      this.turn=0;
      this.totalEnemies=0;
      this.enemiesSpawned=0;

      this.wavePattern.forEach(num => {
        this.totalEnemies += num;
      })
      console.log(this.totalEnemies);
      this.currentWave = setInterval(() => {this.waveSpawn()}, spawnIntervall);
      this.playingField.deactivateTilePlacing();
    }
  }

  waveSpawn() {
    let turnPattern = this.wavePattern[this.turn];
    if (turnPattern>=1) {
      this.enemyHandler.spawnNewEnemy(this.enemyHandler.enemyTypes.formula1);
      this.enemiesSpawned += 1;
    }
    if (turnPattern<0) {
      this.turn += 1;
    }
    else {
      this.wavePattern[this.turn] = turnPattern-1;
    }
    if (this.turn >= this.wavePattern.length) { // wave over
      this.shop.money += this.roundReward();
      this.playingField.activateTilePlacing(5);
      clearInterval(this.currentWave);
      this.currentWave=null;
    }
  }

  roundReward = () => {
    const rewards = [25, 50, 50, 100, 100, 100, 250, 250, 250, 500];
    const index = Math.min(Math.round(this.waveCounter/10), 9);
    return rewards[index];
  }

  updateStats() { // tree: no wealth exists yet
    setWaveProgress(this.enemiesSpawned/this.totalEnemies, this.waveCounter);
    setHealth(this.health, this.maxHealth);
    setWealth(this.money, this.maxMoney);
  }
}
