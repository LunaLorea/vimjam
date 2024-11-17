import { drawScene } from "./modules/draw-scene.js";
import { importString } from "./modules/importString.js";
import SceneInformation from "./modules/SceneInformation.js";
import { initCameraMovement, updateCamera } from "./modules/cameraMovement.js";
import { initKeyboardInput } from "./modules/inputHandler.js";
import GameLogic from "./modules/gameLogic.js";
import { initWaveButton, setLoading } from "./modules/uiHook.js";

let deltaTime = 0;


const settings = {
  // Graphics
  FOV: 90.0,
  zoomMax: 30,
  zoomMin: 2,
  cameraSpeed: 4,
  cameraRotationSpeed: 4,

  keyMap: new Map(),
}

main();
//
// start here
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
  
  function resizeCanvas() {
    const canvas = document.querySelector("#gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resizeCanvas();
  
  window.addEventListener('resize', resizeCanvas, false);

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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
      scalingMatrix: gl.getUniformLocation(shaderProgram, "uScalingMatrix"),
      alpha: gl.getUniformLocation(shaderProgram, "uAlpha"),
    },
  };
  

  // Load Models
  const models = [
    ["hexagonal-plate-straight", "models/gerade.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-curve", "models/kurve.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-split", "models/y.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-empty", "models/leer.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-audience", "models/tower_publikum.obj", "textures/tower_publikum_BaseColor.png"],
    ["hexagonal-plate-tires", "models/reifen.obj", "textures/reifenstrasse_BaseColor.png"],
    ["hexagonal-plate-stop", "models/roadblock.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-finishline", "models/ziel.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-start", "models/start.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-flag", "models/flagge.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-stage", "models/publikum.obj", "textures/all_tiles_BaseColor.png"],
    ["hexagonal-plate-straight-tire", "models/reifenstrasse.obj", "textures/all_tiles_BaseColor.png"],
    ["available", "models/placement.obj", "textures/placement_BaseColor.png"],
    ["enemy-formula1", "models/car.obj", "textures/car_BaseColors.png"],
    ["enemy-formula2", "models/car.obj", "textures/car2_BaseColor.png"],
    ["enemy-monstertruck", "models/monstertruck.obj", "textures/monstertruck_BaseColor.png"],
    ["enemy-monstertruck2", "models/monstertruck.obj", "textures/monstertruck_BaseColor.png"],
    ["flag", "models/flaggonly.obj", "textures/flaggonly_BaseColor.png"],
    ["projectile-tire", "models/reifen-projektil.obj", "textures/defenstextures_BaseColor.png"],
    ["projectile-spike", "models/spikes.obj", "textures/defenstextures_BaseColor.png"],
    ["tower-tire", "models/reifentower.obj", "textures/defenstextures_BaseColor.png"],
    ["tower-spikes", "models/spiketower.obj", "textures/defenstextures_BaseColor.png"],
    ["tower-toll", "models/tollstation.obj", "textures/towers_BaseColor.png"],
    ["tower-sniper", "models/snipertower.obj", "textures/towers_BaseColor.png"],
    ["deko-billboard", "models/billboards.obj", "textures/towers_BaseColor.png"],
  ];
  
  const sceneInformation = new SceneInformation(gl);
  sceneInformation.initObjectTypes(models).then( () => {
    sceneInformation.settings = settings;
    window.addEventListener('resize', () => {
      sceneInformation.windowWidth = window.innerWidth;
    });
    sceneInformation.windowWidth = window.innerWidth;

    const gameLogic = new GameLogic(sceneInformation);
    initWaveButton(gameLogic.startNewWave);
    initKeyboardInput(sceneInformation);

    const camera = sceneInformation.addNewCamera([0, 0, 0], [0, 10, 10], [0, 0, 0], 0.5);
    initCameraMovement(camera, settings, sceneInformation);
    // Load texture
    // Flip image pixels to bottom-to-top order because webgl uses different order than browser.
    
    let then = 0;

    gameLogic.startGame();

    function renderer(now) {
      now *= 0.001; // Convert time to seconds
      deltaTime = now - then;
      then = now;

      gameLogic.updateOnFrame(deltaTime);
      updateCamera(camera, sceneInformation, deltaTime);

      drawScene(programInfo, canvas, settings, sceneInformation); //Draw the current scene.
      var fps = (Math.round(1 / deltaTime)) 
      if(isFinite(fps)){ // tree: sometimes fps becomes infinity, when deltatime is 0, happens sometimes on button click for menu open
        document.getElementById("fps-counter").innerHTML = fps;
      }

      requestAnimationFrame(renderer);
    }  
    setLoading(false);
    requestAnimationFrame(renderer);
  });
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


