export default class PlayingField {

  #TileTypes = {
    start: {
      exits: [0, 3],
      objName: "hexagonal-plate-straight",
      defaultRotation: 0,
    },
    empty: {
      exits: [],
      objName: "hexagonal-plate-empty",
      defaultRotation: 0,
    },
    stop: {
      exits: [],
      objName: "hexagonal-plate-stop",
      defaultRotation: 3,
    },
    straight: {
      exits: [3],
      objName: "hexagonal-plate-straight",
      defaultRotation: 0,
    },
    curve_right: {
      exits: [4],
      objName: "hexagonal-plate-curve",
      defaultRotation: 2,
    },
    curve_left: {
      exits: [2],
      objName: "hexagonal-plate-curve",
      defaultRotation: -2,
    },
    split: {
      exits: [2, 4],
      objName: "hexagonal-plate-split",
      defaultRotation: 1,
    },
  };


  #exitCoordMap = new Map();

  constructor(sceneInformation) {
    this.sceneInformation = sceneInformation;
    this.tileCount = 0;
    this.tiles = [];
    this.availableTiles = [];
    this.leaves = 1;

    this.nextTiles = [];
    this.generateNextTile(3);

    this.#exitCoordMap.set(0, [0, 1]);
    this.#exitCoordMap.set(1, [-1, 1]);
    this.#exitCoordMap.set(2, [-1, 0]);
    this.#exitCoordMap.set(3, [0, -1]);
    this.#exitCoordMap.set(4, [1, -1]);
    this.#exitCoordMap.set(5, [1, 0]);

    this.startTile0 = this.createNewTile(this.#TileTypes.straight, 0, {q: 0, r: 0});
    this.startTile1 = this.createNewTile(this.#TileTypes.empty, 0, {q: -1, r: 1});
    this.startTile2 = this.createNewTile(this.#TileTypes.empty, 0, {q: -1, r: 0});
    this.startTile3 = this.createNewTile(this.#TileTypes.straight, 3, {q: 0, r: 1});
    this.startTile4 = this.createNewTile(this.#TileTypes.empty, 0, {q: 1, r: 0});
    this.startTile5 = this.createNewTile(this.#TileTypes.empty, 0, {q: 1, r: -1});
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
    }
    newTile.neighbors = this.findNeighborsOfTile(newTile);

    this.tileCount += 1;

    let q = coordinates.q;
    let r = coordinates.r;

    if (this.tiles[q] == undefined) {
      this.tiles[q] = [];
    } 
    if (this.tiles[q][r] == undefined) {
      this.tiles[q][r] = newTile;
    } else {
      throw Error("This tile already exists");
    }

    return newTile;
  }

  findNeighborsOfTile(tile) {
    const neighbors = [];
    // ToDo find neighbors
    tile.type.exits.forEach( (exit) => {
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
          obj: this.sceneInformation.addNewObject(
            "available",
            [absoluteCoords.x, 0, absoluteCoords.y],
            [0, 0, 0], 0.8
          ),
        };
      } else {
        this.availableTiles[q][r].parents.push((relativeExit+3)%6);
      }
    });
     
    return neighbors;
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

    const parentTileEntrances = this.availableTiles[q][r].parents;
    // ToDo remove
    const tile = this.getNextTile();
    if (tile.type == this.#TileTypes["split"]) {
      this.leaves += 1;
    }
    if (tile.type == this.#TileTypes["stop"]) {
      this.leaves -= 1;
    }
    
    try {
    this.createNewTile(tile, parentTileEntrances[0], hexCoords);
    }
    catch (error) {
    }

  }

  generateNextTile(count = 1) {
    for (let i = 0; i < count; i++) {
      let stopOffset = 0;
      if (this.leaves > 3) {
        stopOffset = 1;
      }
      let keyTypes = Object.keys(this.#TileTypes);
      let randomIndex = stopOffset + 2 + Math.ceil(Math.random() * (keyTypes.length-3 + stopOffset))
      this.nextTiles.push(this.#TileTypes[keyTypes[randomIndex]]);
    }
  }

  getNextTile() {
    const nextTile = this.nextTiles.shift();2
    this.generateNextTile();
    return nextTile;
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
