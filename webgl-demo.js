import { initBuffers } from "./modules/init-buffers.js";
import { drawScene } from "./modules/draw-scene.js";
import { importString } from "./modules/importString.js";
import { loadObject } from "./modules/loadObject.js";

let cubeRotation = 0.0;
let deltaTime = 0;

let firstMousePositionCaptured = false;
let mousePosition = {
  then: vec2.create(),
  now: vec2.create(),
}

let wasdIsPressed = vec2.fromValues(0, 0);
const settings = {
  // Graphics
  FOV: 90.0,
}

 window.addEventListener(
  "keydown",
  (event) => {
    switch (event.key) {
      case "W":
      case "w":
        wasdIsPressed[1] = -1;
        break;
      case "A":
      case "a":
        wasdIsPressed[0] = -1;
        break;
      case "S":
      case "s":
        wasdIsPressed[1] = 1;
        break;
      case "D":
      case "d":
        wasdIsPressed[0] = 1;
        break;
    }

    // Cancel the default action to avoid it being handled twice
    //event.preventDefault();
  },
  true,
);
 window.addEventListener(
  "keyup",
  (event) => {
    switch (event.key) {
      case "W":
      case "w":
        wasdIsPressed[1] = 0;
        break;
      case "A":
      case "a":
        wasdIsPressed[0] = 0;
        break;
      case "S":
      case "s":
        wasdIsPressed[1] = 0;
        break;
      case "D":
      case "d":
        wasdIsPressed[0] = 0;
        break;
    }

    // Cancel the default action to avoid it being handled twice
    //event.preventDefault();
  },
  true,
);



window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  const canvas = document.querySelector("#gl-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
main();
//
// start here
//
function main() {
  const canvas = document.querySelector("#gl-canvas");

  // Initialize the GL context
  /** @type {WebGLRenderingContext} */
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
   }
  
  

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Vertex shader program
  const vsSource = importString("shaders/vertexShader.glsl");
  const fsSource = importString("shaders/fragmentShader.glsl");

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  
  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
      cameraRotationMatrix: gl.getUniformLocation(shaderProgram, "uCameraRotationMatrix"),
    },
  };
  // Load Models
  const models = {
    cube:            loadObject("models/cube.obj"),
    hexagonal_prism: loadObject("models/hexagonal-prism.obj"),
  }
  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl, models);

  // Load texture
  const texture = loadTexture(gl, "textures/Mossy_Cobblestone.png");
  // Flip image pixels to bottom-to-top order because webgl uses different order than browser.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);



  function setMouseCoord(e) {
    mousePosition.now[0] = - e.clientX;
    mousePosition.now[1] = e.clientY;

    if (!firstMousePositionCaptured) {
      mousePosition.then[0] = mousePosition.now[0];
      mousePosition.then[1] = mousePosition.now[1];
      firstMousePositionCaptured = true;
    }
  }


  canvas.addEventListener("mousemove", setMouseCoord);
  canvas.addEventListener("onload", setMouseCoord);

  let then = 0;

  const camInformation = {
    position: vec3.fromValues(0.0, 0.0, 0.0),
    relPosition: vec3.fromValues(0.0, 10.0, 10.0),
    rotation: vec3.fromValues(0.0, 0.0, 0.0),
  }
  


  function renderer(now) {
    now *= 0.001; // Convert time to seconds
    deltaTime = now - then;
    then = now;

    //console.log(wasdIsPressed);

    const tempVec = vec3.create();
    vec2.scale(tempVec, wasdIsPressed, deltaTime);
    vec2.rotate(tempVec, tempVec, [0, 0, 0], camInformation.rotation[1]*Math.PI / 2);
    camInformation.position[0] += tempVec[0] * 3;
    camInformation.position[2] += tempVec[1] * 3;


    const deltaMouse = vec2.create();
    vec2.sub(deltaMouse, mousePosition.now, mousePosition.then);
    mousePosition.then[0] = mousePosition.now[0];
    mousePosition.then[1] = mousePosition.now[1];

    vec3.rotateY(
      camInformation.relPosition,
      camInformation.relPosition,
      [0,10,0],
      deltaMouse[0] / 150,
    );

  
    

    camInformation.rotation[1] = - 2 *(Math.atan2(camInformation.relPosition[0], camInformation.relPosition[2]) / Math.PI) % 2;


    drawScene(gl, programInfo, buffers, canvas, texture, camInformation, settings); //Draw the current scene.
    
    

    //cubeRotation += deltaTime;
    //cubeRotation = cubeRotation % (20*Math.PI);

    var fps = (Math.round(1 / deltaTime))
    document.getElementById("fps-counter").innerHTML = fps;
    


    requestAnimationFrame(renderer);
  }  
  requestAnimationFrame(renderer);

}


//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram,
      )}`,
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be downloaded over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel,
  );

  const image = new Image();
  image.src = url + "?" + new Date().getTime();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image,
    );

    // WebGL1 has different requirements for power of 2 images
    // vs. non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}


