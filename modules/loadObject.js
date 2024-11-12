

/**
* Renders something using the WebGL context.
* @param {WebGLRenderingContext} gl - The WebGL context.
*/
export default class ModelObject {
  constructor(url) {
    this.url = url;
    this.obj = '';
    this.vertexPositions = [];
    this.vertexNormals = [];
    this.textureCoordinates = [];
    this.faceVertexIndexes = [];
    this.faceTextureIndexes = [];
    this.faceNormalIndexes = [];
  }
  async loadObject() {
    await this.readFile();
    const lines = this.obj.split('\n');
    lines.forEach(this.parseLine);
  }

  async readFile() {
    let reader = new FileReader();
    try {
      const response = await fetch(this.url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Obj');
      }

      const blob = await response.blob();
        
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          this.obj = e.target.result;
          resolve();
        }

        reader.onerror = (e) => {
          console.error('Error reading file:', e);
          reject('Something went wrong with reading the obj file');
        }

        reader.readAsText(blob);
      })
    } catch (error) {
      console.error('Error: ', error);
    }
  }

  parseLine = (line) => {
    const words = line.split(' ');
    switch(words[0]) {
      case "v":
        this.parseVertexPosition(words);
        break;
      case "vn":
        this.parseVertexNormal(words);
        break;
      case "vt":
        this.parseTextureCoordinates(words);
        break;
      case "f":
        this.parseFaces(words);
        break;
    }
  }

  parseVertexPosition = (words) => {
    if (words.length != 4) {
      console.error('vertex position in obj file malformed');
      return;
    }
    this.vertexPositions.push(parseFloat(words[1])); // x
    this.vertexPositions.push(parseFloat(words[2])); // y
    this.vertexPositions.push(parseFloat(words[3])); // z
  }
  parseVertexNormal(words) {
    if (words.length != 4) {
      console.error('vertex normal in obj file malformed');
      return;
    }

    this.vertexNormals.push(parseFloat(words[1])); // x
    this.vertexNormals.push(parseFloat(words[2])); // y
    this.vertexNormals.push(parseFloat(words[3])); // z
  }
  parseTextureCoordinates(words) {
    if (words.length != 3) {
      console.error('vertex position in obj file malformed');
      return;
    }

    this.textureCoordinates.push(parseFloat(words[1]));
    this.textureCoordinates.push(parseFloat(words[2]));
  }
  parseFaces(words) {
    if (words.length < 3) {
      console.error('face in obj file malformed');
      return;
    }
    this.faceVertexIndexes.push([])
    this.faceTextureIndexes.push([])
    this.faceNormalIndexes.push([])
    // A face is a list of triplets vertex_index/texture_index/normal_index
    for (let i = 1; i < words.length; i++) {
      let vertices = words[i].split('/');
      this.faceVertexIndexes[this.faceVertexIndexes.length-1].push(vertices[0]);
      this.faceTextureIndexes[this.faceTextureIndexes.length-1].push(vertices[1]);
      this.faceNormalIndexes[this.faceNormalIndexes.length-1].push(vertices[2]);
    }
  }
}


