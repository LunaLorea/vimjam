export default class PlayingField {

  #TileTypes = {
    start: {
      exits: [0, 3],
      objName: "hexagonal-plate-straight",
      defaultRotation: 0,
      hasEntrance: true,
    },
    startFlag: {
      exits: [],
      objName: "hexagonal-plate-flag",
      defaultRotation: 0,
      hasEntrance: true,
    },
    empty: {
      exits: [],
      objName: "hexagonal-plate-empty",
      defaultRotation: 0,
      hasEntrance: false,
    },
    audience: {
      exits: [],
      objName: "hexagonal-plate-audience",
      defaultRotation: 3,
      hasEntrance: false,
    },
    stop: {
      exits: [],
      objName: "hexagonal-plate-stop",
      defaultRotation: 3,
      hasEntrance: true,
    },
    straight: {
      exits: [3],
      objName: "hexagonal-plate-straight",
      defaultRotation: 0,
      hasEntrance: true,
    },
    tires: {
      exits: [3],
      objName: "hexagonal-plate-tires",
      defaultRotation: 0,
      hasEntrance: true,
    },
    curve_right: {
      exits: [4],
      objName: "hexagonal-plate-curve",
      defaultRotation: 2,
      hasEntrance: true,
    },
    curve_left: {
      exits: [2],
      objName: "hexagonal-plate-curve",
      defaultRotation: -2,
      hasEntrance: true,
    },
    split: {
      exits: [2, 4],
      objName: "hexagonal-plate-split",
      defaultRotation: 1,
      hasEntrance: true,
    },
    start: {
      exits: [3, 0],
      objName: "hexagonal-plate-start",
      defaultRotation: 0,
      hasEntrance: true,
    },
  };

  #RoadTypes = ["straight", "curve_right", "curve_left", "split", "stop", ];


  #exitCoordMap = new Map();

  constructor(sceneInformation) {
    this.sceneInformation = sceneInformation;
    this.tileCount = 0;
    this.tiles = [];
    this.availableTiles = [];
    this.leaves = 2;

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
    }
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
      } else {
        this.availableTiles[q][r].parents.push((relativeExit+3)%6);
        this.availableTiles[q][r].parentTiles.push(tile);
        this.availableTiles[q][r].parentExits.push(exit);
      }
      this.availableTiles[q][r].obj.alpha = 0.6;
    });
     
    return neighbors;
  }

  #ghostTiles = {
    current: 0,
  }
  placeGhostTile() {
    
  }


  placeNewTile() {
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
    console.log(chosenParent, parentTileEntrances.length);
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

  }

  generateNextTile(count = 1) {
    for (let i = 0; i < count; i++) {
      let stopOffset = 0;
      if (this.leaves > 3) {
        stopOffset = 1;
      }
      let keyTypes = this.#RoadTypes;
      let randomIndex = Math.floor(Math.random() * (keyTypes.length-1 + stopOffset))
      this.nextTiles.push(this.#TileTypes[keyTypes[randomIndex]]);
    }
  }

  getNextTile() {
    const nextTile = this.nextTiles.shift();2
    this.generateNextTile();
    return nextTile;
  }

  getTileFromExit(tile, exit) {
    let rotation = (exit + tile.rotation) % 6;
    const tilePos = tile.coordinates;
    const relPos = this.#exitCoordMap.get(rotation);
    let q = tilePos.q + relPos[0];
    let r = tilePos.r + relPos[1];
    if (this.tiles[q] == undefined) {
      return undefined;
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

}
