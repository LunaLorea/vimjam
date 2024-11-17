export default class TowerHandler {

  AttackModes = {
    closeFirst: 1,
    farFirst: 2,
    furthest: 3,
  };
  TowerTypes = {
    tire: {
      objName: "tower-tire",
      // secends per projectile
      defaultFireRate: 1.2,
      timeToFirstShot: 0.2,
      defaultRadius: 3,
      defaultDamage: 1,
      projectileSpeed: 10,
      projetileSize: 1,
      defaultMode: this.AttackModes.closeFirst,
      unusedObj: new Set(),
      initFunction: (tower) => this.initTireTower(tower),
      doTickFunction: (tower) => this.tickTireTower(tower),
    },
    sniper: {
      objName: "tower-sniper",
      // secends per projectile
      defaultFireRate: 2.5,
      timeToFirstShot: 0.2,
      defaultRadius: 15,
      defaultDamage: 4,
      projectileSpeed: 25,
      projetileSize: 1.5,
      defaultMode: this.AttackModes.furthest,
      unusedObj: new Set(),
      initFunction: (tower) => this.initTireTower(tower),
      doTickFunction: (tower) => this.tickTireTower(tower),
    },
    spikes: {
      objName: "tower-spikes",
      unusedObj: new Set(),
      defaultFireRate: 5,
      initFunction: (tower) => this.initSpikesTower(tower),
      doTickFunction: (tower) => this.tickSpikesTower(tower),
    },
    toll: {
      objName: "tower-toll",
      defaultFireRate: 0.4,
      defaultRadius: 3,
      moneyPerCar: 3,
      unusedObj: new Set(),
      initFunction: (tower) => this.initTollTower(tower),
      doTickFunction: (tower) => this.tickTollTower(tower),
    }
  };
  ProjectileTypes = {
    tires: {
      speed: 10,
      unusedObj: new Set(),
      defaultRotation: [0, 0, 0],
      objName: "projectile-tire",
    },
    spikes: {
      speed: 10,
      unusedObj: new Set(),
      objName: "projectile-spike",
      maxLifeTime: 10,
    }
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
    
    this.currentSpikes.forEach( (spike) => {
      this.tickSpike(spike);
    });
    

  }

  doAnimations(deltaTime) {
    this.currentProjectiles.forEach( (projectile) => {
      this.animateProjectiles(projectile, deltaTime);
    });
    this.currentSpikes.forEach( (spike) => {
      this.animateSpike(spike, deltaTime);
    });
  }

  showGhostTower() {
    
  }

  addProjectile(type, target, startPosition, damage, speed) {
    
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
      speed: speed,
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

    let stepDistance = Math.min(distance, projectile.speed * deltaTime);
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
    tower.speed = type.projectileSpeed;
  }

  tickTireTower(tower) {
    tower.timer += 1/60;
    let target = null;

    if (tower.timer >= tower.fireRate) {
      const position = tower.position;
      const enemiesInRange = this.enemyHandler.getEnemiesInRadius(position, tower.radius);

      if (enemiesInRange.length == 0) return;
      tower.timer = tower.timer % tower.fireRate;

      if (tower.mode == 1) {
        let closestIndex = indexOfSmallest(enemiesInRange.distances);
        target = enemiesInRange.enemies[closestIndex];
      }
      if (tower.mode == 2) {
        
      }
      if (tower.mode == 3) {
        let furthestIndex = indexOfLargest(enemiesInRange.liveTimes);
        target = enemiesInRange.enemies[furthestIndex];
      }

      this.addProjectile(this.ProjectileTypes.tires, target, tower.position, tower.damage, tower.speed);
    }


  }

  currentSpikes = new Set();

  addSpike(startPosition, possibleTiles) {
    if (possibleTiles.length == 0) {
      return;
    }

    const type = this.ProjectileTypes.spikes;
    let projectileObject = null;

    if (type.unusedObj.size > 0) {
      projectileObject = type.unusedObj.values().next().value;
      type.unusedObj.delete(projectileObject);
      projectileObject.position = [...startPosition];
      projectileObject.rotation = [0, 0, 0];
      projectileObject.scale = 1;
    } else {
      projectileObject = this.sceneInformation.addNewObject(
        type.objName,
        [...startPosition],
        [0, 0, 0],
        1
      );
    }

    projectileObject.position[1] = 0.5
    
    let random = Math.floor(Math.random() * possibleTiles.length);
    const targetPos = [...possibleTiles[random].inWorldTile.position];
    targetPos[0] += (Math.random() - 0.5) * 0.2;
    targetPos[1] = 0.1;
    targetPos[2] += (Math.random() - 0.5) * 0.2;

    let rotationSpeed = Math.random() * 1.2 + 0.2;
  
    const newSpike = {
      obj: projectileObject,
      targetPos: targetPos,
      lifeTime: 0,
      maxLifeTime: type.maxLifeTime,
      rotationSpeed: rotationSpeed,
      landed: false,
      type: type,
    }

    this.currentSpikes.add(newSpike);
  }

  tickSpike(spike) {
    spike.lifeTime += 1/60;
    if (spike.lifeTime > spike.maxLifeTime) {
      this.deleteSpike(spike);
    }

    const enemiesInRange = this.enemyHandler.getEnemiesInRadius(spike.obj.position, 0.2);
    if (enemiesInRange.enemies.length == 0) {
      return;
    }
    let random = Math.floor(Math.random() * enemiesInRange.enemies.length);
    const chosenTarget = enemiesInRange.enemies[random];

    if (chosenTarget.slowFactor <= 0.5) {
      return;
    }
    this.enemyHandler.slowEnemy(chosenTarget, 0.5);
    this.enemyHandler.damageEnemy(chosenTarget, 1);
    this.deleteSpike(spike);
  }

  deleteSpike(spike) {
      this.currentSpikes.delete(spike);
      spike.obj.scale = 0;
      this.ProjectileTypes.spikes.unusedObj.add(spike.obj);
  }

  animateSpike(spike, deltaTime) {
    if (spike.landed) {
      return;
    }
    
    spike.obj.rotation[1] += spike.rotationSpeed * deltaTime;
    const targetVec = vec3.create();
    vec3.sub(targetVec, spike.targetPos, spike.obj.position);
    let distance = Math.sqrt(vec3.dot(targetVec, targetVec));
    if (distance <= 1e-5) {
      spike.landed = true;
    }
    const type = spike.type;
    let stepSize = Math.min(type.speed * deltaTime, distance);
    vec3.normalize(targetVec, targetVec);
    vec3.scale(targetVec, targetVec, stepSize);
    vec3.add(spike.obj.position, spike.obj.position, targetVec);
  }

  initSpikesTower(tower) {
    const type = tower.type;
    tower.fireRate = type.defaultFireRate;
    tower.position = [...tower.inWorldObj.position];
    tower.timer = 0;
    const hexPos = this.playingField.squareToHexCoordinates({x: tower.position[0], y: tower.position[2]})
    let q = hexPos.q;
    let r = hexPos.r;
    tower.tile = this.playingField.tiles[q][r];
  }

  tickSpikesTower(tower) {
    tower.timer += 1/60;
    

    if (tower.timer >= tower.fireRate && !this.playingField.canPlaceTiles) {

      tower.timer = tower.timer % tower.fireRate;
      
      const possibleTargets = [];

      if (tower.tile.type.isRoad) {
        possibleTargets.push(tower.tile);
        possibleTargets.push(tower.tile);
      }

      for (let i = 0; i < 6; i++) {
        const tile = this.playingField.getTileFromExit(tower.tile, i)
        
        if (!tile.isPlaceHolder &&  tile.type.isRoad) {
          possibleTargets.push(tile);
        }
      }


      
      this.addSpike(tower.position, possibleTargets);
      
    }
  }

  initTollTower(tower) {
    const type = this.TowerTypes.toll;
    tower.fireRate = type.defaultFireRate;
    tower.radius = type.defaultRadius * tower.rangeM;
    tower.position = tower.inWorldObj.position;
    tower.timer = 0;
    tower.moneyPerCar = type.moneyPerCar;
  }

  tickTollTower(tower) {
    tower.timer += 1/60;

    if (tower.timer > tower.fireRate) {
      const position = tower.position;
      const enemiesInRange = this.enemyHandler.getEnemiesInRadius(position, tower.radius);
      this.addMoney(tower.moneyPerCar * enemiesInRange.enemies.length);
    }

    tower.timer = tower.timer % tower.fireRate;
  }



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
