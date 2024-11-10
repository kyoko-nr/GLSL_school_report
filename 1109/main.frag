precision mediump float;

varying float vDist;

void main() {
  gl_FragColor = vec4(0.1, 0.4, 0.5, vDist);
}
