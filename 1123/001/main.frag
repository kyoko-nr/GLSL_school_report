precision mediump float;

uniform sampler2D textureUnit;

varying vec2 vTexCoord;

void main() {
  // 0.8をかけて画像を拡大し、0.1ずつずらして歪ませた時に画像の端が映らないようにする
  vec2 multiplied = vTexCoord * vec2(0.8) + vec2(0.1, 0.1);
  vec4 samplerColor = texture2D(textureUnit, multiplied);
  gl_FragColor = samplerColor;
}
