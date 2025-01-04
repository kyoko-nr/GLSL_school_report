import { WebGLUtility, ShaderProgram } from '../../lib/webgl.js';
import { normalize } from '../../utils/normalize.js';
import {WebGLOrbitCamera} from "../../lib/camera.js";
import { WebGLMath } from '../../lib/math.js';
import { Pane } from '../../lib/tweakpane-4.0.0.min.js';

document.addEventListener("DOMContentLoaded", async () => {
  const app = new WebGLApp();
  // イベントリスナーを登録
  // app.canvas.addEventListener("pointermove", (e) => app.setPointerPos(e), false);
  window.addEventListener("resize", app.resize, false);
  // window.addEventListener("pointermove", (e) => app.setPointerPos(e), false);

  // appを初期化して描画
  app.init("webgl");
  await app.load()
  app.setup();
  app.render();
}, false)

class WebGLApp {
  constructor() {
    this.canvas = null;
    this.canvasSize = {width: 0, height: 0};
    this.gl = null;
    this.running = false;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    // uniform
    this.uMouse = [0.0, 0.0];
    this.uRatio = 0.1;
    this.uTime = 0;
    this.uRgb = 0;
    this.previousTime = Date.now();

    // tweakpane を初期化
    const pane = new Pane();
    pane.addBlade({
      view: 'slider',
      label: 'ratio',
      min: 0.0,
      max: 1.0,
      value: this.uRatio,
    })
    .on('change', (v) => {
      this.uRatio = v.value;
    });
    pane.addBlade({
      view: 'list',
      label: 'noise',
      options: [
        {text: 'poyo', value: 0},
        {text: 'jeans', value: 1},
        {text: 'lego', value: 2},
        {text: 'lv', value: 3},
        {text: 'paints', value: 4},
        {text: 'randomcube', value: 5},
        {text: 'wave', value: 6},
      ],
      value: 0,
    })
    .on('change', (v) => {
      const gl = this.gl;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.noise[v.value]);
    });
    pane.addBlade({
      view: 'list',
      label: 'RGB',
      options: [
        {text: 'R', value: 0},
        {text: 'G', value: 1},
        {text: 'B', value: 2},
      ],
      value: 0,
    })
    .on('change', (v) => {
      this.uRgb = v.value;
    });
  }

  /**
   * シェーダーを読み込み
   */
  async load() {
    const vs = await WebGLUtility.loadFile('./main.vert');
    const fs = await WebGLUtility.loadFile('./main.frag');
    this.shaderProgram = new ShaderProgram(this.gl, {
      vertexShaderSource: vs,
      fragmentShaderSource: fs,
      // attribute や uniform の構成がシェーダと一致するように気をつける @@@
      attribute: [
        'position',
        'texCoord',
      ],
      stride: [
        3,
        2,
      ],
      uniform: [
        'mvpMatrix',
        'textureUnit0', // テクスチャユニット
        "textureUnit1",
        "mouse",
        "ratio",
        "time",
        "rgb",
      ],
      type: [
        'uniformMatrix4fv',
        'uniform1i', // テクスチャユニットは整数値なので 1i を使う
        'uniform1i', // テクスチャユニットは整数値なので 1i を使う
        "uniform2fv",
        "uniform1f",
        "uniform1f",
        "uniform1i",
      ],
    });
    // 画像の読み込み
    this.texture0 = await WebGLUtility.createTextureFromFile(this.gl, "./images/image.jpg");
    this.noise = [
      await WebGLUtility.createTextureFromFile(this.gl, "./images/poyo.png"),
      await WebGLUtility.createTextureFromFile(this.gl, "./images/jeans.jpg"),
      await WebGLUtility.createTextureFromFile(this.gl, "./images/lego.jpg"),
      await WebGLUtility.createTextureFromFile(this.gl, "./images/lv.jpg"),
      await WebGLUtility.createTextureFromFile(this.gl, "./images/paints.jpg"),
      await WebGLUtility.createTextureFromFile(this.gl, "./images/randomcube.jpg"),
      await WebGLUtility.createTextureFromFile(this.gl, "./images/wave.jpg"),
    ];
  }

  /**
   * セットアップ
   */
  setup() {
    const gl = this.gl;
    const cameraOption = {
      distance: 2.0,
      min: 1.0,
      max: 10.0,
      move: 2.0,
    };
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption);

    this.setupGeometry();
    this.resize();
    this.running = true;

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.noise[0]);
  }

  /**
   * 頂点情報のセットアップ
   */
  setupGeometry() {
    // 頂点座標
    this.position = [
      -1.0,  1.0,  0.0,
       1.0,  1.0,  0.0,
      -1.0, -1.0,  0.0,
       1.0, -1.0,  0.0,
    ];
    // テクスチャ座標
    this.texCoord = [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
    ];
    // vboのセット
    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.position),
      WebGLUtility.createVbo(this.gl, this.texCoord),
    ];
  }

  /**
   * 描画
   */
  render() {
    const gl = this.gl;
    const m4 = WebGLMath.Mat4;
    const v3 = WebGLMath.Vec3;

    // running が true の場合は requestAnimationFrame を呼び出す
    if (this.running === true) {
      requestAnimationFrame(this.render);
    }

    // ビューポートの設定と背景色・深度値のクリア
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // - 各種行列を生成する ---------------------------------------------------
    // モデル座標変換行列
    const rotateAxis  = v3.create(0.0, 1.0, 0.0);
    // const rotateAngle = this.uTime * 0.2;
    const m = m4.rotate(m4.identity(), 0, rotateAxis);

    // ビュー座標変換行列（WebGLOrbitCamera から行列を取得する）
    const v = this.camera.update();

    // プロジェクション座標変換行列
    const fovy   = 60;                                     // 視野角（度数）
    const aspect = this.canvas.width / this.canvas.height; // アスペクト比
    const near   = 0.1;                                    // ニア・クリップ面までの距離
    const far    = 20.0;                                   // ファー・クリップ面までの距離
    const p = m4.perspective(fovy, aspect, near, far);

    // 行列を乗算して MVP 行列を生成する（行列を掛ける順序に注意）
    const vp = m4.multiply(p, v);
    const mvp = m4.multiply(vp, m);
    // ------------------------------------------------------------------------

    const now = Date.now();
    const time = (now - this.previousTime) / 1000;
    this.uTime += time;
    this.previousTime = now;

    // プログラムオブジェクトを指定し、VBO と uniform 変数を設定
    this.shaderProgram.use();
    this.shaderProgram.setAttribute(this.vbo);
    this.shaderProgram.setUniform([
      mvp,
      0, // 使いたいテクスチャのバインドされているユニット番号 @@@
      1,
      this.uMouse,
      this.uRatio,
      this.uTime,
      this.uRgb,
    ]);

    // 描画
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.position.length / 3);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.position.length / 3);
  }

  /**
   * リサイズ
   */
  resize() {
    const height = window.innerHeight;
    this.canvas.width = height;
    this.canvas.height = height;
    this.canvasSize = {width: height, height: height}
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
      this.canvas.addEventListener("pointermove", (e) => {
        this.uMouse = setPointerPos(e)
      }, false)
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

// PointerEventを受け取って、-1〜1に正規化した値を返す
const setPointerPos = (e) => {
  const target = e.target;
  const rect = target.getBoundingClientRect();
  const x = normalize(e.pageX, {min: rect.left, max: rect.right});
  const y = normalize(e.pageY, {min: rect.top, max: rect.bottom});
  return [x, -y]
}