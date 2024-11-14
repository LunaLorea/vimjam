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
    console.log("game started");
    // Settings
    let tickIntervall = 1/60 * 1000;

    // Initial Game State
    this.health = 10;
    this.money = 1000.0;

    this.currentGame = setInterval(this.updateGame, tickIntervall);
  }

  stopGame() {
    console.log("game ended");
  
    clearInterval(this.currentGame);
  }

  updateGame() {
    console.log("tick");
  }

  onMouseClick() {
    this.stopGame();
  }
}
