var ctx = null;
var lasso = null;
var gl = null;
var devicePixelRatio = window.devicePixelRatio || 1;
var rect = null;
var canvasEl = null;
var selectionStateEnum = {
  SELECTION_PROCESSING: 1,
  SELECTED: 2
}
var selectionVertices = [];
var imageTexture;

Array.prototype.concatAll = function () {
  var results = [];
  this.forEach(function (subArray) {
    if (Array.isArray(subArray))
      subArray.forEach((item) => results.push(item))
    else
      throw new Error('Its not two dimensional array;');
  });
  return results;
};

var setup = () => {
  canvasEl = document.querySelector("#glCanvas");
  rect = canvasEl.getBoundingClientRect();
  gl = canvasEl.getContext("webgl");
  var img = new Image();
  lasso = new Lasso();

  img.onload = function () {
    mapShaderProperties(gl);
    setupScene(gl, programInfo);
    imageTexture = initImageTexture(gl, img);
    clearScreen();
    drawImage(gl);
  };
  img.src = './backdrop.png';
}

document.addEventListener('DOMContentLoaded', () => {
  setup();
  canvasEl.addEventListener('mousemove', (e) => {
    let mousePosition = {
      x: e.clientX / gl.canvas.width * devicePixelRatio - 1,
      y: -(e.clientY / gl.canvas.height * devicePixelRatio - 1)
    }
    lasso.onMouseMove(ctx, mousePosition.x, mousePosition.y);
  });
  canvasEl.addEventListener('mousedown', (e) => {
    let mousePosition = {
      x: e.clientX / gl.canvas.width * devicePixelRatio - 1,
      y: -(e.clientY / gl.canvas.height * devicePixelRatio - 1)
    }
    clearScreen();
    lasso.onMouseDown(ctx, mousePosition.x, mousePosition.y);
  });
  canvasEl.addEventListener('mouseup', (e) => {
    let mousePosition = {
      x: e.clientX / gl.canvas.width * devicePixelRatio - 1,
      y: -(e.clientY / gl.canvas.height * devicePixelRatio - 1)
    }
    lasso.onMouseUp(ctx, mousePosition.x, mousePosition.y);
  });
  document.querySelector('#brightnessSlider').addEventListener('change', (e) => {
    document.querySelector('label').textContent = e.target.value;
    gl.uniform1f(programInfo.uniformLocations.brightness, e.target.value);
    gl.uniform1f(programInfo.uniformLocations.contrast, 1.0);
    drawSelectionToTexture(gl, lasso.getMousePositions().map(p => {
      return [p.x, p.y, 0.0];
    })
      .concatAll());
  });
});
