export function transformScreenToWorldPosition(
  projectionMatrix, 
  camViewMatrix, 
  screenCoordinates,
  canvas,
  elevation,
) {
  const transformMatrix = mat4.create();
  mat4.copy(transformMatrix, projectionMatrix);

  mat4.mul(transformMatrix, transformMatrix, camViewMatrix);
  mat4.invert(transformMatrix, transformMatrix);
  
  const rect = canvas.getBoundingClientRect();
  const x = screenCoordinates[0] - rect.left;
  const y = screenCoordinates[1] - rect.top;

  const clipX = x / rect.width  *  2 - 1;
  const clipY = y / rect.height * -2 + 1;

  const start = vec3.create();
  vec3.transformMat4(start, [clipX, clipY, -1], transformMatrix);
  const end   = vec3.create();
  vec3.transformMat4(end, [clipX, clipY,  1], transformMatrix);

  
  const ray = vec3.create();
  vec3.sub(ray, end, start);
  const position = vec3.create();
  vec3.sub(position, position, intersectLinePlane(ray, start, [0, 1, 0], [0, elevation, 0]));
  return position;
}


function intersectLinePlane(lineV, lineP, planeN, planeP) {
  vec3.normalize(lineV, lineV)
  vec3.normalize(planeN, planeN)
  const dotProduct = vec3.dot(lineV, planeN);
  if (dotProduct < 1e-6 && dotProduct > -1e-6) {
    return null;
  }

  const lineminusplane = vec3.create();
  vec3.sub(lineminusplane, lineP, planeP);

  let scalar = vec3.dot(planeN, lineminusplane) / vec3.dot(planeN, lineV);
  const intersection = vec3.create();
  vec3.scale(intersection, lineV, scalar);
  vec3.sub(intersection, intersection, lineP);
  return intersection;
}
