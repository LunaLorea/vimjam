import { drawScene } from "./modules/draw-scene.js";
import { importString } from "./modules/importString.js";
import SceneInformation from "./modules/SceneInformation.js";
import { initCameraMovement, updateCamera } from "./modules/cameraMovement.js";
import { initKeyboardInput } from "./modules/inputHandler.js";
import GameLogic from "./modules/gameLogic.js";

let deltaTime = 0;


const settings = {
  // Graphics
  FOV: 90.0,
  zoomMax: 30,
  zoomMin: 2,
  cameraSpeed: 4,
  cameraRotationSpeed: 1 / 150,

  keyMap: new Map(),
}

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
    },
  };
  

  // Load Models
  const models = [
    ["sphere", "models/sphere.obj", "textures/Mossy_Cobblestone.png"],
    ["cube", "models/cube.obj", "textures/Mossy_Cobblestone.png"],
    ["ape", "models/ape.obj", "textures/Mossy_Cobblestone.png"],
    ["hexagonal-prism", "models/hexagonal-prism.obj", "textures/Mossy_Cobblestone.png"],
    ["test", "models/test.obj", "textures/Mossy_Cobblestone.png"],
    ["hexagonal-plate-straight", "models/gerade.obj", "textures/Mossy_Cobblestone.png"],
    ["hexagonal-plate-curve", "models/kurve.obj", "textures/Mossy_Cobblestone.png"],
    ["hexagonal-plate-split", "models/y.obj", "textures/Mossy_Cobblestone.png"],
    ["empty", "models/leer.obj", "textures/Mossy_Cobblestone.png"],
    ["placement", "models/placement.obj", "textures/Mossy_Cobblestone.png"],
    ["audience", "models/publikum.obj", "textures/Mossy_Cobblestone.png"],
    ["tires", "models/reifen.obj", "textures/Mossy_Cobblestone.png"],
    ["stop", "models/stop.obj", "textures/Mossy_Cobblestone.png"],
    ["finishline", "models/ziel.obj", "textures/Mossy_Cobblestone.png"],
  ];
  
  const sceneInformation = new SceneInformation(gl);
  sceneInformation.initObjectTypes(models).then( () => {
    sceneInformation.settings = settings;

    const gameLogic = new GameLogic(sceneInformation);
    initKeyboardInput(sceneInformation);

    const camera = sceneInformation.addNewCamera([0, 0, 0], [0, 10, 10], [0, 0, 0], 0.5);
    initCameraMovement(camera, settings, sceneInformation);
    // Load texture
    const texture = loadTexture(gl, "textures/test_initialShadingGroup_BaseColor.png");
    const texture2 = loadTexture(gl, "textures/Mossy_Cobblestone.png");
    // Flip image pixels to bottom-to-top order because webgl uses different order than browser.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    canvas.addEventListener("mousedown", () => {
      sceneInformation.mouseMoved = false;
    });
    canvas.addEventListener("mouseup", () => {
      if (!sceneInformation.mouseMoved) {
        placeHexagon();
      }
    });
    
    let count = 0;
    async function placeHexagon() {
      var x = sceneInformation.mouseInWorld[0];
      var y = sceneInformation.mouseInWorld[2];
      var size = 1;
      
      var hex = pixelToFlatHexFraction(x, y);
      var position = flat_hex_to_pixel(hex.q, hex.r);

      console.log(JSON.stringify(hex) + " " + JSON.stringify(position));
      function pixelToFlatHexFraction(x, y) {
        var q = ( 2./3 * x                  ) / size
        var r = (-1./3 * x  +  Math.sqrt(3)/3 * y) / size
        return {q: Math.round(q), r: Math.round(r)};
      }

      function flat_hex_to_pixel(q, r) {
        var x = size * (     3./2 * q                    )
        var y = size * (Math.sqrt(3)/2 * q  +  Math.sqrt(3) * r)
        return {x: x, y: y};
      }
      
      let rot = 0;
      if (count % 4 == 0) {
        sceneInformation.addNewObject("hexagonal-plate-straight", [position.x, 0, position.y], [0, rot, 0], 1, texture);
      }
      if (count % 4 == 1) {
        sceneInformation.addNewObject("hexagonal-plate-curve", [position.x, 0, position.y], [0, rot, 0], 1, texture);
      }
      if (count % 4 == 2) {
        sceneInformation.addNewObject("hexagonal-plate-split", [position.x, 0, position.y], [0, rot, 0], 1, texture);
      }
      if (count % 4 == 3) {
        sceneInformation.addNewObject("empty", [position.x, 0, position.y], [0, rot, 0], 1, texture);
      }

      count++;
    }


    sceneInformation.addNewObject("hexagonal-plate-straight", [0, 0, 0], [0, 0, 0], 1, texture);
    sceneInformation.addNewObject("hexagonal-plate-curve", [5, 0, 0], [0, 0, 0], 1, texture);
    sceneInformation.addNewObject("hexagonal-plate-split", [10, 0, 0], [0, 0, 0], 1, texture);
    sceneInformation.addNewObject("empty", [15, 0, 0], [0, 0, 0], 1, texture);
    sceneInformation.addNewObject("placement", [20, 0, 0], [0, 0, 0], 1, texture);
    sceneInformation.addNewObject("audience", [25, 0, 0], [0, 0, 0], 1, texture);
    sceneInformation.addNewObject("tires", [30, 0, 0], [0, 0, 0], 1, texture);
    sceneInformation.addNewObject("stop", [35, 0, 0], [0, 0, 0], 1, texture);
    sceneInformation.addNewObject("finishline", [40, 0, 0], [0, 0, 0], 1, texture);


    let then = 0;

    gameLogic.startGame();

    function renderer(now) {
      now *= 0.001; // Convert time to seconds
      deltaTime = now - then;
      then = now;


      updateCamera(camera, sceneInformation, deltaTime);

      drawScene(programInfo, canvas, settings, sceneInformation); //Draw the current scene.
      var fps = (Math.round(1 / deltaTime))
      document.getElementById("fps-counter").innerHTML = fps;

      requestAnimationFrame(renderer);
    }  
    
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


