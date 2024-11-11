/**
 * Renders something using the WebGL context.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 */
function loadObject(url) {
  let obj = {};

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.blob();  // Convert the response to a blob
    })
    .then(blob => {
      // Pass the blob to FileReader for reading and parsing
      readFile(blob);
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));

  function readFile(blob) {
    const reader = new FileReader();

    reader.onload = function(event) {
      const fileContent = event.target.result;
      // You can now process the file content here
      parseFile(fileContent);
    };

    reader.onerror = function(event) {
      console.error("File could not be read: " + event.target.error);
    };

    // Read the blob as text or any other format as needed
    const content = reader.readAsText(blob);  // Reads the file as a text string
  }

  // @param {String} content
  function parseFile(content) {
    let vertexPositions = [];
    let vertexNormals = [];
    let textureCoordinates = [];
    let faces = [];


    const lines = content.split('\n')
    lines.forEach(parseLine);
    function parseLine(line) {
      const words = line.split(' ');
      switch(words[0]) {
        case "v":
          parseVertexPosition(words);
          break;
        case "vn":
          parseVertexNormal(words);
          break;
        case "vt":
          parseTextureCoordinates(words);
          break;
        case "f":
          parseFace(words);
          break;
      }
    }

    function parseVertexPosition(words) {
      if (words.length != 4) {
        console.error('vertex position in obj file malformed');
        return;
      }

      vertexPositions.push(parseFloat(words[1])); // x
      vertexPositions.push(parseFloat(words[2])); // y
      vertexPositions.push(parseFloat(words[3])); // z
    }

    function parseVertexNormal(words) {
      if (words.length != 4) {
        console.error('vertex normal in obj file malformed');
        return;
      }

      vertexNormals.push(parseFloat(words[1])); // x
      vertexNormals.push(parseFloat(words[2])); // y
      vertexNormals.push(parseFloat(words[3])); // z
    }
    
    function parseTextureCoordinates(words) {
      if (words.length != 3) {
        console.error('vertex position in obj file malformed');
        return;
      }

      textureCoordinates.push(parseFloat(words[1]));
      textureCoordinates.push(parseFloat(words[2]));
    }

    function parseFace(words) {
      if (words.length < 3) {
        console.error('face in obj file malformed');
        return;
      }
      // A face is a list of triplets vertex_index/texture_index/normal_index
      let vertices = [];
      let numElements = words.length;
      for (let i = 1; i < numElements; i++) {
        vertices.push(words[i].split('/'));
      }
      faces.push(vertices.map(parseFloat));
    }
    obj.vertexPositions = vertexPositions;
    obj.vertexNormals = vertexNormals;
    obj.textureCoordinates = textureCoordinates;
    obj.faces = faces;

  }

  return obj;
}

export { loadObject };
