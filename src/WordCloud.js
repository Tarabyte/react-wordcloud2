import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import WordCloudJS from 'wordcloud';

class WordCloud extends PureComponent {
  static propTypes = {
    FallbackUI: PropTypes.element,
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
    )
  };

  static defaultProps = {
    FallbackUI: <div>Browser is not supported</div>
  };

  canvas = createRef();

  componentDidMount() {
    this.renderWordCloud();
  }

  componentDidUpdate() {
    this.renderWordCloud();
  }

  getOptions() {
    const { FallbackUI, ...options } = this.props;

    return options;
  }

  renderWordCloud() {
    if (WordCloudJS.isSupported) {
      WordCloudJS(this.canvas.current, this.getOptions());
    }
  }

  render() {
    if (WordCloudJS.isSupported) {
      return <canvas ref={this.canvas} />;
    }

    return this.props.FallbackUI;
  }
}

export default WordCloud;
