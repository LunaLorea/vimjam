export function transformScreenToWorldPosition(
  ray,
  elevation,
) {

  const position = intersectLinePlane(ray, [0, 1, 0], [0, elevation, 0]);
  if (position == null) {
    return null;
  }
  vec3.sub(position, [0, 0, 0], position); 
  return position;
}

export function getMouseRay(projectionMatrix, camViewMatrix, screenCoordinates = [0, 0], canvas) {
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

  return {vec: ray, origin: start};
}


function intersectLinePlane(ray, planeN, planeP) {
  const lineV = ray.vec;
  const lineP = ray.origin;
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

export function checkSphereIntersection(spherePosition, sphereRadius, ray) {
  const normLineVec = vec3.create();
  vec3.normalize(normLineVec, ray.vec);
  const lineOriginMinusSphereCenter = vec3.create();
  vec3.sub(lineOriginMinusSphereCenter, ray.origin, spherePosition);
  const radius = sphereRadius;

  let det = Math.pow(vec3.dot(normLineVec, lineOriginMinusSphereCenter), 2) 
    - (vec3.dot(lineOriginMinusSphereCenter, lineOriginMinusSphereCenter) - Math.pow(radius, 2))
  console.log(normLineVec, lineOriginMinusSphereCenter, radius, det);
  return (det >= 0);
}
