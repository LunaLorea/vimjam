import { drawObject } from "./drawObject.js";

function drawScene(gl, programInfo, buffers, canvas, texture, camInformation, settings) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (settings.FOV * Math.PI) / 180; // in radians
  const aspect = canvas.width / canvas.height;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glMatrix always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const objInformation = {
    index: 0,
    position: vec3.fromValues(0.0, 0.0, -20.0),
    rotation: vec3.fromValues(0.0, 0.0, 0.0),
  }

  drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation);
  objInformation.index = 1;
  objInformation.position = vec3.fromValues(20.0, 0.0, -20.0);
  objInformation.rotation = vec3.fromValues(0.0, 0.0, 0.0);
  

  drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation);
  objInformation.index = 1;
  objInformation.position = vec3.fromValues(30.0, 0.0, -20.0);
  objInformation.rotation = vec3.fromValues(0.0, 0.0, 0.0);
  

  drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation);
  objInformation.index = 2;
  objInformation.position = vec3.fromValues(-15.0, 0.0, -10.0);
  objInformation.rotation = vec3.fromValues(0.0, 0.7, 0.0);
  drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation);
  objInformation.index = 3;
  objInformation.rotation = vec3.fromValues(0.0, 0.0, 0.0);
  const changeBasis = mat3.fromValues( 
    1, 0, 0,
    0, 0, 0,
    0.5, 0, Math.sqrt(3)/2
    );
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      vec3.transformMat3(objInformation.position, [i*2, 0, j*2], changeBasis);
      drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation);
    }
  }
}


export { drawScene };

