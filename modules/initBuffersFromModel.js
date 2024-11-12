import LoadObject from "./loadObject.js";
/**
 * Renders something using the WebGL context.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {model} models
 */
export default class InitBuffersFromModel {
  constructor (gl, models) {
    this.offsets = [];
    this.positionBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.textureCoordBuffer = gl.createBuffer();
    this.normalBuffer = gl.createBuffer();
    this.models = models;
  }

  async parseModels(gl) {
    let vertexPositions = [];
    let textureCoordinates = [];
    let vertexNormals = [];
    let indices = [];
    let models = this.models;

    let indexOffset = 0;
    for (let i = 0; i < models.length; i++) {
      // Load model from a .obj file.
      const model = new LoadObject(models[i]);
      await model.loadObject()
      this.offsets.push([indices.length, vertexPositions.length / 3]);
      // Put all Vertex Positions into the same Array
      for (let j = 0; j < model.faceVertexIndexes.length; j++) {
        let tempIndices = [];
        let tempTextureIndices = [];
        let tempNormalIndices = [];
        for (let k = 1; k < model.faceVertexIndexes[j].length-1; k++) {
          tempIndices.push( 
            model.faceVertexIndexes[j][0],
            model.faceVertexIndexes[j][k],
            model.faceVertexIndexes[j][k+1]
          );
          tempTextureIndices.push( 
            model.faceTextureIndexes[j][0],
            model.faceTextureIndexes[j][k],
            model.faceTextureIndexes[j][k+1]
          );
          tempNormalIndices.push( 
            model.faceNormalIndexes[j][0],
            model.faceNormalIndexes[j][k],
            model.faceNormalIndexes[j][k+1]
          );
        }
        let map = [];
        tempIndices.forEach( (element, index) => {
          if (map[element] == undefined) {
            vertexPositions.push(
              model.vertexPositions[(element-1)*3], 
              model.vertexPositions[(element-1)*3 + 1],
              model.vertexPositions[(element-1)*3 + 2]
            );
            textureCoordinates.push(
              model.textureCoordinates[(tempTextureIndices[index]-1)*2],
              model.textureCoordinates[(tempTextureIndices[index]-1)*2+1]
            );
            vertexNormals.push(
              model.vertexNormals[(tempNormalIndices[index]-1)*3],
              model.vertexNormals[(tempNormalIndices[index]-1)*3+1],
              model.vertexNormals[(tempNormalIndices[index]-1)*3+2]
            );

            map[element] = indexOffset;
            indexOffset += 1;
          }
          indices.push(map[element]);
        });
      }
      let lastOffset = 0;
      if (this.offsets.length >= 2) {
        lastOffset = this.offsets[this.offsets.length-2][2];
      }
      this.offsets[this.offsets.length-1].push(indices.length - lastOffset);
    }
    this.initPositionBuffer(gl, vertexPositions);
    this.initIndexBuffer(gl, indices);
    this.initTextureBuffer(gl, textureCoordinates);
    this.initNormalBuffer(gl, vertexNormals);
    console.log(vertexPositions);
    console.log(indices);
  }

/**
 * @param {WebGLRenderingContext} gl - The WebGL context.
 */
  initPositionBuffer(gl, vertexPositions) {
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      this.positionBuffer
    );
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(vertexPositions),
      gl.STATIC_DRAW
    );
  }

/**
 * @param {WebGLRenderingContext} gl - The WebGL context.
 */
  initIndexBuffer(gl, indices) {
    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      this.indexBuffer
    );
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );
  }

/**
 * @param {WebGLRenderingContext} gl - The WebGL context.
 */
  initTextureBuffer(gl, textureCoordinates) {
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      this.textureCoordBuffer
    );
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(textureCoordinates),
      gl.STATIC_DRAW
    );
  }

/**
* @param {WebGLRenderingContext} gl - The WebGL context.
 */
  initNormalBuffer(gl, vertexNormals) {
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      this.normalBuffer
    );
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexNormals),
      gl.STATIC_DRAW
    );
  }

}



