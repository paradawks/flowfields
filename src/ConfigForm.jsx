import React from 'react';

import { Button, ButtonGroup, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupButton, UncontrolledTooltip } from 'reactstrap';

import ChooseColor from './ChooseColor';

const randomColor = () => {
  return Math.floor( Math.random() * 255 );
}

class ConfigForm extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {};

    this.handleDefaultChange = this.handleDefaultChange.bind(this);
    this.handleBoolChange = this.handleBoolChange.bind(this);
    this.handleToggleChange = this.handleToggleChange.bind(this);
    this.handleToggleChangeDirect = this.handleToggleChangeDirect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRandomizeSeed = this.handleRandomizeSeed.bind(this);
    this.handleColor = this.handleColor.bind(this);
    this.randomColors = this.randomColors.bind(this);
  }

  componentWillMount() {
    const { config } = this.props;

    this.setState(config);
  }

  handleColor(field, color) {
    this.setState({ [field]: color.rgb });
  }

  handleDefaultChange(e) {
    e.preventDefault();
    const name = e.target.name || e.target.id;
    this.setState({ [name]: e.target.value });
  }

  handleBoolChange(e) {
    e.preventDefault();
    const name = e.target.name || e.target.id;
    this.setState({ [name]: e.target.value === "1" ? true : false });
  }

  handleToggleChange(e) {
    e.preventDefault();
    const name = e.target.name || e.target.id;
    this.setState({ [name]: !this.state[name] });
  }

  handleToggleChangeDirect(e) {
    e.preventDefault();
    const name = e.target.name || e.target.id;
    this.setState({ [name]: !this.state[name] });
    this.props.updateSketchField(name, !this.state[name]);
  }

  handleRandomizeSeed(e) {
    e.preventDefault();
    this.setState({ noiseSeed: Math.floor(Math.random() * 999999999999) });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ paused: false }, () => { this.props.updateSketchConfig(this.state); });
  }

  randomColors(e) {
    e.preventDefault();
    console.log('RAND');
    this.setState({
      color1: { r: randomColor(), g: randomColor(), b: randomColor() },
      color2: { r: randomColor(), g: randomColor(), b: randomColor() },
      color3: { r: randomColor(), g: randomColor(), b: randomColor() },
    });
  }

  render() {
    const state = this.state;

    const labelWidth = 5;
    const fieldWidth = 12-labelWidth;

    return (
      <Form id="configForm">

        <FormGroup style={{ marginBottom: '10px' }}>
          <Button size="sm" name="randomUpdate" color="primary" onClick={e => { this.handleRandomizeSeed(e); this.handleSubmit(e); } }>Update (+reseed)</Button> &nbsp;
          <Button size="sm" name="update" onClick={this.handleSubmit}>Update</Button> &nbsp;
          <Button size="sm" name="paused" onClick={this.handleToggleChangeDirect}>{ this.state.paused ? 'Run' : 'Pause' }</Button> &nbsp;
          <Button size="sm" name="triggerSave" onClick={this.handleToggleChangeDirect}>Save Image</Button> &nbsp;
        </FormGroup>

        <FormGroup row>
          <Label id="canvasSizeLabel" for="canvasWidth" sm={labelWidth}>canvas size</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input sm={6} type="number" style={{ width: "5em" }} id="canvasWidth" min={1} max={2400} value={state.canvasWidth} onChange={this.handleDefaultChange} />
              <div className="formText">&nbsp;x&nbsp;</div>
              <Input sm={6} type="number" style={{ width: "5em" }} id="canvasHeight" min={1} max={2400} value={state.canvasHeight} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="canvasSizeLabel" placement="bottom">Set the size of the generated image in pixels.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="particleCountLabel" for="particleCount" sm={labelWidth}>partcle count / expires</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="particleCount" min={1} max={5000} value={state.particleCount} onChange={this.handleDefaultChange} />&nbsp;
              <Input type="number" style={{ width: "5em" }} id="particleExpire" min={0} max={500} value={state.particleExpire} onChange={this.handleDefaultChange} />s
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="particleCountLabel" placement="bottom">Number of particles to generate. Fewer runs faster, but you might want to bump the alpha up a bit. Expire kills off older particles when they leave the field and respawns them randomly.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="outerBoundaryLabel" for="outer" sm={labelWidth}>outer boundary</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="outer" min={10} max={200} value={state.outer} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="outerBoundaryLabel" placement="bottom">Set the size of a boundary area around the outside of the image. Larger values make more space for particles to converge before becoming visible.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="noiseSeedLabel" for="noiseSeed" sm={labelWidth}>noise seed</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <InputGroup>
                <Input type="number" style={{ width: "5em" }} id="noiseSeed" min={1} value={state.noiseSeed} onChange={this.handleDefaultChange} />
                <InputGroupButton>
                  <Button onClick={this.handleRandomizeSeed}>rand</Button>
                </InputGroupButton>
              </InputGroup>
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="noiseSeedLabel" placement="bottom">Starting seed for the image. Seeds make deterministic results if all the settings are the same.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="flowSizeLabel" for="flowCellSize" sm={labelWidth}>flow size / accuracy</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="flowCellSize" value={state.flowCellSize} min={2} max={25} onChange={this.handleDefaultChange} />&nbsp;
              <Input type="number" style={{ width: "5em" }} id="flowAccuracy" value={state.flowAccuracy} min={4} max={100} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="flowSizeLabel" placement="bottom">Flow size sets pixels between flow control points. Higher numbers are sparser flow points. Accuracy controls how many times each flow point looks for the highest local slope. Minimal effect, usually.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="flowDriftLabel" for="flowDrift" sm={labelWidth}>flow drift and scale</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="flowDrift" value={state.flowDrift} min={0} max={1000} onChange={this.handleDefaultChange} />&nbsp;
              <Input type="number" style={{ width: "5em" }} id="flowDriftScale" value={state.flowDriftScale} min={1} max={100} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="flowDriftLabel" placement="bottom">Changes whether the flow field drifts over time.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label for="noiseScale" sm={labelWidth}>noise scaling / radius</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="text" style={{ width: "5em" }} id="noiseScale" value={state.noiseScale} min={1} max={100} onChange={this.handleDefaultChange} />&nbsp;
              <Input type="number" style={{ width: "5em" }} id="noiseRadius" value={state.noiseRadius} min={2} max={25} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="flowSizeLabel" placement="bottom">Scale is how chaotic the noise is. Low numbers are very chaotic! Radius is how far away each control point checks for slope. Kindof eratic results.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="fadeAmountLabel" for="fadeAmount" sm={labelWidth}>fade amount / speed</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="fadeAmount" min={0} max={255} value={state.fadeAmount} onChange={this.handleDefaultChange} />&nbsp;
              <Input type="number" style={{ width: "5em" }} id="fadeSpeed" min={0} max={5000} value={state.fadeSpeed} onChange={this.handleDefaultChange} />ms
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="fadeAmountLabel" placement="bottom">Fade amount controls how fast the image fades to black. Zero does no fading. Speed can be used to delay it (1000 means only fade once per second). Usually leave at zero to run at full speed.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="strokeLabel" for="strokeWeight" sm={labelWidth}>stroke weight / alpha</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="strokeWeight" value={state.strokeWeight} min={1} max={10} onChange={this.handleDefaultChange} />&nbsp;
              <Input type="number" style={{ width: "5em" }} id="colorAlpha" min={1} max={100} value={state.colorAlpha} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="strokeLabel" placement="bottom">Stroke weight is how many pixels wide the line drawing is. Alpha is how opaque it is as a percentage (100 for fully opaque).</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="colorScaleLabel" for="colorScaling" sm={labelWidth}>color scaling / spread</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="colorScaling" min={1} max={100} value={state.colorScaling} onChange={this.handleDefaultChange} />&nbsp;
              <Input type="number" style={{ width: "5em" }} id="colorSpread" min={1} max={100} value={state.colorSpread} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
          <UncontrolledTooltip target="colorScaleLabel" placement="bottom">Color scale controls clusters of colors based on starting positions. High color scale means you are likely to get more of one color. Low makes more clusters.</UncontrolledTooltip>
        </FormGroup>

        <FormGroup row>
          <Label id="lineColorLabel" sm={labelWidth}>line colors</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <ChooseColor color={this.state.color1} onChange={(c) => this.handleColor('color1', c)} />
              <ChooseColor color={this.state.color2} onChange={(c) => this.handleColor('color2', c)} />
              <ChooseColor color={this.state.color3} onChange={(c) => this.handleColor('color3', c)} />
              <Button size="sm" onClick={this.randomColors}>rand</Button>
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label id="colorScaleLabel" for="backgroundColor" sm={labelWidth}>background color</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <ChooseColor color={this.state.backgroundColor} onChange={(c) => this.handleColor('backgroundColor', c)} />
            </FormGroup>
          </Col>
        </FormGroup>

        <div>Adapted from: <a href="https://github.com/kgolid/p5ycho/tree/master/topology5">topology5</a></div>
      </Form>

    );
  }
}

export default ConfigForm;
