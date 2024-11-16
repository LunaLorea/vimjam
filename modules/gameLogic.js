import PlayingField from "./playingField.js";
import EnemyHandler from "./enemyHandler.js";
import TowerHandler from "../models/towerHandler.js";

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
    this.health = 10;
    this.money = 1000.0;
    this.waveCounter = 0;
    this.score = 0;

    this.currentGame = setInterval(() => {this.updateGame()}, tickIntervall);
  }

  stopGame() {
  
    clearInterval(this.currentGame);
  }

  updateGame() {
    this.enemyHandler.doTick();
    this.towerHandler.doTick();
  }

  updateOnFrame(deltaTime) {
    this.enemyHandler.doAnimations(deltaTime);
  }

  onMouseClick() {
  }

  startNewWave() {
    this.waveCounter += 1;
    this.enemyHandler.spawnNewEnemy(this.enemyHandler.enemyTypes.formula1);
  }
}
