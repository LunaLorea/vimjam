function initCameraMovement(camera, settings, sceneInformation) {
    addEventListener("wheel", onwheel);

    function onwheel (event) {
      if (sceneInformation.keyMapArray[sceneInformation.settings.keyMap.get("Control")] == 1) {
        return;
      }

      let scrollAmount = event.deltaY;
      let cameraLength = Math.sqrt(vec3.dot(camera.relPosition, camera.relPosition));
      if (scrollAmount > 0) {
        cameraLength *= 1.05;
      }
      if (scrollAmount < 0) {
        cameraLength *= 1/1.05;
      }
      cameraLength = Math.max( settings.zoomMin, Math.min(cameraLength, settings.zoomMax));
      vec3.normalize(camera.relPosition, camera.relPosition);
      vec3.scale(camera.relPosition, camera.relPosition, cameraLength);
    };
    
    function setMouseCoord(e) {
      sceneInformation.mouseX = e.clientX;
      sceneInformation.mouseY = e.clientY;
      sceneInformation.relativeMouse[0] = e.movementX;
      sceneInformation.relativeMouse[1] = e.movementY;
      if (vec2.dot(sceneInformation.relativeMouse, sceneInformation.relativeMouse) > 15) {
        sceneInformation.mouseMoved = true;
      } 
    }

    sceneInformation.mouseX = 0;
    sceneInformation.mouseY = 0;
    sceneInformation.relativeMouse = [0, 0];

    addEventListener("mousemove", setMouseCoord);
    addEventListener("onload", setMouseCoord);
  }

function updateCamera(camera, sceneInformation, deltaTime) {

  // Camera movement based on WASD keyboard input
  let speed = sceneInformation.settings.cameraSpeed;
  let keyMapArray = sceneInformation.keyMapArray;
  let rotation = camera.rotation[1]*Math.PI / 2;

  const movementVector = vec2.create();
  movementVector[0] = keyMapArray[3] - keyMapArray[1];
  movementVector[1] = keyMapArray[2] - keyMapArray[0];
  vec2.scale(movementVector, movementVector, deltaTime * speed);
  vec2.rotate(movementVector, movementVector, [0, 0, 0], rotation); 

  vec3.add(camera.position, camera.position, [movementVector[0], 0, movementVector[1]]);

  // Camera rotation based on mouse input
  
  let cameraRotation = sceneInformation.relativeMouse;
  vec2.scale(cameraRotation, cameraRotation, 1 / sceneInformation.windowWidth * 100);
  if (
    sceneInformation.keyMapArray[sceneInformation.settings.keyMap.get("use")] == 0
  ) {
    vec2.scale(cameraRotation, cameraRotation, 0);
  }

  vec3.rotateY(
    camera.relPosition,
    camera.relPosition,
    [0, 0, 0], 
    -cameraRotation[0] * sceneInformation.settings.cameraRotationSpeed / 150
  );

  vec2.scale(cameraRotation, cameraRotation, 0);
  

  camera.rotation[1] = - 2 *(Math.atan2(camera.relPosition[0], camera.relPosition[2]) / Math.PI) % 2;
}

export { initCameraMovement, updateCamera };
