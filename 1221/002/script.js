const MAP_RESOLUTION = 24;

let canvas;
let ctx;
let size = {width: 0, height: 0};

let colorMap;
let velocityMap;
let mapDisplaySize;
let MA1;
let gridSize;

const setup = () => {
  size = {width: window.innerWidth, height: window.innerHeight};
  canvas = document.querySelector("#webgl-canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  ctx = canvas.getContext("2d");
  mapDisplaySize = Math.min(size.width, size.height);
  gridSize = mapDisplaySize / MAP_RESOLUTION;

  initialize();
}

const initialize = () => {
  // colorMap initialization
  // [0,0,1] | [1,0,1]
  // ----------------
  // [0,1,1] | [1,1,1]
  colorMap = Array(MAP_RESOLUTION).fill().map((_, yi) => {
    return Array(MAP_RESOLUTION).fill().map((_, xi) => {
      return [
        xi < MAP_RESOLUTION / 2 ? 0 : 1,
        yi < MAP_RESOLUTION / 2 ? 0 : 1,
        1
      ]
    })
  });
  // velocity initialization
  // (-0.5 ,0.5) | (0.5, 0.5)
  // ------------------------
  // (-0.5, -0.5)|(-0.5, 0.5)
  velocityMap = Array(MAP_RESOLUTION).fill().map((_, yi) => {
    return Array(MAP_RESOLUTION).fill().map((_, xi) => {
      return [
        yi < MAP_RESOLUTION / 2 ? 0.5 : -0.5,
        xi < MAP_RESOLUTION / 2 ? -0.5 : 0.5
      ]
    })
  });
}

const drawLine = (x0, y0, x1, y1) => {
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineWidth = 1;
  ctx.stroke();
}

const renderVelocityMap = (xOffset, yOffset) => {
  for(let y = 0; y < MAP_RESOLUTION; y++) {
    for(let x = 0; x < MAP_RESOLUTION; x++) {
      const cx = xOffset + gridSize * x + gridSize * 0.5;
      const cy = yOffset + gridSize * y + gridSize * 0.5;
      const g = velocityMap[y][x];
      drawLine(
        cx - g[0] * gridSize * 0.25,
        cy - g[1] * gridSize * 0.25,
        cx + g[0] * gridSize * 0.25,
        cy + g[1] * gridSize * 0.25
      )
    }
  }
}

const toFillStyle = (rgb) => {
  return `rgb(
    ${Math.floor(255 * rgb[0])}
    ${Math.floor(255 * rgb[1])}
    ${Math.floor(255 * rgb[2])}
  )`
}

const renderColorMap = (xOffset, yOffset) => {
  for(let y = 0; y < MAP_RESOLUTION; y++) {
    for(let x = 0; x < MAP_RESOLUTION; x++) {
      const color = toFillStyle(colorMap[y][x]);
      ctx.fillStyle = color;
      ctx.fillRect(
        xOffset + gridSize * x,
        yOffset + gridSize * y,
        gridSize,
        gridSize
      )
    }
  }
}

const updateColorMap = () => {
  const newColorMap = [];
  for(let y = 0; y < MAP_RESOLUTION; y++) {
    newColorMap.push([]);
    for(let x = 0; x < MAP_RESOLUTION; x++) {
      const sx = x - velocityMap[y][x][0];
      const sy = y - velocityMap[y][x][1];
      newColorMap[y].push(sampleMap(colorMap, sx, sy));
    }
  }
  colorMap = newColorMap;
}

const smallerIndex = (n) => Math.floor(n + MAP_RESOLUTION) % MAP_RESOLUTION;

const largerIndex = (n) => Math.ceil(n + MAP_RESOLUTION) % MAP_RESOLUTION;

const lerpArrays = (arrayA, arrayB, t) => {
  const newArray = [];
  for(let i = 0; i < arrayA.length; i++) {
    newArray.push(arrayA[i] * (1 - t) + arrayB[i] * t);
  }
  return newArray;
}

const sampleMap = (map, sx, sy) => {
  const ix0 = smallerIndex(sx);
  const ix1 = largerIndex(sx);
  const iy0 = smallerIndex(sy);
  const iy1 = largerIndex(sy);
  const tx = sx - Math.floor(sx);
  const ty = sy - Math.floor(sy);
  const mixA = lerpArrays(map[iy0][ix0], map[iy0][ix1], tx);
  const mixB = lerpArrays(map[iy1][ix0], map[iy1][ix1], tx);
  const mix = lerpArrays(mixA, mixB, ty);
  return mix;
}

const draw = () => {
  const xOffset = (size.width - mapDisplaySize) / 2;
  const yOffset = (size.height - mapDisplaySize) / 2;
  renderColorMap(xOffset, yOffset);
  renderVelocityMap(xOffset, yOffset);
  updateColorMap();
}



const render = () => {
    draw();
    window.requestAnimationFrame(render)
  }
  
  
  setup();
  // render();
  draw();
  
  // window.requestAnimationFrame(draw);
