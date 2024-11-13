export function setObjectAttributes(gl, buffers, programInfo, id) {
  setPositionAttribute(gl, buffers, programInfo, id);

  setTextureAttribute(gl, buffers, programInfo, id);

  setNormalAttribute(gl, buffers, programInfo, id);
}

function setPositionAttribute(gl, buffers, programInfo, id) {
  const numComponents = 3; // pull out 3 values per iteration (for 3 dimensions per vertex)
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    buffers.offsets[id][1]* 4 * numComponents,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}


// tell webgl how to pull out the texture coordinates from buffer
function setTextureAttribute(gl, buffers, programInfo, id) {
  const num = 2; // every coordinate composed of 2 values
  const type = gl.FLOAT; // the data in the buffer is 32-bit float
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set to the next
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoordBuffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord,
    num,
    type,
    normalize,
    stride,
    buffers.offsets[id][1] * 4 * num,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

function setNormalAttribute(gl, buffers, programInfo, id) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexNormal,
    numComponents,
    type,
    normalize,
    stride,
    buffers.offsets[id][1]*4 * numComponents,
  );

  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}
