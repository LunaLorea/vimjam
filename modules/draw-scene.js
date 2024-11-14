import { drawObject } from "./drawObject.js";
import { transformScreenToWorldPosition } from "./transformScreenToWorldPosition.js";

function drawScene(programInfo, canvas, settings, sceneInformation) {


  const gl = sceneInformation.gl;
  sceneInformation.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  sceneInformation.gl.clearDepth(1.0); // Clear everything
  sceneInformation.gl.enable(gl.DEPTH_TEST); // Enable depth testing
  sceneInformation.gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  sceneInformation.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix
  const fieldOfView = (settings.FOV * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  

  const camInformation = sceneInformation.camInformation.cams[sceneInformation.camInformation.currentCamera];
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const camViewMatrix = mat4.create();
  //Move and rotate acording to the Camera
  const tempCam1 = vec3.create();
  vec3.sub(tempCam1, tempCam1, camInformation.position);
  vec3.sub(tempCam1, tempCam1, camInformation.relPosition);
  rotateObject(camViewMatrix, [camInformation.angle, 0, 0]);
  rotateObject(camViewMatrix, camInformation.rotation);
  setObjectPosition(camViewMatrix, tempCam1);
  
  let mousePosition = transformScreenToWorldPosition(
    projectionMatrix,
    camViewMatrix,
    [sceneInformation.mouseX, sceneInformation.mouseY],
    canvas,
    0,);

  if (mousePosition != null) {
    sceneInformation.mouseInWorld = mousePosition;
  }
  sceneInformation.objectInformation.forEach( (objectType) => {
    drawObject(
      sceneInformation.gl,
      sceneInformation.buffers,
      programInfo, 
      projectionMatrix,
      objectType,
      camViewMatrix
    );
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


export { drawScene };

