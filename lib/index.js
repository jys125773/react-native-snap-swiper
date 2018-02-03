import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  PanResponder,
  Dimensions,
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
} from 'react-native';

const Touchable = Platform.OS === 'ios' ? TouchableOpacity : TouchableNativeFeedback;
const DEVICE_WIDTH = Dimensions.get('window').width;

export default class Swiper extends Component {
  constructor(props) {
    super(props);

    this.positionValueUpdator = ({ value }) => {
      this._positionValue = value;
    };

    this.init(props);
  }

  init(props) {
    const { initIndex, children, containerWidth, cardWidth } = props;

    this.$currentIndex = initIndex;
    this._positionValue = initIndex;
    this._position = new Animated.Value(initIndex);
    this._position.addListener(this.positionValueUpdator);

    const swingWidth = (containerWidth - cardWidth) / 2;
    const childrenCount = React.Children.count(children);

    if (childrenCount < 5) {
      throw new Error('children count must more than 5');
    }

    if (!this.state) {
      this.state = {
        swingWidth,
        childrenCount,
        ...this._getRanges(children, swingWidth, childrenCount),
      };
    } else {
      this.setState({
        swingWidth,
        childrenCount,
        ...this._getRanges(children, swingWidth, childrenCount),
      });
    }
  }

  _getRanges(children, swingWidth, childrenCount) {
    const { radio, cardWidth } = this.props;
    const midCount = Math.floor(childrenCount / 2);
    const n = childrenCount % 2 === 0 ? 0 : -1;

    const obj = children.reduce((acc, _, index) => {
      const lessMid = index <= midCount;
      const zIndex = lessMid ? midCount - index : index + n - midCount;
      const scale = Math.pow(radio, midCount - zIndex);
      const shrinkWith = (1 - scale) * cardWidth / 2;
      const offsetX = (shrinkWith + swingWidth * (1 - Math.pow(radio, lessMid ? index : midCount - zIndex)) / (1 - radio)) / scale;
      const translateX = lessMid ? offsetX : -offsetX;

      acc.zIndexs.push(zIndex + 0.5);
      acc.scales.push(scale);
      acc.tranlateXs.push(translateX);

      return acc;
    }, { zIndexs: [], scales: [], tranlateXs: [] });

    const result = Object.keys(obj).reduce((acc, k) => {
      if (k === 'tranlateXs') {
        acc[k] = obj[k].slice(1).reverse().concat(obj[k].map(v => -v));
      } else {
        acc[k] = obj[k].slice(1).reverse().concat(obj[k]);
      }
      return acc;
    }, obj);

    return result;
  }

  _getInputRange(index) {
    const { childrenCount } = this.state;
    return (new Array(childrenCount * 2 - 1)).fill().map((_, idx) => index + idx + 1 - childrenCount);
  }

  _responder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onMoveShouldSetPanResponderCapture: () => true,

    onPanResponderGrant: () => {
      this._position.setOffset(this._positionValue);
      this._position.setValue(0);

      this.autoplayTimer && clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    },

    onPanResponderMove: (evt, { dx }) => {
      this._position.setValue(-dx / this.props.cardWidth);
    },

    onPanResponderRelease: (evt, { vx }) => {
      const { childrenCount } = this.state;

      this._position.flattenOffset();

      let result;
      if (vx > 0.05) {
        result = Math.floor(this._positionValue);
      } else if (vx < -0.05) {
        result = Math.ceil(this._positionValue);
      } else {
        result = Math.round(this._positionValue);
      }

      this.animateToIndex(result);
    },
  });

  animateToIndex = (index, animated = true) => {
    const { childrenCount } = this.state;
    const { animateDuration, onIndexChanged } = this.props;

    if (index < 0) {
      index = childrenCount - 1;
      this._position.setValue(this._positionValue + childrenCount);
    } else if (index > childrenCount - 1) {
      index = 0;
      this._position.setValue(this._positionValue - childrenCount);
    }

    Animated.timing(this._position, {
      toValue: index,
      duration: animated ? animateDuration : 0,
    }).start(() => {
      this._updateDots(index);
      this.$currentIndex = index;
      onIndexChanged(index);
      this._setAutoplay();
    });
  }

  goNext = () => {
    this.autoplayTimer && clearTimeout(this.autoplayTimer);
    this.autoplayTimer = null;

    this.animateToIndex(this.$currentIndex + 1);
  }

  goPre = () => {
    this.autoplayTimer && clearTimeout(this.autoplayTimer);
    this.autoplayTimer = null;

    this.animateToIndex(this.$currentIndex - 1);
  }

  _updateDots(index) {
    const { dotColor, activeDotColor, dots } = this.props;
    const preIndex = this.$currentIndex;

    if (dots) {
      this.refs[`dot${preIndex}`].setNativeProps({
        style: {
          backgroundColor: dotColor,
        },
      });
      this.refs[`dot${index}`].setNativeProps({
        style: {
          backgroundColor: activeDotColor,
        },
      });
    }
  }

  _setAutoplay() {
    const { autoplay, autoplayDirection, autoplayInterval } = this.props;

    if (autoplay && !this.autoplayTimer) {
      this.autoplayTimer = setInterval(() => {
        let result = this.$currentIndex + (autoplayDirection ? 1 : -1);

        this.animateToIndex(result);
      }, autoplayInterval);
    }
  }

  componentDidMount() {
    const { initIndex } = this.props;

    this._position.setValue(initIndex);
    this._setAutoplay();
    this._updateDots(initIndex);
  }

  componentWillReceiveProps(nextProps) {
    const { initIndex, children } = nextProps;

    if (this.props.children !== children || this.props.initIndex !== initIndex) {
      this.init(nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.tranlateXs !== this.state.tranlateXs;
  }

  componentWillUnmount() {
    this.autoplayTimer && clearTimeout(this.autoplayTimer);
    this.autoplayTimer = null;
    this._position.removeListener(this.positionValueUpdator);
  }

  render() {
    const { swingWidth, zIndexs, scales, tranlateXs } = this.state;
    const {
      children, containerWidth, cardHeight, dotColor, activeDotColor,
      cardWidth, dotsContainerWidth, dotsContainerBottom,
       } = this.props;

    const itemStyl = { width: cardWidth, height: cardHeight, left: swingWidth };
    const containerStyl = { width: containerWidth, height: cardHeight };
    const buttonStyl = [styles.button, { top: (cardHeight - 40) / 2 }];
    const buttonTextStyl = { color: activeDotColor, fontSize: 40 };

    return (
      <View>
        <View
          {...this._responder.panHandlers}
          style={[styles.container, containerStyl]}>
          {
            React.Children.map(children, (child, index) => {
              const inputRange = this._getInputRange(index);

              return (
                <Animated.View style={[
                  styles.slide,
                  itemStyl,
                  {
                    zIndex: this._position.interpolate({ inputRange, outputRange: zIndexs }),
                    transform: [
                      {
                        scale: this._position.interpolate({ inputRange, outputRange: scales }),
                      },
                      {
                        translateX: this._position.interpolate({ inputRange, outputRange: tranlateXs }),
                      },
                    ],
                  }]}>
                  {child}
                </Animated.View>
              );
            })
          }
          {
            this.props.dots && (
              <View
                style={[
                  styles.dots,
                  {
                    width: dotsContainerWidth,
                    left: (containerWidth - dotsContainerWidth) / 2,
                    bottom: dotsContainerBottom,
                  },
                ]}>
                {
                  React.Children.map(children, (_, index) => {
                    return (
                      <View
                        key={index}
                        ref={`dot${index}`}
                        style={[styles.dot, { backgroundColor: dotColor }]} />
                    );
                  })
                }
              </View>
            )
          }
        </View>
        {
          this.props.showsButtons && [
            <Touchable
              key="pre"
              onPress={this.goPre}
              style={[buttonStyl, { left: 10 }]}>
              <Text style={buttonTextStyl}>‹</Text>
            </Touchable>,
            <Touchable
              key="next"
              onPress={this.goNext}
              style={[buttonStyl, { right: 10 }]}>
              <Text style={buttonTextStyl}>›</Text>
            </Touchable>
          ]
        }
      </View>
    );
  }
}

Swiper.defaultProps = {
  containerWidth: DEVICE_WIDTH,
  cardWidth: DEVICE_WIDTH * 0.6,
  cardHeight: DEVICE_WIDTH * 0.4,
  radio: 0.8,
  initIndex: 0,
  animateDuration: 200,
  autoplay: false,
  autoplayInterval: 3600,
  autoplayDirection: true,
  dotsContainerWidth: DEVICE_WIDTH * 0.4,
  dotsContainerBottom: 10,
  dotColor: 'rgba(0,0,0,.2)',
  activeDotColor: '#007aff',
  dots: true,
  showsButtons: true,
  onIndexChanged: () => { },
};

Swiper.propTypes = {
  containerWidth: PropTypes.number,
  cardWidth: PropTypes.number,
  cardHeight: PropTypes.number,
  radio: PropTypes.number,
  initIndex: PropTypes.number,
  animateDuration: PropTypes.number,
  autoplay: PropTypes.bool,
  autoplayInterval: PropTypes.number,
  onIndexChanged: PropTypes.func,
  autoplayDirection: PropTypes.bool,
  dotsContainerBottom: PropTypes.number,
  dotColor: PropTypes.string,
  activeDotColor: PropTypes.string,
  dots: PropTypes.bool,
  showsButtons: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  slide: {
    position: 'absolute',
    top: 0,
  },
  dots: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 999,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  button: {
    position: 'absolute',
    zIndex: 999,
    backgroundColor: 'transparent',
  },
});