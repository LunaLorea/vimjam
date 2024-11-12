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
    position: vec3.fromValues(0.0, 0.0, 0.0),
    rotation: vec3.fromValues(0.0, 0.0, 0.0),
  }

  
  let objectIndex = 0;
  drawObject(gl, buffers, programInfo, projectionMatrix, texture, camInformation, objInformation, objectIndex);
  objectIndex = 0;
  objInformation.position = vec3.fromValues(2.0, 0.0, 0.0);
  
}


export { drawScene };

