
'use strict';

import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';

import Theme from '../theme';

const { ActiveColor } = Theme.Palette;




class SegmentedControlUnderline extends Component {

  constructor(props) {
    super(props);

    this.state = {
      left: new Animated.Value(0),
    };

    this.setupAnimation = this.setupAnimation.bind(this);
    this.startAnimation = this.startAnimation.bind(this);
    this.stopAnimation = this.stopAnimation.bind(this);

    this.aniHandle = null;
  }




  setupAnimation(nextLeft) {
    this.aniHandle = Animated.timing(this.state.left, {
      toValue: nextLeft,
      duration: 200,
    });
  }




  startAnimation(animationEndCallback) {
    this.aniHandle && this.aniHandle.start(animationEndCallback);
  }




  stopAnimation() {
    this.aniHandle && this.aniHandle.stop();
  }




  componentWillUnmount() {
    this.stopAnimation();
  }




  render() {
    const { width } = this.props;
    const { left } = this.state;

    return (
      <Animated.View style={[ styles.underline, { left, width }]} />
    );
  }

}

SegmentedControlUnderline.propTypes = {
  width: PropTypes.number.isRequired,
};




const styles = StyleSheet.create({
  underline: {
    position: 'absolute',
    height: 3,
    bottom: 0,
    backgroundColor: ActiveColor,
  },
});


export default SegmentedControlUnderline;
