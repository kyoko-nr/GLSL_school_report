precision mediump float;

uniform sampler2D textureUnit0;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform float ratio; // 変化の割合い @@@

varying vec2 vTexCoord;

void main() {
  // テクスチャからそれぞれサンプリング（抽出）する @@@
  vec4 samplerColor0 = texture2D(textureUnit0, vTexCoord);
  vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);
  vec4 noise = texture2D(textureUnit2, vTexCoord);

  float r = clamp(noise.g + ratio * 2.0 - 1.0, 0.0, 1.0);


  // 割合いに応じて色を線形補間する @@@
  vec4 outColor = mix(samplerColor0, samplerColor1, r);
  gl_FragColor = outColor;

  // gl_FragColor = texture2D(textureUnit2, vTexCoord);
}
