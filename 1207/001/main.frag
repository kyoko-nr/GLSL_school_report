precision mediump float;

uniform vec2 resolution; // canvas の解像度
uniform float time; // 時間の経過
uniform float param; // 汎用パラメータ

float circle(vec2 coord, float radius, vec2 ratio) {
  vec2 dist = coord / ratio;
  return 1.0 - smoothstep(radius - (radius * 0.01), radius + (radius * 0.01), dot(dist, dist));
}

float outline(vec2 coord, float radius, float lineWidth) {
  float inner = circle(coord, radius - lineWidth, vec2(1.0));
  float outer = circle(coord, radius + lineWidth, vec2(1.0));
  return outer - inner;
}

float eyes(vec2 coord, float radius) {
  float lefteye = circle(coord + vec2(-0.28, -0.2), radius, vec2(0.7,1.0));
  float righteye = circle(coord + vec2(0.28, -0.2), radius, vec2(0.7,1.0));
  return lefteye + righteye;
}

float mouth(vec2 coord, float radius, float lineWidth) {
  float mouth = outline(coord, radius, lineWidth);
  // 上部分を消す
  mouth = step(0.1, coord.y * -1.0) * mouth;
  return mouth;
}

void main() {
  // gl_FragCoord.xy を解像度で割って正規化する（0.0 ～ 1.0）
  vec2 coord = gl_FragCoord.xy / resolution;
  // 正負の方向に -1.0 ～ 1.0 で値が分布するように変換
  vec2 signedCoord = coord * 2.0 - 1.0;

  // aspect ratioを計算
  float aspect = resolution.x / resolution.y;
  vec2 correctedCoord = vec2(signedCoord.x * aspect, signedCoord.y);

  // 輪郭
  float outlineColor = outline(correctedCoord, 0.5, 0.02);
  // 目
  float eye = eyes(correctedCoord, 0.025);
  // 口
  float mouth = mouth(correctedCoord, 0.26, 0.02);

  float color = outlineColor + eye + mouth;
  vec3 yellow = vec3(1.0, 0.8, 0.0);

  gl_FragColor = vec4(vec3(color) * yellow, 1.0);
}
