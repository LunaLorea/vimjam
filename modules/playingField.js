export default class PlayingField {
  constructor(sceneInformation) {
    this.sceneInformation = sceneInformation;
    this.tileCount = 0;
    this.startTile = this.createNewTile("straight", 0, [0, 0, 0]);
  }

  createNewTile(type, rotation, coordinates) {
    const newTile = {
      inWorldTile: this.sceneInformation.addNewObject(
        "hexagonal-plate-" + type,
        coordinates,
        [0, rotation, 0], 1),
      type: type,
      rotation: rotation,
      coordinates: coordinates,
      neighbors: this.findNeighborsOfTile(coordinates),
      id: this.tileCount++,
    }


    return newTile;
  }

  findNeighborsOfTile(coordinates) {
    const neighbors = [];
    // ToDo find neighbors
    
    return neighbors;
  }
  
}
