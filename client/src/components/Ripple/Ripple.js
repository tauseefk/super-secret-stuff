import React, { PureComponent } from 'react';
import './Ripple.css';

const mouseStates = [
  "down",
  "click",
  "up"
]
export default class Ripple extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mouseState: "up",
      pageX: 0,
      pageY: 0,
      offsetX: 0,
      offsetY: 0
    }
    this.defaultColor = [19, 106, 177, 0.5]; // R, G, B, A
    this.defaultSize = 20;
  }

  handleDrag = (e) => {
    let mousePosition = {
      pageX: e.pageX,
      pageY: e.pageY
    }
    this.setState(prevState => ({
      mouseState: "down",
      ...mousePosition
    }
    ));

    this.props.addEventToQueue({
      timestamp: Date.now(),
      type: "drag",
      ...mousePosition
    });
  }

  handleMouseMove = (e) => {
    let mousePosition = {
      pageX: e.pageX,
      pageY: e.pageY
    }

    this.setState(prevState => ({
      ...mousePosition
    }
    ));

    this.props.addEventToQueue({
      timestamp: Date.now(),
      type: "mousemove",
      ...mousePosition
    });
  }

  handleMouseDown = (e) => {
    if (this.state.animating === true) {
      clearTimeout(this._resetTimer);
      this.resetAnimation();
    }
    let mousePosition = {
      pageX: e.pageX,
      pageY: e.pageY
    }
    this.setState(prevState => ({
      mouseState: "down",
      ...mousePosition
    }
    ));

    this.props.addEventToQueue({
      timestamp: Date.now(),
      type: "mousedown",
      ...mousePosition
    });
  }

  causeRipple = (e) => {
    if (this.state.mouseState !== "up") {
      clearTimeout(this._resetTimer);
      this.resetAnimation();
    }
    let mousePosition = {
      pageX: e.pageX,
      pageY: e.pageY
    }
    this.setState(prevState => ({
      mouseState: "up",
      ...mousePosition
    }
    ));
    this._resetTimer = window.setTimeout(this.resetAnimation, 350);
  }

  resetAnimation = () => {
    this.setState(prevState => ({ pageX: -20, pageY: -20, mouseState: "up" }));
  }

  render() {
    let style = { // TODO: clean the calculations
      left: this.state.pageX - (this.props.radius || this.defaultSize),
      top: this.state.pageY - (this.props.radius || this.defaultSize),
      width: this.props.radius * 2 || this.defaultSize * 2,
      height: this.props.radius * 2 || this.defaultSize * 2,
      backgroundColor: `rgb(${this.props.backgroundColor || this.defaultColor})`
    };
    return (
      <div
        onDrag={this.handleDrag}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.causeRipple}
        onMouseMove={this.handleMouseMove} // XXX: This is too frequent and results in ajax 413
      >
        {this.props.children}
        <span
          draggable='true'
          className={this.state.mouseState === "down"
            ? "ripple ripple-stay"
            : this.state.mouseState === "up"
              ? "animation-ripple ripple"
              : "ripple"}
          style={style}
        >
        </span>
      </div >
    )
  }
}
