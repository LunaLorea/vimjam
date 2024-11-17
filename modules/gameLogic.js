import PlayingField from "./playingField.js";
import EnemyHandler from "./enemyHandler.js";
import TowerHandler from "../models/towerHandler.js";
import { setHealth, setWaveProgress, setWealth } from "./uiHook.js";
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

    addEventListener("click", () => {this.onMouseClick()});
  }

  startGame() {
    // Settings
    let tickIntervall = 1/60 * 1000;

    this.playingField = new PlayingField(this.sceneInformation);
    this.enemyHandler = new EnemyHandler(this.playingField, this.sceneInformation);
    this.towerHandler = new TowerHandler(this.sceneInformation, this.playingField, this.enemyHandler);
    // Initial Game State
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.money = 1000.0;
    this.waveCounter = 0;
    this.score = 0;

    this.currentGame = setInterval(() => {this.updateGame()}, tickIntervall);
    // wave settings
    this.currentWave;
    this.wavePattern = [];
    this.turn;
  }

  stopGame() {
  
    clearInterval(this.currentGame);
  }

  updateGame() {
    this.enemyHandler.doTick();
    this.towerHandler.doTick();
    this.updateStats();
  }

  updateOnFrame(deltaTime) {
    this.enemyHandler.doAnimations(deltaTime);
    this.towerHandler.doAnimations(deltaTime);
  }

  onMouseClick() {
  }

  startNewWave = () => {
    if (this.currentWave !== undefined || this.currentWave !== null) { // check if wave is running
      this.waveCounter += 1;
      this.wavePattern = generateEnemyPattern(this.waveCounter);
      let spawnIntervall = 3*1000;
      this.turn=0;
      this.currentWave = setInterval(() => {this.waveSpawn()}, spawnIntervall);
      console.log("wave started");
    }
  }

  waveSpawn() {
    let turnPattern = this.wavePattern[this.turn];
    if (turnPattern&1 == 1) {
      this.enemyHandler.spawnNewEnemy(this.enemyHandler.enemyTypes.formula1);
    }
    if (turnPattern==0) {
      this.turn = this.turn + 1;
    }
    else {
      this.wavePattern[this.turn] = turnPattern>>1;
    }
    if (this.turn >= this.wavePattern.length) {
      console.log("wave over");
      clearInterval(this.currentWave);
    }
  }

  updateStats() { // tree: no wealth, wave progress exists yet
    setWaveProgress(1, this.waveCounter);
    setHealth(this.health, this.maxHealth);
    setWealth(this.score, this.score);
  }
}
