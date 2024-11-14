function initKeyboardInput(sceneInformation) {

  const keyMap = sceneInformation.settings.keyMap;
  keyMap.set("up", 0);
  keyMap.set("left", 1);
  keyMap.set("down", 2);
  keyMap.set("right", 3);
  keyMap.set("firstMouseButton", 4);
  keyMap.set("secondMouseButton", 5);
  keyMap.set("thirdMouseButton", 6);
  keyMap.set("fourthdMouseButton", 7);
  keyMap.set("fifthMouseButton", 8);


  sceneInformation.keyMapArray = [0, 0, 0, 0, 0, 0, 0, 0];
  addEventListener(
    "keydown",
    (event) => {
      switch (event.key) {
        case "W":
        case "w":
          sceneInformation.keyMapArray[0] = 1;
          break;
        case "A":
        case "a":
          sceneInformation.keyMapArray[1] = 1;
          break;
        case "S":
        case "s":
          sceneInformation.keyMapArray[2] = 1;
          break;
        case "D":
        case "d":
          sceneInformation.keyMapArray[3] = 1;
          break;
        case "Escape":
          document.exitPointerLock();
          mouseLocked = false;
          break;
      }
    },
    true,
  );

   addEventListener(
    "keyup",
    (event) => {
      switch (event.key) {
        case "W":
        case "w":
          sceneInformation.keyMapArray[0] = 0;
          break;
        case "A":
        case "a":
          sceneInformation.keyMapArray[1] = 0;
          break;
        case "S":
        case "s":
          sceneInformation.keyMapArray[2] = 0;
          break;
        case "D":
        case "d":
          sceneInformation.keyMapArray[3] = 0;
          break;
      }

      // Cancel the default action to avoid it being handled twice
      //event.preventDefault();
    },
    true,
  );

  addEventListener(
    "mousedown",
    (event) => {
      sceneInformation.keyMapArray[event.button+4] = 1;
    });
  addEventListener(
    "mouseup",
    (event) => {
      sceneInformation.keyMapArray[event.button+4] = 0;
    });
}

export { initKeyboardInput };
