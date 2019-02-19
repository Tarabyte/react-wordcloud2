import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import WordCloudJS from 'wordcloud';

class WordCloud extends PureComponent {
  static propTypes = {
    FallbackUI: PropTypes.element,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    component: PropTypes.string,

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

    // callbacks
    onStart: PropTypes.func,
    onWordDrawn: PropTypes.func,
    onStop: PropTypes.func,
  };

  static defaultProps = {
    FallbackUI: <div>Browser is not supported</div>,
    component: 'canvas',
  };

  canvas = createRef();

  _unbind = [];

  componentDidMount() {
    // first bind listeners
    this.bindEventListeners();
    // only then draw
    this.renderWordCloud();
  }

  componentDidUpdate() {
    // rebind listeners
    this.unbindEventListeners();
    this.bindEventListeners();
    // redraw
    this.renderWordCloud();
  }

  componentWillUnmount() {
    this.unbindEventListeners();
  }

  getOptions() {
    const {
      FallbackUI,
      width,
      height,
      onStart,
      onWordDrawn,
      onStop,
      ...options
    } = this.props;

    return options;
  }

  bindEventListeners() {
    const { onWordDrawn, onStart, onStop } = this.props;
    const { current: canvas } = this.canvas;

    // too early
    if (!canvas) return;

    // bind all handlers
    [
      ['wordcloudstart', onStart],
      ['wordclouddrawn', onWordDrawn],
      ['wordcloudstop', onStop],
    ].forEach(([event, handler]) => {
      if (!handler) return;

      canvas.addEventListener(event, handler);

      this._unbind.push(() => {
        canvas.removeEventListener(event, handler);
      });
    });
  }

  unbindEventListeners() {
    const { current } = this.canvas;

    if (current) {
      this._unbind.forEach(handler => handler());
    }

    this._unbind = [];
  }

  renderWordCloud() {
    if (WordCloudJS.isSupported) {
      WordCloudJS(this.canvas.current, this.getOptions());
    }
  }

  render() {
    if (WordCloudJS.isSupported) {
      const { width, height, component: Cmp } = this.props;
      return (
        <Cmp
          ref={this.canvas}
          style={{ width, height }}
          width={width}
          height={height}
        />
      );
    }

    return this.props.FallbackUI;
  }
}

export default WordCloud;
