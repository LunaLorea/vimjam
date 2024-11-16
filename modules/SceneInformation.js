import InitBuffersFromModel from "./initBuffersFromModel.js";
import { loadTexture } from "./loadTexture.js";

export default class SceneInformation {
  constructor(gl) {
    this.gl = gl;
    this.camInformation =  {
      currentCamera: 0,
      cams: [],
    };
    this.objectInformation = [];
    this.typeMap = new Map();
  }

  async initObjectTypes(objecNameAndUrlList) {
    let modelUrls = [];
    objecNameAndUrlList.forEach((object, index) => {
      this.objectInformation.push({
        name: object[0],
        id: index,
        bufferIndex: index,
        texture: loadTexture(this.gl, object[2]),
        instanceInformation: []
      });
      modelUrls.push(object[1]);
      this.typeMap.set(object[0], index);
    });
    this.buffers = new InitBuffersFromModel(this.gl, modelUrls);
    await this.buffers.parseModels(this.gl);
  }

  addNewObject(typeName, positon, rotaton, scale) {
    let type = this.typeMap.get(typeName);
    if (this.objectInformation[type] == undefined) {
      throw Error("Object type: " + typeName + " does not exist or isn't initialized yet.");
    }
    let object = {
      position: positon,
      rotation: rotaton,
      scale:    scale,
      texture:  this.objectInformation[type].texture,
      alpha: 1,
    };
    this.objectInformation[type].instanceInformation.push(object);
    return object;
  }

  setObjectPosition(object, x, y, z) {
    if (object.position == undefined) {
      throw Error("Object is corrupt or does not exist");
    }
    object.position = vec3.fromValues(x, y, z);
  }
  moveObject(object, x, y, z) {
    if (object.position == undefined) {
      throw Error("Object is corrupt or does not exist");
    }
    vec3.add(object.position, object.position, [x, y, z]);
  }


  setObjectRotation(object, x, y, z) {
    if (object.rotation == undefined) {
      throw Error("Object is corrupt or does not exist");
    }
    object.rotation = vec3.fromValues(x, y, z);
  }
  rotateObject(object, x, y, z) {
    if (object.rotation == undefined) {
      throw Error("Object is corrupt or does not exist");
    }
    vec3.add(object.rotation, object.rotation, [x, y, z]);
  }


  addNewCamera(position, relPosition, rotation, angle) {
    let camera = {
      position: position,
      relPosition: relPosition,
      angle: angle,
      rotation: rotation,
    };
    this.camInformation.cams.push(camera);
    return (camera);
  }

  setCamPosition(camera, x, y, z) {
    if (camera.position == undefined) {
      throw Error("Camera is corrupt or does not exist");
    }
    camera.position = vec3.fromValues(x, y, z);
  }
  moveCam(camera, x, y, z) {
    if (camera.position == undefined) {
      throw Error("Camera is corrupt or does not exist");
    }
    vec3.add(camera.position, camera.position, [x, y, z]);
  }


  setCamRotation(camera, x, y, z) {
    if (camera.rotation == undefined) {
      throw Error("Camera is corrupt or does not exist");
    }
    camera.rotation = vec3.fromValues(x, y, z);
  }
  rotateCam(camera, x, y, z) {
    if (camera.rotation == undefined) {
      throw Error("Camera is corrupt or does not exist");
    }
    vec3.add(camera.rotation, camera.rotation, [x, y, z]);
  }
}
