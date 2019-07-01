import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import WordCloudJS from 'wordcloud';

class WordCloud extends PureComponent {
  static propTypes = {
    FallbackUI: PropTypes.element,
    dimensions: PropTypes.oneOfType([
      PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
      }).isRequired,
      PropTypes.oneOf(['responsive']).isRequired,
    ]).isRequired,
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

  state = {
    responsiveHeight: null,
    responsiveWidth: null,
  };

  canvas = createRef();

  _unbind = [];

  componentDidMount() {
    const { dimensions } = this.props;

    if (dimensions === 'responsive') {
      const height = this.divElement.clientHeight;
      const width = this.divElement.clientWidth;
      this.setState({
        responsiveHeight: height,
        responsiveWidth: width,
      });
    }

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
      onStart,
      onWordDrawn,
      onStop,
      dimensions,
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
    const { dimensions } = this.props;
    const { responsiveHeight } = this.state;

    if (
      WordCloudJS.isSupported &&
      (typeof dimensions === 'object' || responsiveHeight !== null)
    ) {
      const options = this.getOptions();

      WordCloudJS(this.canvas.current, options);
    }
  }

  render() {
    if (WordCloudJS.isSupported) {
      const { dimensions, component: Cmp } = this.props;
      const { responsiveHeight, responsiveWidth } = this.state;
      let cmpStyle = {};
      let wordcloud;

      if (typeof dimensions === 'object') {
        cmpStyle = dimensions;
      } else if (responsiveHeight !== null) {
        cmpStyle = {
          width: responsiveWidth,
          height: responsiveHeight,
        };
      }

      if (typeof dimensions === 'object' || responsiveHeight !== null) {
        wordcloud = (
          <Cmp
            ref={this.canvas}
            style={cmpStyle}
            width={cmpStyle.width}
            height={cmpStyle.height}
          />
        );
      }

      return (
        <div
          ref={divElement => {
            this.divElement = divElement;
          }}
          style={{ height: '100%', width: '100%' }}
        >
          {wordcloud}
        </div>
      );
    }

    return this.props.FallbackUI;
  }
}

export default WordCloud;
