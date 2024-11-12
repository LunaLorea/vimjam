import LoadObject from "./loadObject.js";
/**
 * Renders something using the WebGL context.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {model} models
 */
async function initBuffersFromModel(gl, models) {
  const positionBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  const textureCoordinateBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  
  let offsets = []
  let vertexPositions = [];
  let indices = [];

  let vertexOffset = 0;
  let indexOffset = 0;
  for (let i = 0; i < models.length; i++) {
    const model = new LoadObject(models[i]);
    model.loadObject().then(result => {
      console.log(JSON.stringify(model));
    });
    let tempOffset = [];
    // Vertex Positions
    tempOffset.push(vertexPositions.length);
    vertexPositions.concat(model.vertexPositions);
    for (let j = 0; j < model.faceVertexIndexes.length; j++) {
    }
    tempOffset.push(indexOffset);
    offsets.push(tempOffset);
  }
  

  for (let i = 0; i < models.length; i++) {
    initPositionBuffer(gl, positionBuffer, models[0], vertexOffset);
  }

  
  return {
    position: positionBuffer,
    indices: indexBuffer,
    textureCoord: textureCoordinateBuffer,
    normal: normalBuffer,
  };

}
/**
 * @param {WebGLRenderingContext} gl - The WebGL context.
 */
function initPositionBuffer(gl, positionBuffer, vertexPositions, vertexOffset) {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
}

function initIndexBuffer(gl, offset) {}

function initTextureBuffer(gl, offset) {}

function initNormalBuffer(gl, offset) {}





export { initBuffersFromModel };
