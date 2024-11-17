export default class Shop {
    
  Items = {
    towers: {
      tireTirade: {
        price: 100,
      },
      toll: {},
      spikes: {},
    },
    tiles: {
      empty: {},
    },

  }

  constructor(playingField, sceneInformation, towerHandler) {
    this.playingField = playingField;
    this.sceneInformation = sceneInformation;
    this.towerHandler = towerHandler;
    this.money = 1000;
    addEventListener("mousedown", () => this.placeTower() );
  }

  placeTower = () => {
    if (this.money < 100) {
      return;
    }
    const availableSlots = this.playingField.availableSlots;
    let chosenSlot = null;
    availableSlots.forEach( (slot) => {
      const distVec = vec3.create();
      let tempPos = [...slot.position];
      tempPos[1] = 0;
      vec3.sub(distVec, tempPos, this.sceneInformation.mouseInWorld);
      let distance = Math.sqrt(vec3.dot(distVec, distVec));
      if (distance <= 0.38) {
        chosenSlot = slot;
      }
    });
    
    if (chosenSlot == null) {
      return;
    }
    this.money -= 100;
    this.towerHandler.addNewTower(this.towerHandler.TowerTypes.tire, chosenSlot);
  }

}
