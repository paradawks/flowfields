import React from 'react';

import { Button, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupButton } from 'reactstrap';
import { SketchPicker } from 'react-color';

class ConfigForm extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {};

    this.handleDefaultChange = this.handleDefaultChange.bind(this);
    this.handleBoolChange = this.handleBoolChange.bind(this);
    this.handleBoolChangeDirect = this.handleBoolChangeDirect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRandomizeSeed = this.handleRandomizeSeed.bind(this);
    this.handleColor = this.handleColor.bind(this);
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
    this.setState({ [name]: !this.state[name] });
  }

  handleBoolChangeDirect(e) {
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
    this.props.updateSketchConfig(this.state);
  }

  render() {
    const state = this.state;

    const labelWidth = 5;
    const fieldWidth = 12-labelWidth;

    return (
      <Form id="configForm">

        <FormGroup style={{ marginBottom: '10px' }}>
          <Button size="sm" name="randomUpdate" color="primary" onClick={e => { this.handleRandomizeSeed(e); this.handleSubmit(e); } }>Random Update</Button> &nbsp;
          <Button size="sm" name="update" onClick={this.handleSubmit}>Update</Button> &nbsp;
          <Button size="sm" name="paused" onClick={this.handleBoolChangeDirect}>{ this.state.paused ? 'Run' : 'Pause' }</Button> &nbsp;
          <Button size="sm" name="triggerSave" onClick={this.handleBoolChangeDirect}>Save Image</Button> &nbsp;
        </FormGroup>

        <FormGroup row>
          <Label for="canvasWidth" sm={labelWidth}>canvas size</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input sm={6} type="number" style={{ width: "5em" }} id="canvasWidth" min={1} max={2400} value={state.canvasWidth} onChange={this.handleDefaultChange} />
              <div className="formText">&nbsp;x&nbsp;</div>
              <Input sm={6} type="number" style={{ width: "5em" }} id="canvasHeight" min={1} max={2400} value={state.canvasHeight} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="particleCount" sm={labelWidth}>partcle count</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="particleCount" min={1} max={5000} value={state.particleCount} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="outer" sm={labelWidth}>outer boundary</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="outer" min={10} max={200} value={state.outer} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="noiseSeed" sm={labelWidth}>noise seed</Label>
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
        </FormGroup>

        <FormGroup row>
          <Label for="flowCellSize" sm={labelWidth}>flow size / accuracy</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="flowCellSize" value={state.flowCellSize} min={2} max={25} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="flowAccuracy" sm={labelWidth}>flow accuracy</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="flowAccuracy" value={state.flowAccuracy} min={4} max={100} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="noiseScale" sm={labelWidth}>noise scaling</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="text" style={{ width: "5em" }} id="noiseScale" value={state.noiseScale} min={1} max={100} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="noiseRadius" sm={labelWidth}>noise radius</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="noiseRadius" value={state.noiseRadius} min={2} max={25} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="strokeWeight" sm={labelWidth}>stroke weight</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="strokeWeight" value={state.strokeWeight} min={1} max={10} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="colorScaling" sm={labelWidth}>color scaling</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="colorScaling" min={1} max={100} value={state.colorScaling} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label for="colorAlpha" sm={labelWidth}>color alpha</Label>
          <Col sm={fieldWidth}>
            <FormGroup row>
              <Input type="number" style={{ width: "5em" }} id="colorAlpha" min={1} max={100} value={state.colorAlpha} onChange={this.handleDefaultChange} />
            </FormGroup>
          </Col>
        </FormGroup>

        <FormGroup row>
          <SketchPicker disableAlpha presetColors={[]} onChangeComplete={(c) => this.handleColor('color1', c)} color={this.state.color1}/>
          <SketchPicker disableAlpha presetColors={[]} onChangeComplete={(c) => this.handleColor('color2', c)} color={this.state.color2}/>
        </FormGroup>

        <div>Adapted from: <a href="https://github.com/kgolid/p5ycho/tree/master/topology5">topology5</a></div>
      </Form>

    );
  }
}

export default ConfigForm;
