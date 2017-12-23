import React, { Component } from 'react';

import P5Wrapper from 'react-p5-wrapper';


import './App.css';

import flowfield from './flowfieldSketch';
import ConfigForm from './ConfigForm';

const convertColor = (rgb, a) => {
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a/100})`;
};
// const convertColor = (hsl, a) => {
//   console.log(hsl);
//   return `hsba(${hsl.h},${hsl.s},${hsl.l},${a/100})`;
// };

const randomColor = () => {
  return Math.floor( Math.random() * 255 );
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      canvasWidth: 600,
      canvasHeight: 600,
      outer: 50,

      particleCount: 1000,
      particleExpire: 10,

      noiseSeed: Math.floor(Math.random() * 999999999999),

      flowAccuracy: 36,
      flowCellSize: 5,
      flowDrift: 0,
      flowDriftScale: 25,

      noiseScale: 50,
      noiseRadius: 8,

      strokeWeight: 2,
      colorScaling: 50,
      colorSpread: 25,
      colorAlpha: 7,

      backgroundColor: { r: 0, g: 0, b: 0 },
      color1: { r: randomColor(), g: randomColor(), b: randomColor() },
      color2: { r: randomColor(), g: randomColor(), b: randomColor() },
      color3: { r: randomColor(), g: randomColor(), b: randomColor() },
      // color1: { h: randomColor(), s: randomColor(), l: randomColor()/100 },
      // color2: { h: randomColor(), s: randomColor(), l: randomColor()/100 },

      fadeAmount: 0,
      fadeSpeed: 0,

      paused: false,
      triggerSave: false,
      redraw: false,
    };

    this.updateSketchConfig = this.updateSketchConfig.bind(this);
    this.updateSketchField = this.updateSketchField.bind(this);
  }

  updateSketchField(field, val) {
    this.setState({ [field]: val});
  }

  updateSketchConfig(config) {
    const newConfig = {
      // color1: convertColor(config.color1, config.colorAlpha),
      // color2: convertColor(config.color2, config.colorAlpha),
      ...config,
      redraw: !this.state.redraw,
    };
    this.setState(newConfig);
  }

  convertConfig() {
    const config = this.state;
    const newConfig = {
      ...config,
      backgroundColor: convertColor(config.backgroundColor, 100),
      color1: convertColor(config.color1, config.colorAlpha),
      color2: convertColor(config.color2, config.colorAlpha),
      color3: convertColor(config.color3, config.colorAlpha),
    };
    return newConfig;
  }

  render() {
    return (
      <div className="row">
        <div className="col-4">
          <ConfigForm updateSketchConfig={this.updateSketchConfig} updateSketchField={this.updateSketchField} config={this.state} />
        </div>
        <div className="col">
          <P5Wrapper sketch={flowfield} {...this.convertConfig()} />
        </div>
      </div>
    );
  }
}

export default App;
