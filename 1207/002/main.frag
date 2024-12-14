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
  float lefteye = circle(coord + vec2(-0.19, -0.16), radius, vec2(0.7,1.0));
  float righteye = circle(coord + vec2(0.19, -0.16), radius, vec2(0.7,1.0));
  return lefteye + righteye;
}

float mouth(vec2 coord, float radius, float lineWidth) {
  float mouth = outline(coord, radius, lineWidth);
  // 上部分を消す
  mouth = step(0.1, coord.y * -1.0) * mouth;
  return mouth;
}

// ニコちゃんマークをかく
float nikochan(vec2 coord) {
  // 輪郭
  float outlineColor = outline(coord, 0.3, 0.01);
  // 目
  float eye = eyes(coord, 0.015);
  // 口
  float mouth = mouth(coord, 0.156, 0.01);
  return outlineColor + eye + mouth;
}

void main() {
  // gl_FragCoord.xy を解像度で割って正規化する（0.0 ～ 1.0）
  vec2 coord = gl_FragCoord.xy / resolution;
  // 正負の方向に -1.0 ～ 1.0 で値が分布するように変換
  vec2 signedCoord = coord * 2.0 - 1.0;

  // aspect ratioを計算
  float aspect = resolution.x / resolution.y;
  vec2 correctedCoord = vec2(signedCoord.x * aspect, signedCoord.y);

  float r =  (sin(param * 2.0) + 1.0) * 0.5;
  float g =  (cos(param * 2.0) + 1.0) * 0.5;
  float b =  (sin(param * 2.0 + 5.0) + 1.0) * 0.5;
  vec3 baseColor = vec3(r, g, b);

  vec3 nikoColor = vec3(0.0);
  for(int i = 0; i < 5; ++i) {
    // 時間によって位置をずらす
    float offset = 0.2 * float(i);
    float x = sin( (-time + offset) * 2.0) * 0.5;
    float y = cos(-time + offset) * 0.5;
    vec2 movedCoord = correctedCoord - vec2(x, y);
    // ニコちゃんを計算
    float niko = nikochan(movedCoord);
    // 色をずらす
    vec3 color = vec3(baseColor.r - offset, baseColor.g - offset, baseColor.b);
    // 色を加算
    nikoColor += color * niko;
  }

  gl_FragColor = vec4(nikoColor, 1.0);
}
