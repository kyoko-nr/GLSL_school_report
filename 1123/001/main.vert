attribute vec3 position;
attribute vec2 texCoord;

uniform vec2 mouse;
uniform mat4 mvpMatrix;

varying vec2 vTexCoord;
varying vec2 vMouse;

void main() {
  vec2 toMouse = mouse - position.xy;
  float distance = length(toMouse);
  vec2 normalized = normalize(toMouse);
  vec2 offset = normalized * 0.1 * (1.0 - distance);

  vMouse = toMouse;
  vTexCoord = texCoord + offset;

  gl_Position = mvpMatrix * vec4(position, 1.0);
  gl_Position = vec4(position, 1.0);
}
