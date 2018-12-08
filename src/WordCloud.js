import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import WordCloudJS from 'wordcloud';

class WordCloud extends PureComponent {
  static propTypes = {
    FallbackUI: PropTypes.element,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,

    // WordCloudJS options
    list: PropTypes.arrayOf(
      (props, key, componentName, location, propFullName) => {
        const value = props[key];
        if (!value || !Array.isArray(value)) {
          return new Error(
            `Invalid property ${propFullName} supplied to ${componentName}. Expecting it to be an array of [string, number]. Got ${value} instead.`
          );
        }

        if (value.length !== 2) {
          return new Error(
            `Invalid property ${propFullName} supplied to ${componentName}. Expecting it to be an array of [string, number]. Got ${value} instead.`
          );
        }

        if (typeof value[0] !== 'string' || typeof value[1] !== 'number') {
          return new Error(
            `Invalid property ${propFullName} supplied to ${componentName}. Expecting it to be an array of [string, number]. Got [${typeof value[0]}, ${typeof value[1]}] instead.`
          );
        }
      }
    ),

    color: PropTypes.oneOfType([
      PropTypes.string, // CSS color
      PropTypes.object, // null to dissable color inlininig
      PropTypes.func, // callback(word, weight, fontSize, distance, theta)
    ]),

    shape: PropTypes.oneOfType([
      PropTypes.oneOf([
        'circle',
        'cardioid',
        'diamond',
        'square',
        'triangle',
        'triangle-forward',
        'triangle-upright',
        'pentagon',
        'star',
      ]),
      PropTypes.func, // callback(theta) any polar coordinate equation
    ]),

    ellipticity: PropTypes.number,

    minSize: PropTypes.number,

    // calculates initial font size
    weightFactor: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.func, // callback(weight)
    ]),

    // Dimension
    gridSize: PropTypes.number,
    origin: PropTypes.arrayOf(PropTypes.number),
    drawOutOfBound: PropTypes.bool,
  };

  static defaultProps = {
    FallbackUI: <div>Browser is not supported</div>,
  };

  canvas = createRef();

  componentDidMount() {
    this.renderWordCloud();
  }

  componentDidUpdate() {
    this.renderWordCloud();
  }

  getOptions() {
    const { FallbackUI, width, height, ...options } = this.props;

    return options;
  }

  renderWordCloud() {
    if (WordCloudJS.isSupported) {
      WordCloudJS(this.canvas.current, this.getOptions());
    }
  }

  render() {
    if (WordCloudJS.isSupported) {
      const { width, height } = this.props;
      return <canvas ref={this.canvas} width={width} height={height} />;
    }

    return this.props.FallbackUI;
  }
}

export default WordCloud;
