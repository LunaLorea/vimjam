export function generateEnemyPattern(round) {
    // how long is a wave? → dep on pattern generated, plus hard limit
    // no long brakes
    // overtime increase amounts, allow more types, decrease entropy
    // how do we trigger the spawn of an enemy?
        // check if enemy spawns each tick
        // we generate a spawnbitmask in groups of 32 ( the right shift should convert number to ints)
            // number of masks depends on number of turns, calc from rounds
    
    const turns = Math.floor(round/10 + 1);
    let maxEnemiesPerTurn = Math.atan(round)/Math.PI*32;
    const minEnemiesPerTurn = Math.round(maxEnemiesPerTurn/2);
    const maxTotalEnemies = round%10==0? turns * maxEnemiesPerTurn : Math.round(0.8 * turns * maxEnemiesPerTurn);

    let enemyPattern= [];
    let enemyCount=0;
    for (let i = 0; i < turns; i++) {
        maxEnemiesPerTurn = Math.min(maxTotalEnemies-enemyCount, maxEnemiesPerTurn);
        let mask = generateIntWithOnes(minEnemiesPerTurn, maxEnemiesPerTurn);
        enemyPattern[i] = mask;
        enemyCount += countBits(mask);
    }
    return enemyPattern;

}

function generateIntWithOnes(minOnes, maxOnes, maxBits = 31) {
    // Ensure the maxOnes is not greater than the maxBits
    maxOnes = Math.min(maxOnes, maxBits);
    let ones=Math.random()*(maxOnes-minOnes) + minOnes;
    let number = 2^(ones+1)-1;
    /*
    // Generate a random number of 1s (<= maxOnes, >= minOnes)
    for (let i = 0; i < minOnes; i++) {
        const bitPosition = Math.floor(Math.random() * maxBits);
        number += (1 << bitPosition);  // Set the bit at the random position (with overflow)
      }
    for (let i = 0; i < maxOnes-minOnes; i++) {
      const bitPosition = Math.floor(Math.random() * maxBits);
      number |= (1 << bitPosition);  // Set the bit at the random position
    }
    */
    return number;
}

//gpt hallucinations:
function countBits(num) {
    return num.toString(2).split('1').length - 1;
}