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
  vec4 samplerColor0 = texture2D(textureUnit0, vTexCoord);
  vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);
  vec4 mono = texture2D(textureUnit2, vTexCoord);

  float r = clamp(mono.r + time * 2.0 - 1.0, 0.0, 1.0);

  vec4 outColor = mix(samplerColor0, samplerColor1, easeOutExpo(r));
  gl_FragColor = outColor;
}
