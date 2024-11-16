attribute vec3 position;

uniform vec2 mouse;
uniform float time;

varying vec4 vColor;

void main() {
  vec2 toMouse = mouse - position.xy;
  float dist = length(toMouse);

  // 🍎 sin()でbrightenessを0.0〜1.0の間でアニメーションさせたい、、が意図した通りに動かない
  // float brighteness = sin(time) * 0.5 + 1.0;
  float brighteness = time;

  if(dist < 0.02) {
    vColor = vec4(0.8902, 0.9059, 0.0, 1.0);
  } else {
    vColor = vec4(0.09, 0.76, 0.92, brighteness);
  }

  gl_Position = vec4(position, 1.0);
  gl_PointSize = 20.0;
}
