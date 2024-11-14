import { setObjectAttributes } from "./setObjectAttributes.js";

//function drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation) {
/**
 * @param {WebGLRenderingContext} gl 
 */
function drawObject(
  gl, 
  buffers, 
  programInfo, 
  projectionMatrix, 
  objectType,
  camViewMatrix
) {

  let objectIndex = objectType.id;
  setObjectAttributes(gl, buffers, programInfo, objectIndex);


  objectType.instanceInformation.forEach( (objInformation) => {
    
    const modelViewMatrix = mat4.create();
    mat4.copy(modelViewMatrix, camViewMatrix);
    // Rotate and Place Object in Space
    const objectPositionMatrix = mat4.create();
    setObjectPosition(objectPositionMatrix , objInformation.position);
    rotateObject(objectPositionMatrix , objInformation.rotation);
    mat4.mul(modelViewMatrix, modelViewMatrix, objectPositionMatrix);
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, objectPositionMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    let scale = objInformation.scale;
    const scalingMatrix = mat4.fromValues(
      scale, 0, 0, 0,
      0, scale, 0, 0,
      0, 0, scale, 0,
      0, 0, 0, 1,
    );

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
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.scalingMatrix,
      false,
      scalingMatrix
    );

    gl.uniform1f(programInfo.uniformLocations.scale, 1);

    // Tell WebGL that we want to adress texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    
    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, objInformation.texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
      const offset = buffers.offsets[objectIndex][0] * 2;
      const vertexCount = buffers.offsets[objectIndex][2];
      const type = gl.UNSIGNED_SHORT;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  });
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

export { drawObject };
