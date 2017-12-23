import React from 'react';
import reactCSS from 'reactcss';
import { PhotoshopPicker } from 'react-color';

class ChooseColor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      color: { rgb: props.color },
      newColor: props.color,
    };
  }


  componentWillReceiveProps(props) {
    this.setState({
      displayColorPicker: false,
      color: { rgb: props.color },
      newColor: props.color,
    });
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {
    this.setState({ newColor: color });
  }

  handleAccept = (e) => {
    this.setState({ color: this.state.newColor });
    this.props.onChange(this.state.newColor);
    this.handleClose();
  };

  render() {

    if ( !this.state.color ) return null;

    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.rgb.r }, ${ this.state.color.rgb.g }, ${ this.state.color.rgb.b }, 1)`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
          margin: '0 5px 0 0',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        // cover: {
        //   position: 'fixed',
        //   top: '0px',
        //   right: '0px',
        //   bottom: '0px',
        //   left: '0px',
        // },
      },
    });

    return (
      <div className="chooseColor">
        <div style={ styles.swatch } onClick={ this.handleClick }>
          <div style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <PhotoshopPicker
            color={ this.state.newColor }
            onChange={ this.handleChange }
            onAccept={ this.handleAccept }
            onCancel={ this.handleClose }
          />
        </div> : null }

      </div>
    )
  }
}

export default ChooseColor;
