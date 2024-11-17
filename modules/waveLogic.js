export function generateEnemyPattern(round) {
    // every 10th wave is a boss wave (just add 10 to normal round math)
    // more control over timing and enemy type
    // array of array of enemytypes 0 means no enemy this spawn tick
    // slowly increase density, diff for each type

    const maxRounds = 200;
    const turnSize = 36;
    const maxEmptySpawns = 8;
    
    const log8 = (num) => {return Math.floor(Math.log(num)/Math.log(3))+1}; 
    const lineardown = (num) => {return Math.floor(Math.max(maxRounds-round,0)/maxRounds * maxEmptySpawns)};
    const slowingdown = (num) => {return Math.floor(maxEmptySpawns* (1-Math.atan(round)/Math.PI))}
    const minBonus = (num) => {return Math.max(round + 15, Math.floor(round*1.2))}


    if (round < 0) {
      return [];
    }
    if (round % 10 == 0) {
      round = minBonus(round);
    }

    let enemyPattern= [];

    const maxEnemyType = Math.min(log8(round), 4); // scale enemy type with powers of eight
    let enemyDensity = [slowingdown(round)]; // the time (empty spawns) till the next enemy for each type
    console.log(`max Type: ${maxEnemyType}`);
    for (let i = 1; i < 4; i++) {
      const density = Math.floor(enemyDensity[i-1]*1.5);
      enemyDensity.push(density);
    }
    
    const turns = Math.ceil(round/7);

    let seed = round;
    for (let i = 0; i < turns; i++) {
      let turn = new Array(turnSize).fill(0);
      seed = pseudoRandom(seed);
      const enemyType = Math.floor(seed * maxEnemyType) + 1;
      const enemyCount = Math.floor(turnSize/enemyDensity[enemyType]);
      for (let j = 0; j < enemyCount; j++) {
        turn[j*enemyDensity[enemyType]] = enemyType;
      }
      enemyPattern.push(turn);
    }
    return enemyPattern;

}

function pseudoRandom(seed) {
  const a = 1664525;  // Multiplier (a large prime)
  const c = 1013904223;  // Increment (large prime)
  const m = Math.pow(2, 32);  // Modulus (2^32)

  // Update the seed
  seed = (a * seed + c) % m;

  // Return the normalized pseudo-random number (0 to 1)
  return seed / m;
}