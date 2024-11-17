import { addShopItem } from "./uiHook.js";

export default class Shop {
    
  Items = {
    towers: {
      tireTirade: {
        identifier: "tire",
        price: 100,
      },
      toll: {
        identifier: "tire",
        price: 100,},
      spikes: {
        identifier: "tire",
        price: 100,},
    },
    tiles: {
      empty: {
        identifier: "empty",
        price: 100,},
    },

  }

  constructor(playingField, sceneInformation, towerHandler) {
    this.playingField = playingField;
    this.sceneInformation = sceneInformation;
    this.towerHandler = towerHandler;
    this.money = 1000; // starting money
    this.towerBought;
    addEventListener("mousedown", () => {this.placeTower();});
    this.initShop();
  }

  initShop = () => {
    let category = 1;
    for (let tower in this.Items.towers) {
      const identifier = this.Items.towers[tower].identifier;
      const price = this.Items.towers[tower].price;
      const buyingFunc = () => {this.buyTower(tower)};
      addShopItem(identifier, price, category, buyingFunc);
    }
    category = 2;
    for (let tile in this.Items.tiles) {
      const identifier = this.Items.tiles[tile].identifier;
      const price = this.Items.tiles[tile].price;
      const buyingFunc = () => {console.log("buying tiles, not yet implemented")};
      addShopItem(identifier, price, category);
    }
  }

  buyTower = (tower) => { // tower is a tower type as in the dict above
    const towers = this.Items["towers"];
    if (!(tower in towers)) {
      console.log(`no such tower in the shop: ${tower}`);
      return false;
    }
    const price = towers[tower].price;
    if (this.money >= price) {
      // TODO: push tower to top of towers bought stack? (or a single one)
      this.towerBought = tower;
      return true;
    }
    console.log("am broke");
    return false;
  }

  placeTower = () => {
    if (this.towerBought == undefined) {
      console.log("no tower selected");
      return;
    }
    if (!(this.towerBought in this.Items.towers)) {
      console.log(`no such tower: ${this.towerBought}`);
      return;
    }
    const towerIdentifier = this.Items.towers[this.towerBought].identifier;
    const price = this.Items.towers[this.towerBought].price;

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
      /*tmp*/
      console.log("couldn't place");
      /*tmp*/
      return;
    }

    // TODO: remove available tower from towersBought
    this.money -= price;
    this.towerBought = undefined;
    this.towerHandler.addNewTower(this.towerHandler.TowerTypes[towerIdentifier], chosenSlot);
  }

}
