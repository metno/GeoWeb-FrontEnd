import React from 'react';

const CanvasComponent = React.createClass({
  propTypes: {
    onRenderCanvas: React.PropTypes.func,
    onClickCanvas: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },
  getDefaultProps () {
    return {
      width:300,
      height:300,
      onRenderCanvas:function () {},
      onClickCanvas:function () {}
    };
  },
  componentDidMount () {
    this.updateCanvas();
  },
  updateCanvas () {
    if (!this.refs) return;
    if (!this.refs.canvas) return;
    let canvas = this.refs.canvas;
    let callBack = this.props.onClickCanvas;

    this.refs.canvas.addEventListener('mousemove', function (event) {
      let x = event.clientX - canvas.offsetLeft;
      let y = event.clientY - canvas.offsetTop;
      if (event.buttons === 1) {
        callBack(x, y);
      }
    });
    this.refs.canvas.addEventListener('click', function (event) {
      let x = event.clientX - canvas.offsetLeft;
      let y = event.clientY - canvas.offsetTop;
      callBack(x, y);
    });
    this.props.onRenderCanvas(this.refs.canvas.getContext('2d'));
  },
  render () {
    return (
      <canvas ref='canvas' width={this.props.width} height={this.props.height} />
    );
  }
});

export default CanvasComponent;