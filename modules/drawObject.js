import { setObjectAttributes } from "./setObjectAttributes.js";

//function drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation) {
function drawObject(
  gl, 
  buffers, 
  programInfo, 
  projectionMatrix, 
  objectType,
  camInformation
) {

  let objectIndex = objectType.id;
  setObjectAttributes(gl, buffers, programInfo, objectIndex);


  objectType.instanceInformation.forEach( (objInformation) => {
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    

    //Move and rotate acording to the Camera
    const tempCam1 = vec3.create();
    const tempCam2 = vec3.create();
    vec3.sub(tempCam1, tempCam1, camInformation.position);
    vec3.sub(tempCam2, tempCam2, camInformation.relPosition);
    rotateObject(modelViewMatrix, [camInformation.angle, 0, 0]);
    rotateObject(modelViewMatrix, camInformation.rotation);
    setObjectPosition(modelViewMatrix, tempCam1);
    setObjectPosition(modelViewMatrix, tempCam2);
    
    // Rotate and Place Object in Space
    setObjectPosition(modelViewMatrix, objInformation.position);
    rotateObject(modelViewMatrix, objInformation.rotation);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);


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
