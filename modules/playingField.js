import { queuePop, queuePush } from "./uiHook.js";

export default class PlayingField {

  #TileTypes = {
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
        relPosition: {x: 0, y:0, z:0},
        damageMultiplier: 2,
        rangeMultiplier: 1,
        scale: 2,
      }],
      ghostTile: {},
    },
    audience: {
      exits: [],
      objName: "hexagonal-plate-audience",
      defaultRotation: 3,
      hasEntrance: false,
      slots: [{
        relPosition: {x: 0, y:0.4, z:-0.3},
        damageMultiplier: 1,
        rangeMultiplier: 1.5,
        scale: 1,
      }],
      ghostTile: {},
    },
    stop: {
      exits: [],
      objName: "hexagonal-plate-stop",
      defaultRotation: 3,
      hasEntrance: true,
      slots: [{
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
        relPosition: {x: 0.72, y:0.1, z:0},
        damageMultiplier: 0.5,
        rangeMultiplier: 0.5,
        scale: 0.7,
      },
      {
        relPosition: {x: -0.72, y:0.1, z:0},
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
        relPosition: {x: 0.4, y:0.1, z:0.4},
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
    this.placeableTileCount = 6;

    this.rotateTileCount = 0;
    addEventListener("keydown", () => {
      if (sceneInformation.getKeyValue("rotate") == 1) {
       this.rotateTileCount += 1;
      }
    });

    this.nextTiles = [];
    this.generateNextTile(4);

    this.#exitCoordMap.set(0, [0, 1]);
    this.#exitCoordMap.set(1, [-1, 1]);
    this.#exitCoordMap.set(2, [-1, 0]);
    this.#exitCoordMap.set(3, [0, -1]);
    this.#exitCoordMap.set(4, [1, -1]);
    this.#exitCoordMap.set(5, [1, 0]);

    this.startTile0 = this.createNewTile(this.#TileTypes.start, 0, {q: 0, r: 0});
    this.startTile1 = this.createNewTile(this.#TileTypes.audience, 4, {q: -1, r: 1});
    this.startTile2 = this.createNewTile(this.#TileTypes.audience, 5, {q: -1, r: 0});
    this.startTile3 = this.createNewTile(this.#TileTypes.straight, 3, {q: 0, r: 1});
    this.startTile4 = this.createNewTile(this.#TileTypes.audience, 2, {q: 1, r: 0});
    this.startTile5 = this.createNewTile(this.#TileTypes.audience, 1, {q: 1, r: -1});
    this.startTile6 = this.createNewTile(this.#TileTypes.straight, 0, {q: 0, r: -1});

    addEventListener("mousedown", () => {
      sceneInformation.mouseMoved = false;
    });
    addEventListener("mouseup", () => {
      if (!sceneInformation.mouseMoved) {
        this.placeNewTile();
      }
    });
  }

  availableSlots = new Set();

  activateTilePlacing(tileAmount = 3) {
    this.canPlaceTiles = true;
    this.placeableTileCount += tileAmount;
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
      children: [...type.exits],
      parentTile: null,
      slots: [...type.slots],
    }

    let tilePos = newTile.inWorldTile.position;

    newTile.slots.forEach( (slot) => {
      const relPos = vec3.create();
      vec3.rotateY(relPos, [slot.relPosition.x, slot.relPosition.y, slot.relPosition.z], [0, 0, 0], - newTile.rotation );
      console.log(relPos);
      slot.position = vec3.create();
      vec3.add(slot.position, relPos, tilePos);
      this.availableSlots.add(structuredClone(slot));
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
    for (const type in this.#TileTypes) {
      const obj = this.sceneInformation.addNewObject(
        type.objName,
        [0, 0, 0],
        [0, type.defaultRotation * 2/3, 0], 
        0
      );
      type.ghostTile = obj;
    }
  }

  placeGhostTile() {
    
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
    

    if (tile == this.#TileTypes["split"]) {
      this.leaves += 1;
    }
    if (tile == this.#TileTypes["stop"]) {
      this.leaves -= 1;
      this.removeBranch(newTile);
    }
    this.placeableTileCount -= 1;
    if (this.placeableTileCount <= 0) {
      this.deactivateTilePlacing();
    }

  }

  generateNextTile(count = 1) {
    queuePop(); //in UI
    for (let i = 0; i < count; i++) {
      let stopOffset = 0;
      if (this.leaves > 3) {
        stopOffset = 1;
      }
      let keyTypes = this.#RoadTypes;
      let randomIndex = Math.floor(Math.random() * (keyTypes.length-1 + stopOffset))
      let tileName=[keyTypes[randomIndex]];
      this.nextTiles.push(this.#TileTypes[tileName]);
      queuePush(tileName);
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
    let exitIndex = tile.children.findIndex((element) => {element == exit;});
    tile.children.shift(exitIndex);
    if (tile.children.length > 0) {
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
