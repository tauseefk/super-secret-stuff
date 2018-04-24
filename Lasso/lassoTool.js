'use strict';

class Lasso {
  constructor() {
    this.startPosition = {
      x: null,
      y: null
    }
    this.endPosition = {
      x: null,
      y: null
    }
    this.isMouseDown = false;
    this.mousePositions = [];
    this.closingThreshold = 0.5;
  }

  onMouseDown(ctx, posX, posY) {
    this.mousePositions = []; // resetting mousePositions
    this.startPosition.x = posX;
    this.startPosition.y = posY;
    this.mousePositions.push({
      x: posX,
      y: posY
    });
    gl.uniform1i(programInfo.uniformLocations.selectionState, 1);
    this.isMouseDown = true;
  }

  onMouseUp(ctx, posX, posY) {
    this.endPosition.x = posX;
    this.endPosition.y = posY;
    this.mousePositions.push({
      x: posX,
      y: posY
    });
    this.isMouseDown = false;

    if (this.mousePositions.length > 10
      && Math.abs(this.getSquareDistance(this.endPosition,
        this.startPosition)) < this.closingThreshold * this.closingThreshold) {
      clearScreen();
      gl.uniform1i(programInfo.uniformLocations.selectionState, 2);
      drawSelectionToTexture(gl, this.mousePositions.map(p => {
        return [p.x, p.y, 0.0];
      })
        .concatAll());
    } else {
      clearScreen();
      gl.uniform1i(programInfo.uniformLocations.selectionState, 0);
      drawImage(gl);
    }
  }

  onMouseMove(ctx, posX, posY) {
    if (this.isMouseDown) {
      this.mousePositions.push({
        x: posX,
        y: posY
      });

      if (this.isMouseDown) {
        drawSelectionToTexture(gl, this.mousePositions.map(p => {
          return [p.x, p.y, 0.0];
        })
          .concatAll());
      }
    }
  }

  getMousePositions() {
    return this.mousePositions;
  }

  getSquareDistance(p1, p2) {
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
  }
}
