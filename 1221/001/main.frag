precision mediump float;

uniform vec2 resolution; // canvas の解像度
uniform float time; // 時間の経過
uniform float param; // 汎用パラメータ

// 乱数生成
float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// ノイズ生成
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(random(i), random(i + vec2(1.0, 0.0)), u.x),
        mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}


// 流体エフェクト
float fbm(vec2 p) {
    float value = 0.0;
    float scale = 0.5;
    for (int i = 0; i < 5; i++) {
        value += noise(p) * scale;
        p *= 2.0;
        scale *= 0.5;
    }
    return value;
}

void main() {
  // gl_FragCoord.xy を解像度で割って正規化する（0.0 ～ 1.0）
  vec2 coord = gl_FragCoord.xy / resolution;
  // 中心を基準にする
  coord -= 0.5;
  coord *= vec2(resolution.x / resolution.y, 1.0);

  float n = fbm(coord * 2.0 - time * 0.1);

  vec3 color = vec3(0.2, 0.5, 1.0) * n;

  gl_FragColor = vec4(color, 1.0);
}
