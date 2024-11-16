varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;
uniform highp float uAlpha;

void main(void) {
  // Get Color from the Texture
  highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

  // Multiply rgb values with the lighting we calculated in the VShader
  // leave alpha Value as is.
  gl_FragColor = vec4(texelColor.rgb * vLighting, uAlpha);
}
