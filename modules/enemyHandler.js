export default class EnemyHandler {
  
  enemyTypes  = {
    formula1: {
      speed: 5,
      health: 3,
      
      objName: "enemy-formula1",
      unusedObjects: new Set(),
      trackHeight: 0.2,
      defaultRotation: 3,
    },
  }

  currentEnemies = new Set();


  constructor(playingField, sceneInformation) {
    this.playingField = playingField;
    this.sceneInformation = sceneInformation;
    this.spawnNewEnemy(this.enemyTypes.formula1);

  }

  getEnemiesInRadius(position, radius) {
    const enemiesInRange = {
      enemies: [],
      distances: [],
    };
    const distanceVector = vec3.create();
    this.currentEnemies.forEach( (enemy) => {
      vec3.sub(distanceVector, position, enemy.inWorldEnemy.position)
      let distance = Math.sqrt(vec3.dot(distanceVector, distanceVector));
      if (distance <= radius) {
        enemiesInRange.enemies.push(enemy);
        enemiesInRange.distances.push(distance);
      }
    });

    return enemiesInRange;

  }

  damageEnemy(enemy, damage) {
    enemy.health -= damage;
    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy) {
    const obj = enemy.inWorldEnemy;
    obj.alpha = 0;
    this.enemyTypes.formula1.unusedObjects.add(obj);
    this.currentEnemies.delete(enemy);
  }

  slowEnemy(enemy, slowfactor) {
    enemy.slowFactor = max(slowfactor, enemy.slowfactor);
  }

  spawnNewEnemy(type) {
    let startPosition = [0, type.trackHeight, 0];
    const newEnemie = {
      health: type.health,
      speed: type.speed,
      slowFactor: 1,
      type: type,
      currentTile: this.playingField.startTile0,
    }



    if (type.unusedObjects.size > 0) {
      newEnemie.inWorldEnemy = type.unusedObjects.values().next().value;
      type.unusedObjects.delete(newEnemie.inWorldEnemy);
      newEnemie.inWorldEnemy.position = startPosition; 
      newEnemie.inWorldEnemy.alpha = 1;
    } 
    else {
      newEnemie.inWorldEnemy = this.sceneInformation.addNewObject(
        type.objName,
        [0, type.trackHeight, 0],
        [0, 0, 0],
        0.34
      );
    }

    this.currentEnemies.add(newEnemie);
  }

  doTick() {
    this.currentEnemies.forEach( (enemy) => {
      if (enemy.distanceToTargetTile <= 1e-5) {

        const exits = enemy.currentTile.children;
        let random = Math.floor(Math.random() * exits.length);
        if (exits.length == 0) {
          return;
        }
        const nextTile = this.playingField.getTileFromExit(enemy.currentTile, exits[random]);
        if (nextTile == undefined || nextTile.rotation != (3 + exits[random]+enemy.currentTile.rotation) % 6 || !nextTile.type.hasEntrance) {
          return;
        }
        enemy.inWorldEnemy.rotation[1] = -(nextTile.rotation + enemy.type.defaultRotation) % 6 * 2/3;
        enemy.currentTile = nextTile;
      }
    });
  }

  doAnimations(deltaTime) {
    
    this.currentEnemies.forEach( (enemy) => {
      const enemyPos = enemy.inWorldEnemy.position;
      const targetPos = [
        enemy.currentTile.worldCoordinates.x, enemy.type.trackHeight, enemy.currentTile.worldCoordinates.y
      ];
      const targetVector = vec3.create();
      vec3.sub(targetVector, targetPos, enemyPos);
      enemy.distanceToTargetTile = Math.sqrt(vec3.dot(targetVector, targetVector));
      
      let stepDistance = 
        enemy.type.speed *
        enemy.slowFactor * 
        deltaTime * 
        (0.4 + (0.5 * Math.sin(enemy.distanceToTargetTile / 1.72092 * Math.PI)));
      

      vec3.normalize(targetVector, targetVector);
      vec3.scale(targetVector, targetVector, Math.min(stepDistance, enemy.distanceToTargetTile));
      vec3.add(enemyPos, enemyPos, targetVector)

    });
    
  }
}
