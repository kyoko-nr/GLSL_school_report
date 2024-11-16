attribute vec3 position;

uniform vec2 mouse;

varying float vDist;

void main() {
  vec2 toMouse = mouse - position.xy;
  float dist = length(toMouse);
  vDist = dist;
  gl_Position = vec4(position, 1.0);
  gl_PointSize = max(20.0 * (1.0 - dist), 5.0);
}
