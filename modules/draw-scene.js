import { drawObject } from "./drawObject.js";

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
  const aspect = canvas.width / canvas.height;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  
  sceneInformation.objectInformation.forEach( (objectType) => {
    drawObject(
      sceneInformation.gl,
      sceneInformation.buffers,
      programInfo, 
      projectionMatrix,
      objectType,
      sceneInformation.camInformation.cams[sceneInformation.camInformation.currentCamera],
    );
  });
  
}


export { drawScene };

