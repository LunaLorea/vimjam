import { checkSphereIntersection } from "./transformScreenToWorldPosition.js";
import { addShopItem } from "./uiHook.js";

export default class Shop {
    
  Items = {
    towers: {
      tireTirade: {
        identifier: "tire",
        price: 150,
      },
      toll: {
        identifier: "toll",
        price: 500,},
      spikes: {
        identifier: "spikes",
        price: 250,},
      sniper: {
        identifier: "sniper",
        price: 300,},
    },
    tiles: {
      empty: {
        identifier: "empty",
        price: 100,},
      audience: {
        identifier: "audience",
        price: 50,}
    },

  }

  constructor(playingField, sceneInformation, towerHandler) {
    this.playingField = playingField;
    this.sceneInformation = sceneInformation;
    this.towerHandler = towerHandler;
    this.money = 250; // starting money

    this.itemBought;
    document.getElementById("gl-canvas").addEventListener("mousedown", () => {this.placeTower();});
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

  addMoney = (amount) => {
    if (amount < 0) {
      console.error("adding negative amount to money is called stealing");
    }
    this.money += amount;
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
      this.itemBought = item;
      
      if (this.itemBought in this.Items.tiles) {
        const tileIdentifier = this.Items.tiles[this.itemBought].identifier;
        const type = this.playingField.TileTypes[tileIdentifier];
        this.playingField.shopTile = type;
        console.log(tileIdentifier, type, this.playingField.shopTile);
      }
      this.playingField.shopTile
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

      const availableSlots = Array.from(this.playingField.availableSlots);
      let chosenSlot = null;

      for (let i = 0; i < availableSlots.length; i++) {
        const slot = availableSlots[i];
        if (checkSphereIntersection(slot.position, slot.scale, this.sceneInformation.mouseRay)) {
          chosenSlot = slot;
          break;
        }
      }
      
      if (chosenSlot == null) {
        /*tmp*/
        console.log("couldn't place");
        /*tmp*/
        return;
      }
      
      console.log(this.towerHandler.TowerTypes[towerIdentifier]);


      if (this.money < price) {
        console.error("trying to place, to expensive object")
        return
      }
      this.money -= price; // to always deduct money before placing, to avoid potential glitches
      this.towerHandler.addNewTower(this.towerHandler.TowerTypes[towerIdentifier], chosenSlot);
    }
    else if(this.itemBought in this.Items.tiles) {
      // copied but translated from the tower placing branch
      const tileIdentifier = this.Items.tiles[this.itemBought].identifier;
      const price = this.Items.tiles[this.itemBought].price;

      //TODO: find where to place
      const mouseCoord = {
        x: this.sceneInformation.mouseInWorld[0],
        y: this.sceneInformation.mouseInWorld[2],
      }
      const tileCoord = this.playingField.squareToHexCoordinates(mouseCoord);
      let q = tileCoord.q;
      let r = tileCoord.r;

      if (!(this.playingField.tiles[q] == undefined || this.playingField.tiles[q][r] == undefined)) {
        console.log("Tile is already occupied");
        return;
      }
      if ( !(
          this.playingField.availableTiles[q] == undefined || 
          this.playingField.availableTiles[q][r] == undefined
        )
      ) {
        console.log("Tile is a potential place for a road");
        return;
      }
      
      const type = this.playingField.TileTypes[tileIdentifier];
      const rotation = this.playingField.rotateTileCount % 6;
      console.log(rotation);
      if (this.money < price) {
        console.error("trying to place, to expensive object")
        return
      }
      this.money -= price; // to always deduct money before placing, to avoid potential glitches
      const newTile = this.playingField.createNewTile(type, rotation, tileCoord);
      
      if (newTile == null) {
        /*tmp*/
        console.log("couldn't place");
        /*tmp*/
        return;
      }

      
    }
    else {
      console.log(`no such item: ${this.itemBought}`);
      return;
    }
    this.itemBought = undefined;
    this.playingField.shopTile = null;
    
  }

}
