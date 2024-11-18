attribute vec3 position;

uniform vec2 mouse;
uniform float time;
uniform float index;

varying vec4 vColor;

void main() {
  vec2 toMouse = mouse - position.xy;
  float dist = length(toMouse);
  float x = 0.0;
  float y = 0.0;

  // indexによってアニメーションを変える
  if(index < 1.0) {
    x = position.x;
    y = position.y;
  } else if (index < 2.0) {
    x = abs(position.x);
    y = abs(position.y);
  } else if (index < 3.0) {
    x = position.x * -1.0;
    y = position.y * -1.0;
  } else if (index < 4.0) {
    x = abs(position.x) * -1.0;
    y = abs(position.y) * -1.0;
  }

  float brighteness = sin(time * 0.004 + x + y) * 0.5 + 0.5;

  if(dist < 0.02) {
    vColor = vec4(0.8902, 0.9059, 0.0, 1.0);
  } else {
    vColor = vec4(0.09, 0.76, 0.92, brighteness);
  }

  gl_Position = vec4(position, 1.0);
  gl_PointSize = 20.0;
}
