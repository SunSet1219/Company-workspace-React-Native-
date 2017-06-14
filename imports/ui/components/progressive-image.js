
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../colors';

const OpacityAnimationDuration = 600;
const Status = {
  Loading: 0,
  Loaded: 1,
  Failed: -1
};




class ProgressiveImage extends Component {

  constructor(props) {
    super(props);

    this._onLoad = this._onLoad.bind(this);
    this._onError = this._onError.bind(this);

    this.state = {
      status: Status.Loading,
      opacityAnimation: new Animated.Value(0),
    };

    this.opacityAnimationHandle = null;
  }




  componentWillMount() {
    if (Platform.OS === 'android') {
      Image.getSize(this.props.source.uri, () => {}, this._onError);
    }
  }




  componentWillReceiveProps(nextProps) {
    if (this.props.source.uri !== nextProps.source.uri) {
      this.setState({
        status: Status.Loading,
      }, () => {
        if (Platform.OS === 'android') {
          Image.getSize(this.props.source.uri, () => {}, this._onError);
        }
      });
    }
  }




  componentWillUnmount() {
    if (this.opacityAnimationHandle) this.opacityAnimationHandle.stop();
  }




  _onLoad() {
    this.opacityAnimationHandle = Animated.timing(
      this.state.opacityAnimation, {
        toValue: 1,
        easing: Easing.linear,
        duration: 600,
      }
    );
    this.opacityAnimationHandle.start();

    this.setState({ status: Status.Loaded });

    this.props.onLoad && this.props.onLoad();
  }




  _onError() {
    this.setState({ status: Status.Failed });

    this.props.onError && this.props.onError();
  }




  render() {
    let { props, state } = this;


    let iconView = (
      <View style={props.style}>
        <View style={styles.iconWrapperView}>
          <Icon
            name='insert-photo'
            size={40}
            color={Colors.red400}
            style={styles.icon}
          />
        </View>
        {props.children}
      </View>
    );


    let image = (Platform.OS === 'android') ? (
      <Animated.Image
        source={props.source}
        resizeMode={props.resizeMode}
        style={[ props.style, { opacity: state.opacityAnimation }]}
        onLoad={this._onLoad}
      >
        {props.children}
      </Animated.Image>
    ) : (
      <Animated.Image
        source={props.source}
        resizeMode={props.resizeMode}
        style={[ props.style, { opacity: state.opacityAnimation }]}
        onLoad={this._onLoad}
        onError={this._onError}
      >
        {props.children}
      </Animated.Image>
    );


    return state.status === Status.Failed ? iconView : image;
  }

}

ProgressiveImage.propTypes = {
  resizeMode: PropTypes.string,
  source: PropTypes.object.isRequired,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.number,
  ]).isRequired,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};




const styles = StyleSheet.create({
  iconWrapperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default ProgressiveImage;
