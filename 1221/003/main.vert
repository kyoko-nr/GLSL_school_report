attribute vec3 position;
attribute vec2 texCoord;

uniform vec2 mouse;
uniform mat4 mvpMatrix;

varying vec2 vTexCoord;
varying vec2 vMouse;

void main() {
  vTexCoord = texCoord;
  gl_Position = vec4(position, 1.0);
}
