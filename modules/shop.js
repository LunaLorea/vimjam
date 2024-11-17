import { addShopItem } from "./uiHook.js";

export default class Shop {
    
  Items = {
    towers: {
      tireTirade: {
        identifier: "tire",
        price: 100,
      },
      toll: {
        identifier: "toll",
        price: 100,},
      spikes: {
        identifier: "spikes",
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
    this.itemBought;
    addEventListener("mousedown", () => {this.placeTower();});
    this.initShop();
  }

  initShop = () => {
    let category = 1;
    for (let tower in this.Items.towers) {
      const identifier = this.Items.towers[tower].identifier;
      const price = this.Items.towers[tower].price;
      const buyingFunc = () => {this.buyItem(tower)};
      addShopItem(identifier, price, category, buyingFunc);
    }
    category = 2;
    for (let tile in this.Items.tiles) {
      const identifier = this.Items.tiles[tile].identifier;
      const price = this.Items.tiles[tile].price;
      const buyingFunc = () => {this.buyItem(tile)};
      addShopItem(identifier, price, category, buyingFunc);
    }
  }

  buyItem = (item) => { // item is a tower/tile type as in the dict above
    const towers = this.Items["towers"];
    const tiles = this.Items["tiles"];
    let price;
    if (item in towers) {
      price = towers[item].price;
    }
    else if (item in tiles) {
      price = tiles[item].price;
    }
    else {
      console.log(`no such item in the shop: ${item}`);
      return false;
    }
    if (this.money >= price) {
      // TODO: push tower to top of towers bought stack? (or a single one)
      this.itemBought = item;
      return true;
    }
    else {
      console.log("am broke");
      return false;
    }
  }

  placeTower = () => {
    if (this.itemBought == undefined) {
      console.log("no item selected");
      return;
    }
    if (this.itemBought in this.Items.towers) {

      const towerIdentifier = this.Items.towers[this.itemBought].identifier;
      const price = this.Items.towers[this.itemBought].price;

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

      this.money -= price; // to always deduct money before placing, to avoid potential glitches
      this.towerHandler.addNewTower(this.towerHandler.TowerTypes[towerIdentifier], chosenSlot);
    }
    else if(this.itemBought in this.Items.tiles) {
      // TODO: place non road tile
      console.log("imagine placing a bought tile, removing it for free");
    }
    else {
      console.log(`no such item: ${this.itemBought}`);
      return;
    }
    this.itemBought = undefined;
    
  }

}
