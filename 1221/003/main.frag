precision mediump float;

uniform sampler2D textureUnit0;
uniform sampler2D textureUnit1;
uniform float ratio;
uniform float time;
uniform int rgb;

varying vec2 vTexCoord;

void main() {
  // noiseテクスチャーを回す
  vec2 multiplied = vTexCoord * 0.5 + 0.25;
  vec2 noiseCoord = vec2(multiplied.x + cos(time) * 0.1, multiplied.y + sin(time) * 0.1);
  vec4 noise = texture2D(textureUnit1, noiseCoord);

  float color = rgb == 0 ? noise.r : rgb == 1 ? noise.g : noise.b;

  float r = smoothstep(0.4, 0.7, color);
  float rr = 1.0 - r * ratio;

// -0.5してからrrをかけて+0.5することで、中心から外側に向かって歪むようにする
  vec2 coord = ((vTexCoord - 0.5) * rr) + 0.5;

  vec4 samplerColor = texture2D(textureUnit0, coord );

  gl_FragColor = samplerColor;
}
