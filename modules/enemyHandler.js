export default class EnemyHandler {
  
  enemyTypes  = {
    formula1: {
      speed: 5,
      health: 1,
      
      objName: "enemy-formula1",
      unusedObjects: [],
      trackHeight: 0.2,
    },
  }

  currentEnemies = [];


  constructor(playingField, sceneInformation) {
    this.playingField = playingField;
    this.sceneInformation = sceneInformation;
    this.spawnNewEnemy(this.enemyTypes.formula1);

  }

  spawnNewEnemy(type) {
    let startPosition = [0, type.trackHeight, 0];
    const newEnemie = {
      type: type,
      currentTile: this.playingField.startTile3,
    }



    if (type.unusedObjects.length > 0) {
      newEnemie.inWorldEnemy = type.unusedObjects.pull();
      newEnemie.inWorldEnemy.position = startPosition; 
    } 
    else {
      newEnemie.inWorldEnemy = this.sceneInformation.addNewObject(
        type.objName,
        [0, type.trackHeight, 0],
        [0, 0, 0],
        0.5
      );
    }

    this.currentEnemies.push(newEnemie);
  }

  doTick() {
    this.currentEnemies.forEach( () => {
      
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
      
      let stepDistance = enemy.type.speed * deltaTime * (0.1 + Math.sin(enemy.distanceToTargetTile / 1.72092 * Math.PI));
      

      vec3.normalize(targetVector, targetVector);
      vec3.scale(targetVector, targetVector, Math.min(stepDistance, enemy.distanceToTargetTile));
      console.log(Math.min(stepDistance, enemy.distanceToTargetTile));
      vec3.add(enemyPos, enemyPos, targetVector)

    });
    
  }
}
