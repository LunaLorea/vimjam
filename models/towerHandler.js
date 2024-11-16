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
      // secends per projectile
      defaultFireRate: 1,
      defaultRadius: 2,
      defaultMode: this.AttackModes.closeFirst,
      unusedObj: [],
      initFunction: (tower) => this.initTireTower(tower),
      doTickFunction: (tower) => this.tickTireTower(tower),
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
  ProjectileTypes = {
    tires: {
      speed: 1,
      unusedObj: [],
      defaultRotation: [0, 0, 0],
    },
  };

  currentTowers = [];
  currentProjectiles = [];

  constructor(sceneInformation, playingField, enemyHandler) {
    this.sceneInformation = sceneInformation;
    this.playingField = playingField;
    this.enemyHandler = enemyHandler;

    const tireTower = this.addNewTower(this.TowerTypes.tire, {position: [0, 0, 0], rotation: [0, 0, 0]});
  }

  addNewTower(type, slot) {
    let towerObject = null;
    if (type.unusedObj.length > 0) {
      towerObject = type.unusedObj.pull();
      towerObject.alpha = 1;
      towerObject.position = slot.position;
      towerObject.rotation = slot.rotation;
    } else {
      towerObject = this.sceneInformation.addNewObject(
        type.objName,
        slot.position,
        slot.rotation,
        1
      );
    }

    const newTower = {
      type: type,
      level: 1,
      inWorldObj: towerObject,
    }

    type.initFunction(newTower);
    this.currentTowers.push(newTower)
  }

  doTick() {
    this.currentTowers.forEach( (tower) => {
      tower.type.doTickFunction(tower);
    });
  }

  doAnimations(deltaTime) {
    this.currentProjectiles.forEach( (projectile) => {
      this.animateProjectiles(projectile, deltaTime);
    });
  }

  addProjectile(type, target, startPosition) {
    
    let projectileObject = null;

    if (type.unusedObj.length > 0) {
      projectileObject = type.unusedObj.pull();
      projectileObject.position = startPosition;
      projectileObject.rotation = type.defaultRotaion;
      projectileObject.alpha = 1;
    } else {
      projectileObject = this.sceneInformation.addNewObject(
        type.objName,
        startPosition,
        type.defaultRotation,
        1
      );
    }

    const newProjectile = {
      type: type,
      target: target,
      inWorldObj: projectileObject,
    };

    this.currentProjectiles.push(newProjectile);
  }

  tickProjectiles() {}
  animateProjectiles(projectile, deltaTime) {
    const targetPos = projectile.target.inWorldEnemy.position;

  }

  initTireTower(tower) {
    const type = tower.type;
    tower.fireRate = type.defaultFireRate;
    tower.radius = type.defaultRadius;
    tower.position = tower.inWorldObj.position;
    tower.mode = type.defaultMode;
    tower.timer = 0;
  }

  tickTireTower(tower) {
    tower.timer += 1/60;
    let target = null;

    if (tower.timer > tower.fireRate) {
      const position = tower.position;
      const enemiesInRange = this.enemyHandler.getEnemiesInRadius(position, tower.radius);

      if (enemiesInRange.length == 0) return;

      if (tower.mode == 1) {
        let closestIndex = indexOfSmallest(enemiesInRange.distances);
        target = enemiesInRange.enemies[closestIndex];
      }
      if (tower.mode == 2) {}
      if (tower.mode == 3) {}
    }

    this.addProjectile(this.ProjectileTypes.tires, target, tower.position);

    tower.timer = tower.timer % tower.fireRate;
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
