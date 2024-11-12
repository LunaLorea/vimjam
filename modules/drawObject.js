function drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation) {
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  let objectIndex = objInformation.index;
  

  //Move and rotate acording to the Camera
  const tempCam1 = vec3.create();
  const tempCam2 = vec3.create();
  vec3.sub(tempCam1, tempCam1, camInformation.position);
  vec3.sub(tempCam2, tempCam2, camInformation.relPosition);

  rotateObject(modelViewMatrix, [0.5, 0, 0]);
  rotateObject(modelViewMatrix, camInformation.rotation);
  setObjectPosition(modelViewMatrix, tempCam1);
  setObjectPosition(modelViewMatrix, tempCam2);
  
  // Rotate and Place Object in Space
  setObjectPosition(modelViewMatrix, objInformation.position);
  rotateObject(modelViewMatrix, objInformation.rotation);

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute(gl, buffers, programInfo, buffers.offsets[objectIndex][1]);

  setTextureAttribute(gl, buffers, programInfo, buffers.offsets[objectIndex][1]);

  setNormalAttribute(gl, buffers, programInfo, buffers.offsets[objectIndex][1]);

  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix,
  );

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix,
    false,
    normalMatrix,
  );

  // Tell WebGL that we want to adress texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  
  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const offset = buffers.offsets[objectIndex][0] * 2;
    const vertexCount = buffers.offsets[objectIndex][2];
    const type = gl.UNSIGNED_SHORT;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

function setObjectPosition(modelViewMatrix, position) {
  mat4.translate(
    modelViewMatrix,
    modelViewMatrix,
    position,
  );
}


function rotateObject(modelViewMatrix, rotation) {
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    rotation[2] * Math.PI / 2,
    [0, 0, 1],
  );
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    rotation[1] * Math.PI / 2,
    [0, 1, 0],
  );
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    rotation[0] * Math.PI / 2,
    [1, 0, 0],
  );
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, programInfo, offset) {
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
    offset * 4 * numComponents,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}


// tell webgl how to pull out the texture coordinates from buffer
function setTextureAttribute(gl, buffers, programInfo, offset) {
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
    offset * 4 * num,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

function setNormalAttribute(gl, buffers, programInfo, offset) {
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
    offset*4 * numComponents,
  );

  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

export { drawObject };
