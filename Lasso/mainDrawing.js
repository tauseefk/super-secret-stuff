'use strict';

const vsSource = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  // gl_Position = vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;
}`;

const fsSource = `
precision highp float;

uniform float uBrightness;
uniform float uContrast;
uniform int uSelectionState;

varying vec2 vTextureCoord;
uniform sampler2D uImage;
uniform sampler2D uSelection;

void main(void) {
  vec3 color = texture2D(uImage, vTextureCoord).rgb;
  vec3 selection = texture2D(uSelection, vTextureCoord).rgb;

  if(selection.r == 1.0 && uSelectionState == 1) { // selected part
    
    gl_FragColor.rgb = mix(selection, color, 0.6);

  } else if(selection.r == 1.0 && uSelectionState == 2) { // selected part
    
    vec3 colorContrasted = (color) * uContrast;
    vec3 bright = colorContrasted + vec3(uBrightness, uBrightness, uBrightness);
    gl_FragColor.rgb = bright;
  
  } else {
    gl_FragColor.rgb = color.rgb;
  }
  gl_FragColor.a = 1.0;
}
`;

var clearScreen = () => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

var initShaderProgram = (gl, vsSource, fsSource) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

var loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

var mapShaderProperties = (gl) => {
  var shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoordinates: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      brightness: gl.getUniformLocation(shaderProgram, 'uBrightness'),
      contrast: gl.getUniformLocation(shaderProgram, 'uContrast'),
      selectionState: gl.getUniformLocation(shaderProgram, 'uSelectionState'),
      imageSampler: gl.getUniformLocation(shaderProgram, 'uImage'),
      selectionSampler: gl.getUniformLocation(shaderProgram, 'uSelection'),
    },
  };
  window.programInfo = programInfo;
}

var setupScene = (gl, programInfo) => {

  const fieldOfView = 37 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  gl.viewport(0, 0, gl.canvas.width * devicePixelRatio, gl.canvas.height * devicePixelRatio);

  mat4.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);

  const modelViewMatrix = mat4.create();

  mat4.translate(modelViewMatrix,
    modelViewMatrix,
    [-0.0, 0.0, -3.0]);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);

  gl.uniform1i(programInfo.uniformLocations.imageSampler, 0);
  gl.uniform1i(programInfo.uniformLocations.selectionSampler, 1);

  gl.uniform1f(programInfo.uniformLocations.brightness, 0.3);
  gl.uniform1f(programInfo.uniformLocations.contrast, 1.0);
  gl.uniform1i(programInfo.uniformLocations.selectionState, 1);
}

var initImageTexture = (gl, image) => {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

var initRectBuffer = (gl) => {
  var rectBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rectBuffer);

  var positions = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return rectBuffer;
}

var initTextureCoordBuffer = (gl) => {
  var textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  var textureCoords = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

  return textureCoordBuffer;
}

var drawImage = (gl, image) => {

  gl.useProgram(programInfo.program);
  gl.uniform1i(programInfo.uniformLocations.imageSampler, 0);
  var buffers = {
    imageRect: initRectBuffer(gl),
    textureCoordinates: initTextureCoordBuffer(gl)
  }

  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.imageRect);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      2,
      gl.FLOAT,
      false,
      0,
      0);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoordinates);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoordinates,
      2,
      gl.FLOAT,
      false,
      0,
      0);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.textureCoordinates);
  }

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, imageTexture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.textureCoordBuffer);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

var initMousePositionsBuffer = (gl, mousePositions) => {

  const positionsBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mousePositions), gl.STATIC_DRAW);
  return positionsBuffer;
}

var initFrameBuffer = (gl) => {
  var renderFrameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, renderFrameBuffer);
  gl.viewport(0, 0, gl.canvas.width * devicePixelRatio, gl.canvas.height * devicePixelRatio);

  return renderFrameBuffer;
}

var initRenderTexture = (gl) => {
  const targetTextureWidth = gl.canvas.width * devicePixelRatio;
  const targetTextureHeight = gl.canvas.height * devicePixelRatio;
  const targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);

  {
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      targetTextureWidth, targetTextureHeight, border,
      format, type, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  return targetTexture;
}

var initSelectionTexture = (gl) => {
  const selectionTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, selectionTexture);

  {
    const level = 0;
    const internalFormat = gl.LUMINANCE;
    const width = 1;
    const height = 1;
    const border = 0;
    const format = gl.LUMINANCE;
    const type = gl.UNSIGNED_BYTE;
    const data = new Uint8Array([255]);
    const alignment = 1;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
      format, type, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  return selectionTexture;
}

var drawSelectionToTexture = (gl, mousePositions) => {
  var buffers = {
    mousePositions: initMousePositionsBuffer(gl, mousePositions),
    rect: initRectBuffer(gl),
    frame: initFrameBuffer(gl),
  }

  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.frame);
    var renderTargetTexture = initRenderTexture(gl);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTargetTexture, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  {
    var selectionTexture = initSelectionTexture(gl);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, selectionTexture);
    gl.uniform1i(programInfo.uniformLocations.selectionSampler, 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.frame);
  }
  drawSelection(gl, buffers, mousePositions.length / 3);

  // drawing both the textures (image and renderTexture) to the screen
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, renderTargetTexture);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    drawSelectionFromTexture(gl, buffers);
  }

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

var drawSelection = (gl, buffers, mousePositionsCount) => {
  gl.useProgram(programInfo.program);
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;

    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.mousePositions);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.mousePositions);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoordinates,
      2,
      gl.FLOAT,
      false,
      0,
      0);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.textureCoordinates);
  }

  const offset = 0;

  gl.drawArrays(gl.TRIANGLE_FAN, offset, mousePositionsCount);
}

var drawSelectionFromTexture = (gl, buffers) => {
  {
    const fieldOfView = 37 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix,
      modelViewMatrix,
      [-0.001, 0.0, -3.0]);

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  }
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;

    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.rect);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.rect);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoordinates,
      2,
      gl.FLOAT,
      false,
      0,
      0);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.textureCoordinates);
  }

  const offset = 0;

  gl.drawArrays(gl.TRIANGLE_STRIP, offset, 4);
}
