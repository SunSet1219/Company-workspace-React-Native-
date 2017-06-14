
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Keyboard,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';

const { StatusBarColor, Canvas1Color } = Theme.Palette;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class SceneWrapperWithOrientationState extends Component {

  constructor(props) {
    super(props);

    this.state = {
      landscape: false,
    };

    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let statusBar = (
      <StatusBar
        hidden={this.state.landscape}
        barStyle='light-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          return false;
        }}
        style={styles.wrapperView}
      >
        {statusBar}
        {this.props.children}
      </View>
    );
  }

}

SceneWrapperWithOrientationState.propTypes = {
  title: PropTypes.string,
};

SceneWrapperWithOrientationState.defaultProps = {
  title: '',
};


const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    backgroundColor: Canvas1Color,
  },
});


export default SceneWrapperWithOrientationState;
