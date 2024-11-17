import { queuePop, queueAppend, queueActiveLength } from "./uiHook.js";

export default class PlayingField {

  TileTypes = {
    start: {
      exits: [3, 0],
      objName: "hexagonal-plate-start",
      defaultRotation: 0,
      hasEntrance: true,
      slots: [],
      ghostTile: {},
    },
    startFlag: {
      exits: [],
      objName: "hexagonal-plate-flag",
      defaultRotation: 0,
      hasEntrance: true,
      slots: [],
      ghostTile: {},
    },
    empty: {
      exits: [],
      objName: "hexagonal-plate-empty",
      defaultRotation: 0,
      hasEntrance: false,
      slots: [{
        rotation: [0, 0, 0],
        relPosition: {x: 0, y:0.1, z:0},
        damageMultiplier: 1.5,
        rangeMultiplier: 1,
        scale: 1.7,
      }],
      ghostTile: {},
    },
    audience: {
      exits: [],
      objName: "hexagonal-plate-audience",
      defaultRotation: 3,
      hasEntrance: false,
      slots: [{
        rotation: [0, 0, 0],
        relPosition: {x: 0, y:0.52, z:-0.28},
        damageMultiplier: 1,
        rangeMultiplier: 1.5,
        scale: 0.9,
      }],
      ghostTile: {},
    },
    stop: {
      exits: [],
      objName: "hexagonal-plate-stop",
      defaultRotation: 3,
      hasEntrance: true,
      slots: [{
        rotation: [0, 0, 0],
        relPosition: {x: 0, y:0, z:0},
        damageMultiplier: 0.75,
        rangeMultiplier: 0.75,
        scale: 1,
      }],
      ghostTile: {},
    },
    straight: {
      exits: [3],
      objName: "hexagonal-plate-straight",
      defaultRotation: 0,
      hasEntrance: true,
      slots: [{
        rotation: [0, 1, 0],
        relPosition: {x: 0.72, y:0.2, z:0},
        damageMultiplier: 0.5,
        rangeMultiplier: 0.5,
        scale: 0.7,
      },
      {
        rotation: [0, 1, 0],
        relPosition: {x: -0.72, y:0.2, z:0},
        damageMultiplier: 0.5,
        rangeMultiplier: 0.5,
        scale: 0.7,
      } ],
      ghostTile: {},
    },
    curve_right: {
      exits: [4],
      objName: "hexagonal-plate-curve",
      defaultRotation: 2,
      hasEntrance: true,
      slots: [{
        relPosition: {x: -0.4, y:0.1, z:-0.4},
        rotation: [0, 0, 0],
        damageMultiplier: 1,
        rangeMultiplier: 1,
        scale: 0.75,
      }],
      ghostTile: {},
    },
    curve_left: {
      exits: [2],
      objName: "hexagonal-plate-curve",
      defaultRotation: -2,
      hasEntrance: true,
      slots: [{
        rotation: [0, 0, 0],
        relPosition: {x: 0.4, y:0.1, z:-0.34},
        damageMultiplier: 1,
        rangeMultiplier: 1,
        scale: 1,
      }],
      ghostTile: {},
    },
    split: {
      exits: [2, 4],
      objName: "hexagonal-plate-split",
      defaultRotation: 1,
      hasEntrance: true,
      slots: [],
      ghostTile: {},
    }
  };

  #RoadTypes = ["straight", "curve_right", "curve_left", "split", "stop", ];

  allAvailableMarkers = [];


  #exitCoordMap = new Map();

  constructor(sceneInformation) {
    this.sceneInformation = sceneInformation;
    this.tileCount = 0;
    this.tiles = [];
    this.availableTiles = [];
    this.leaves = 2;
    this.canPlaceTiles = true;
    this.placeableTileCount = 2;

    this.rotateTileCount = 0;
    addEventListener("keydown", () => {
      if (sceneInformation.getKeyValue("rotate") == 1) {
       this.rotateTileCount += 1;
      }
    });

    sceneInformation.addNewObject(
        "flag",
        [0, 0.2, -2.4],
        [0, 0, 0],
        0.65, );
    sceneInformation.addNewObject(
        "flag",
        [0, 0.2, 2.4],
        [0, 0, 0],
        0.65, );


    this.nextTiles = [];
    this.generateNextTile(4);
    queueActiveLength(this.placeableTileCount);

    this.#exitCoordMap.set(0, [0, 1]);
    this.#exitCoordMap.set(1, [-1, 1]);
    this.#exitCoordMap.set(2, [-1, 0]);
    this.#exitCoordMap.set(3, [0, -1]);
    this.#exitCoordMap.set(4, [1, -1]);
    this.#exitCoordMap.set(5, [1, 0]);

    this.startTile0 = this.createNewTile(this.TileTypes.start, 0, {q: 0, r: 0});
    this.startTile1 = this.createNewTile(this.TileTypes.audience, 4, {q: -1, r: 1});
    this.startTile2 = this.createNewTile(this.TileTypes.empty, 5, {q: -1, r: 0});
    this.startTile3 = this.createNewTile(this.TileTypes.straight, 3, {q: 0, r: 1});
    this.startTile3.parentTile = this.startTile0;
    this.startTile3.parentExit = 0;
    this.startTile4 = this.createNewTile(this.TileTypes.empty, 2, {q: 1, r: 0});
    this.startTile5 = this.createNewTile(this.TileTypes.audience, 1, {q: 1, r: -1});
    this.startTile6 = this.createNewTile(this.TileTypes.straight, 0, {q: 0, r: -1});
    this.startTile6.parentTile = this.startTile0;
    this.startTile6.parentExit = 3;
      
    this.placeRandomTiles();

    this.initGhostTiles();

    document.getElementById("gl-canvas").addEventListener("mousedown", () => {
      sceneInformation.mouseMoved = false;
    });
    document.getElementById("gl-canvas").addEventListener("mouseup", () => {
      if (!sceneInformation.mouseMoved) {
        this.placeNewTile();
      }
    });
  }

  availableSlots = new Set();

  billboard = {
    unusedObj: [],
    objName: "deko-billboard",
  }

  placeRandomTiles() {
    console.log(tiles);
    const random = Math.random() * 30 + 10;
    for (let i = 0; i < random; i++) {
      let coords = this.squareToHexCoordinates({x: Math.random*100,y: Math.random*100});
      let rotation = Math.floor(Math.random * 6);
      console.log(coords, rotation);
      this.createNewTile(this.TileTypes.empty, rotation, coords);
    }


  }

  addBillBoard(slot) {

    let obj = null;
    let scale = 0.4;

    if (this.billboard.unusedObj.length > 0) {
      obj = this.billboard.unusedObj.pull();
      obj.position = slot.position;
      obj.rotation = slot.rotation;
      obj.scale = slot.scale * scale;
    } else {
      obj = this.sceneInformation.addNewObject(
        this.billboard.objName,
        slot.position,
        slot.rotation, 
        slot.scale * scale,
      )
    }

    slot.billboard = obj;
  }

  removeBillBoard(slot) {
    const obj = slot.billboard;
    slot.billboard = null;
    obj.scale = 0;
  }

  activateTilePlacing(tileAmount = 3) {
    this.canPlaceTiles = true;
    this.placeableTileCount += tileAmount;
    queueActiveLength(this.placeableTileCount);
    this.allAvailableMarkers.forEach((marker) => {
      marker.alpha = 0.8;
    });
  }

  deactivateTilePlacing() {
    this.canPlaceTiles = false;
    this.allAvailableMarkers.forEach((marker) => {
      marker.alpha = 0;
    });
  }

  createNewTile(type, rotation, coordinates) {
    let tileHeight = 0;

    const squareCoordinates = this.hexToSquareCoordinates(coordinates);
    const newTile = {
      inWorldTile: this.sceneInformation.addNewObject(
        type.objName,
        [squareCoordinates.x, tileHeight, squareCoordinates.y],
        [0, -(rotation + type.defaultRotation) * 2/3, 0], 1),
      type: type,
      rotation: rotation,
      coordinates: coordinates,
      worldCoordinates: this.hexToSquareCoordinates(coordinates),
      children: new Set([...type.exits]),
      parentTile: null,
      slots: [...type.slots],
    }

    let tilePos = newTile.inWorldTile.position;
    let tileRot = newTile.inWorldTile.rotation;

    newTile.slots.forEach( (slot) => {
      const relPos = vec3.create();
      vec3.rotateY(relPos, [slot.relPosition.x, slot.relPosition.y, slot.relPosition.z], [0, 0, 0], - newTile.rotation );
      slot.position = vec3.create();
      vec3.add(slot.position, relPos, tilePos);
      const clone = structuredClone(slot);
      vec3.add(clone.rotation, clone.rotation, tileRot);
      this.availableSlots.add(clone);
      this.addBillBoard(clone);
    });


    newTile.neighbors = this.findNeighborsOfTile(newTile);

    this.tileCount += 2;

    let q = coordinates.q;
    let r = coordinates.r;

    if (this.tiles[q] == undefined) {
      this.tiles[q] = [];
    } 
    if (this.tiles[q][r] == undefined) {
      this.tiles[q][r] = newTile;
      return newTile;
    } else {
      throw Error("This tile already exists");
    }
  }

  findNeighborsOfTile(tile) {
    const neighbors = [];
    // ToDo find neighbors
    tile.children.forEach( (exit) => {
      let relativeExit = (exit + tile.rotation) % 6;
      let relativeCoords = this.#exitCoordMap.get(relativeExit);
      let q = relativeCoords[0] + tile.coordinates.q;
      let r = relativeCoords[1] + tile.coordinates.r;
      let absoluteCoords = this.hexToSquareCoordinates({q: q, r: r});
      if (!((this.tiles[q] == undefined) || this.tiles[q][r] == undefined)) { 
        return;
      }
      if (this.availableTiles[q] == undefined) {
        this.availableTiles[q] = [];
      }
      if (this.availableTiles[q][r] == undefined) {
        this.availableTiles[q][r] = {
          parents: [(relativeExit+3) % 6],
          parentTiles: [tile],
          parentExits: [exit],
          obj: this.sceneInformation.addNewObject(
            "available",
            [absoluteCoords.x, 0, absoluteCoords.y],
            [0, 0, 0], 0.8
          ),
        };
        this.allAvailableMarkers.push(this.availableTiles[q][r].obj);
      } else {
        this.availableTiles[q][r].parents.push((relativeExit+3)%6);
        this.availableTiles[q][r].parentTiles.push(tile);
        this.availableTiles[q][r].parentExits.push(exit);
      }
      this.availableTiles[q][r].obj.alpha = 0.32;
    });
     
    return neighbors;
  }

  initGhostTiles() {
    for (const typeName in this.TileTypes) {
      const type = this.TileTypes[typeName];
      const obj = this.sceneInformation.addNewObject(
        type.objName,
        [0, 0, 0],
        [0, type.defaultRotation * 2/3, 0], 
        0
      );
      type.ghostTile = obj;
      obj.alpha = 0.3;
    }
  }

  doAnimations() {
    if (this.sceneInformation.mouseInWorld == undefined || !this.canPlaceTiles) {
      return;
    }

    if (this.currentGhostTile != null) {
      this.currentGhostTile.scale = 0;
      this.currentGhostTile = null;
    }

    const mouseCoord = {
      x: this.sceneInformation.mouseInWorld[0],
      y: this.sceneInformation.mouseInWorld[2],
    }

    const tileCoord = this.squareToHexCoordinates({x: mouseCoord.x, y: mouseCoord.y});
    let q = tileCoord.q;
    let r = tileCoord.r;

    if (!(this.tiles[q] == undefined || this.tiles[q][r] == undefined)) {
      return;
    }

    if (this.availableTiles[q] == undefined || this.availableTiles[q][r] == undefined) {
      return;
    }

    const squareCoords = this.hexToSquareCoordinates(tileCoord)
    let x = squareCoords.x;
    let y = squareCoords.y;

    const tileType = this.nextTiles[0];
    const parentTileEntrances = this.availableTiles[q][r].parents;
    let chosenParent = this.rotateTileCount % parentTileEntrances.length;
    const rotation = -(parentTileEntrances[chosenParent] + tileType.defaultRotation) * 2/3;

    this.currentGhostTile = tileType.ghostTile;
    this.currentGhostTile.scale = 1;
    this.currentGhostTile.position = [x, 0, y];
    this.currentGhostTile.rotation = [0, rotation, 0];
  }
  currentGhostTile = this.TileTypes.straight.ghostTile;

  showGhostTile() {
    
  }


  placeNewTile() {

    if (!this.canPlaceTiles) {
      return;
    }

    const coords = {
      x: this.sceneInformation.mouseInWorld[0],
      y: this.sceneInformation.mouseInWorld[2],
    };



    const hexCoords = this.squareToHexCoordinates(coords);

    let q = hexCoords.q;
    let r = hexCoords.r;

    if ( !((this.tiles[q] == undefined) || this.tiles[q][r] == undefined) || 
          this.availableTiles[q]== undefined || 
          this.availableTiles[q][r] == undefined
        ) {
      return;
    }

    
    const availableTile = this.availableTiles[q][r];
    const parentTileEntrances = this.availableTiles[q][r].parents;
    let chosenParent = this.rotateTileCount % parentTileEntrances.length;
    // ToDo remove
    const tile = this.getNextTile();
    let newTile;
    try {
      newTile = this.createNewTile(tile, parentTileEntrances[chosenParent], hexCoords);
    } catch {}
    newTile.parentTile = availableTile.parentTiles[chosenParent];
    newTile.parentExit = availableTile.parentExits[chosenParent];
    

    if (tile == this.TileTypes["split"]) {
      this.leaves += 1;
    }
    if (tile == this.TileTypes["stop"]) {
      this.leaves -= 1;
      this.removeBranch(newTile);
    }
    this.placeableTileCount -= 1;
    queueActiveLength(this.placeableTileCount);
    if (this.placeableTileCount <= 0) {
      this.deactivateTilePlacing();
    }

  }

  generateNextTile(count = 1) {
    queuePop(); //in UI
    for (let i = 0; i < count; i++) {
      let stopOffset = 0;
      if (this.leaves > 5) {
        stopOffset = 1;
      }
      let keyTypes = this.#RoadTypes;
      let randomIndex = Math.floor(Math.random() * (keyTypes.length-1 + stopOffset))
      let tileName=[keyTypes[randomIndex]];
      this.nextTiles.push(this.TileTypes[tileName]);
      queueAppend(tileName);
    }
  }

  getNextTile() {
    const nextTile = this.nextTiles.shift();
    this.generateNextTile();
    return nextTile;
  }

  getTileFromExit(tile, exit) {
    let rotation = (exit + tile.rotation) % 6;
    const tilePos = tile.coordinates;
    const relPos = this.#exitCoordMap.get(rotation);
    let q = tilePos.q + relPos[0];
    let r = tilePos.r + relPos[1];
    if (this.tiles[q] == undefined || this.tiles[q][r] == undefined) {
      let squareCoordinates = this.hexToSquareCoordinates({q: q, r: r});
      const placeHolderTile = {
        worldCoordinates: squareCoordinates,
      };
      return placeHolderTile;
    }
    return this.tiles[q][r];

  }

  removeBranch(stopTile) {
    this.removeExitRecursivly(stopTile.parentTile, stopTile.parentExit);
  }

  removeExitRecursivly(tile, exit) {
    tile.children.delete(exit);
    if (tile.children.size > 0) {
      return;
    }
    this.removeExitRecursivly(tile.parentTile, tile.parentExit);
  }
  

  squareToHexCoordinates(coords) {
    let size = 1;
    var q = ( 2./3 * coords.x                  ) / size
    var r = (-1./3 * coords.x  +  Math.sqrt(3)/3 * coords.y) / size

    return {q: Math.round(q), r: Math.round(r)};
  }

  hexToSquareCoordinates(coords) {
    let size = 1;
    var x = size * (     3./2 * coords.q                    )
    var y = size * (Math.sqrt(3)/2 * coords.q  +  Math.sqrt(3) * coords.r)
    return {x: x, y: y};
  }


  placeRandomTiles(amount) {
    for (let i = 0; i < amount; i++) {
      this.placeNewTile()
    }
  }

}
