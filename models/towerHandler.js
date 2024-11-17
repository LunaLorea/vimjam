export default class TowerHandler {

  AttackModes = {
    closeFirst: 1,
    farFirst: 2,
    furthest: 3,
  };
  TowerTypes = {
    tire: {
      cost: 100,
      resellValue: 60,
      objName: "tower-tire",
      // secends per projectile
      defaultFireRate: 1.5,
      timeToFirstShot: 0.2,
      defaultRadius: 2,
      defaultDamage: 1,
      defaultMode: this.AttackModes.closeFirst,
      unusedObj: new Set(),
      initFunction: (tower) => this.initTireTower(tower),
      doTickFunction: (tower) => this.tickTireTower(tower),
    },
    spikes: {
      cost: 75,
      resellValues: 45,
      objName: "tower-spikes",
      unusedObj: new Set(),
      initFunction: this.initSpikesTower,
      doTickFunction: this.tickSpikesTower,
    },
    toll: {
      cost: 150,
  resellValue: 80,
      objName: "",
      unusedObj: new Set(),
      initFunction: this.initTollTower,
      doTickFunction: this.tickTollTower,
    }
  };
  ProjectileTypes = {
    tires: {
      speed: 5,
      unusedObj: new Set(),
      defaultRotation: [0, 0, 0],
      objName: "projectile-tire",
    },
  };

  currentTowers = new Set();
  currentProjectiles = new Set();

  constructor(sceneInformation, playingField, enemyHandler) {
    this.sceneInformation = sceneInformation;
    this.playingField = playingField;
    this.enemyHandler = enemyHandler;
  }

  addNewTower(type, slot) {
    let towerObject = null;
    if (type.unusedObj.size > 0) {
      towerObject = type.unusedObj.values().next().value;
      type.unusedObj.delete(towerObject);
      towerObject.position = slot.position;
      towerObject.rotation = slot.rotation;
    } else {
      towerObject = this.sceneInformation.addNewObject(
        type.objName,
        slot.position,
        slot.rotation,
        slot.scale,
      );
    }

    const newTower = {
      type: type,
      level: 1,
      inWorldObj: towerObject,
      dmgM: slot.damageMultiplier,
      rangeM: slot.rangeMultiplier,
    }
    this.playingField.removeBillBoard(slot);
    type.initFunction(newTower);
    this.currentTowers.add(newTower)
    return newTower;
  }

  doTick() {
    this.currentTowers.forEach( (tower) => {
      tower.type.doTickFunction(tower);
    });
    this.currentProjectiles.forEach( (projectile, index) => {
      this.tickProjectiles(projectile, index);
    });

    

  }

  doAnimations(deltaTime) {
    this.currentProjectiles.forEach( (projectile) => {
      this.animateProjectiles(projectile, deltaTime);
    });
  }

  addProjectile(type, target, startPosition, damage) {
    
    let projectileObject = null;

    if (type.unusedObj.size > 0) {
      projectileObject = type.unusedObj.values().next().value;
      type.unusedObj.delete(projectileObject);
      projectileObject.position = [...startPosition];
      projectileObject.rotation = type.defaultRotation;
      projectileObject.scale = 1.3;
    } else {
      projectileObject = this.sceneInformation.addNewObject(
        type.objName,
        [...startPosition],
        type.defaultRotation,
        1.3
      );
    }

    projectileObject.position[1] = 0.45;

    const newProjectile = {
      type: type,
      target: target,
      inWorldObj: projectileObject,
      damage: damage,
    };

    this.currentProjectiles.add(newProjectile);
  }

  tickProjectiles(projectile, index) {
    if (projectile.distanceToTarget < 0.1) {
      this.enemyHandler.damageEnemy(projectile.target, projectile.damage)
      this.deleteProjectile(projectile);   
    }
  }

  deleteProjectile(projectile) {
      this.currentProjectiles.delete(projectile);
      const obj = projectile.inWorldObj;
      obj.scale = 0;
      projectile.type.unusedObj.add(obj);
  }


  animateProjectiles(projectile, deltaTime) {
    if (projectile == undefined) return;
    if (projectile.target == undefined) {
      this.deleteProjectile(projectile);
      return;
    }
    const targetPos = projectile.target.inWorldEnemy.position;
    const projectilePos = projectile.inWorldObj.position;

    const targetVector = vec3.create();
    vec3.sub(targetVector, targetPos, projectilePos);

    const distance = Math.sqrt(vec3.dot(targetVector, targetVector));
    projectile.distanceToTarget = distance;

    let stepDistance = Math.min(distance, projectile.type.speed * deltaTime);
    vec3.normalize(targetVector, targetVector);
    vec3.scale(targetVector, targetVector, stepDistance);

    vec3.add(projectilePos,projectilePos, targetVector);
  }

  initTireTower(tower) {
    const type = tower.type;
    tower.fireRate = type.defaultFireRate;
    tower.radius = type.defaultRadius * tower.rangeM;
    tower.position = tower.inWorldObj.position;
    tower.mode = type.defaultMode;

    tower.timer = tower.fireRate - type.timeToFirstShot;
    tower.damage = type.defaultDamage * tower.dmgM;
  }

  tickTireTower(tower) {
    tower.timer += 1/60;
    let target = null;

    if (tower.timer >= tower.fireRate) {
      const position = tower.position;
      const enemiesInRange = this.enemyHandler.getEnemiesInRadius(position, tower.radius);

      if (enemiesInRange.length == 0) return;

      if (tower.mode == 1) {
        let closestIndex = indexOfSmallest(enemiesInRange.distances);
        target = enemiesInRange.enemies[closestIndex];
      }
      if (tower.mode == 2) {}
      if (tower.mode == 3) {}

      this.addProjectile(this.ProjectileTypes.tires, target, tower.position, tower.damage);
    }


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
