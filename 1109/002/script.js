import { WebGLUtility, ShaderProgram } from '../../lib/webgl.js';
import { normalize } from '../../utils/normalize.js';

document.addEventListener("DOMContentLoaded", async () => {
  const app = new WebGLApp();
  // イベントリスナーを登録
  window.addEventListener("resize", app.resize, false);
  window.addEventListener("pointermove", (e) => app.setPointerPos(e), false);

  // appを初期化して描画
  app.init("webgl");
  await app.load()
  app.setup();
  app.render();
}, false)

class WebGLApp {
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.running = false;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    // uniform
    this.uMouse = [Infinity, Infinity];
    this.uTime = 1.0;
  }

  /**
   * シェーダーを読み込み
   */
  async load() {
    const vs = await WebGLUtility.loadFile('./main.vert');
    const fs = await WebGLUtility.loadFile('./main.frag');
    this.ShaderProgram = new ShaderProgram(this.gl, {
      vertexShaderSource: vs,
      fragmentShaderSource: fs,
      attribute: ["position"],
      stride: [3],
      uniform: ["mouse", "time"],
      type: ["uniform2fv", "uniform1f"]
    })
  }

  /**
   * セットアップ
   */
  setup() {
    this.setupGeometry();
    this.resize();
    this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
    this.running = true;
  }

  /**
   * 頂点情報のセットアップ
   */
  setupGeometry() {
    this.position = [];

    //横幅を基準に頂点を等間隔に並べる
    const XCOUNT = 50;
    const YCOUNT = Math.round(window.innerHeight / window.innerWidth * XCOUNT);
    for(let i = 0; i < XCOUNT; i++) {
      const x = normalize(i, {min: 0, max: XCOUNT - 1});
      for(let j = 0; j < YCOUNT; j++) {
        const y = normalize(j, {min: 0, max: YCOUNT - 1});
        this.position.push(x, y, 0.0);
      }
    }
    // vboのセット
    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.position),
    ]
  }

  /**
   * 描画
   */
  render() {
    const gl = this.gl;
    if(this.running === true) {
      requestAnimationFrame(this.render);
    }
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 🍎 jsではなくシェーダーでsin()を使いたい
    this.uTime = Math.sin(Date.now() * 0.001) * 0.5 + 1;
    // this.uTime = Date.now() * 0.001;

    // プログラムオブジェクトの設定
    this.ShaderProgram.use();
    this.ShaderProgram.setAttribute(this.vbo);
    this.ShaderProgram.setUniform([this.uMouse, this.uTime]);

    // 描画
    gl.drawArrays(gl.POINTS, 0, this.position.length / 3);
  }

  /**
   * リサイズ
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * WebGLを実行するための初期化処理
   * @param {string} canvasId canvas要素のid
   * @param {*} option getContextに渡すoption
   */
  init(canvasId, option = {}) {
    const canvas = document.querySelector(`#${canvasId}`)
    if(canvas instanceof HTMLCanvasElement === true) {
      this.canvas = canvas
    }
    if (this.canvas == null) {
      throw new Error('invalid argument');
    }
    this.gl = this.canvas.getContext('webgl', option);
    if (this.gl == null) {
      throw new Error('webgl not supported');
    }
  }

  /**
   * pointerEventを受け取ってuniformにセットする
   * @param {PointerEvent} pointerEvent
   */
  setPointerPos(pointerEvent) {
    const x = normalize(pointerEvent.pageX, {min: 0, max: window.innerWidth});
    const y = normalize(pointerEvent.pageY, {min: 0, max: window.innerHeight});
    this.uMouse[0] = x;
    this.uMouse[1] = -y;
  }
}
