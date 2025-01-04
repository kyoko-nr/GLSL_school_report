precision mediump float;

uniform sampler2D textureUnit0;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform float time;

varying vec2 vTexCoord;

float easeOutExpo(float num) {
  if(num == 1.0) {
    return 1.0;
  } else {
    return 1.0 - pow(2.0, -10.0 * num);
  }
}

void main() {
  vec2 coord = vec2(0.0);

  float brightness = clamp(time * 0.5, 0.0, 1.0);

  // 表示中の画像
  float x0 = easeOutExpo(time * -0.01);
  vec2 coord0 = vTexCoord + vec2(x0, 0.0);
  vec4 samplerColor0 = texture2D(textureUnit0, coord0);
  samplerColor0 *= vec4(1.0 - brightness);

  // オーバーラップする画像
  // float x1 = easeOutExpo(time * 0.01);
  float offset = clamp(0.01 - time * 0.01, 0.0, 0.01);
  float o = easeOutExpo(offset);
  // vec2 coord1 = vTexCoord - vec2(offset, 0.0) + vec2(x1, 0.0);
  vec2 coord1 = vTexCoord - vec2(offset, 0.0);
  vec4 samplerColor1 = texture2D(textureUnit1, coord1);

  // テクスチャ
  vec4 mono = texture2D(textureUnit2, vTexCoord);

  float r = clamp(mono.r + time * 2.0 - 1.0, 0.0, 1.0);

  vec4 outColor = mix(samplerColor0, samplerColor1, easeOutExpo(r));
  // vec4 outColor = mix(samplerColor0, samplerColor1, r);
  gl_FragColor = outColor;
}
