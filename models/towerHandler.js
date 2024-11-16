export default class TowerHandler {

  AttackModes = {
    closeFirst: 1,
    farFirst: 2,
    furthest: 3,
  }
  TowerTypes = {
    tire: {
      cost: 100,
      resellValue: 60,
      objName: "tower-tire",
      // firerate per second
      defaultFireRate: 1,
      defaultRadius: 2,
      defaultMode: this.AttackModes.closeFirst,
      unusedObj: [],
      initFunction: this.initTireTower,
      doTickFunction: this.tickTireTower,
    },
    spikes: {
      cost: 75,
      resellValues: 45,
      objName: "tower-spikes",
      unusedObj: [],
      initFunction: this.initSpikesTower,
      doTickFunction: this.tickSpikesTower,
    },
    toll: {
      cost: 150,
  resellValue: 80,
      objName: "",
      unusedObj: [],
      initFunction: this.initTollTower,
      doTickFunction: this.tickTollTower,
    }
  };

  currentTowers = [];

  constructor(sceneInformation, playingField, enemyHandler) {
    this.sceneInformation = sceneInformation;
    this.playingField = playingField;
    this.enemyHandler = enemyHandler;

    const tireTower = this.addNewTower(this.TowerTypes.tire, {position: [0, 0, 0], rotation: [0, 0, 0]});
  }

  addNewTower(type, slot) {
    const newTower = {
      type: type,
      level: 1,
      inWorldObj: this.sceneInformation.addNewObject(
        type.objName,
        slot.position,
        slot.rotation,
        1
      ),
    }

    type.initFunction(newTower);
    this.currentTowers.push(newTower)
  }

  doTick() {
    this.currentTowers.forEach( (tower) => {
      //tower.type.doTickFunction(tower);
    });
  }

  initTireTower(tower) {
    const type = tower.type;
    tower.fireRate = type.defaultFireRate;
    tower.radius = type.defaultRadius;
    tower.position = tower.inWorldObj.position;
    tower.mode = type.defaultMode;
    console.log("tire tower initialized");
  }

  tickTireTower(tower) {
    const position = tower.position;
    const enemiesInRange = 0;
    console.log(this.enemyHandler);
    if (tower.mode == 1) {
      let closestIndex = indexOfSmallest(enemiesInRange.distances);
      const target = enemiesInRange.enemies[closestIndex];
      console.log(target);
    }
  }

  initSpikesTower() {}

  tickSpikesTower() {}

  initTollTower() {}

  tickTollTower() {}



}

function indexOfSmallest(a) {
 var lowest = 0;
 for (var i = 1; i < a.length; i++) {
  if (a[i] < a[lowest]) lowest = i;
 }
 return lowest;
}
function indexOfLargest(a) {
 var heighest = 0;
 for (var i = 1; i < a.length; i++) {
  if (a[i] > a[heighest]) heighest = i;
 }
 return heighest;
}
