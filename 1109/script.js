import { WebGLUtility, ShaderProgram } from '../lib/webgl.js';

document.addEventListener("DOMContentLoaded", async () => {
  const app = new WebGLApp();
  window.addEventListener("resize", app.resize, false);
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
      attribute: [
        "position",
      ],
      stride: [
        3,
      ]
    })
  }

  /**
   * セットアップ
   */
  setup() {
    this.setupGeometry();
    this.resize();
    this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
    this.running = false;
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

    // プログラムオブジェクトの設定
    this.ShaderProgram.use();
    this.ShaderProgram.setAttribute(this.vbo);

    // 描画
    gl.drawArrays(gl.POINTS, 0, this.position.length / 3)
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
}

/**
 * min ~ maxの範囲にあるvalを -1.0 ~ 1.0に正規化する
 * @param {number} val 正規化する値
 * @param {object} range 範囲
 * @property {number} min 最小値
 * @property {number} max 最大値
 */
const normalize = (val, {min, max}) => {
  const ratio = val / (max - min);
  return ratio * 2.0 - 1.0;
}
