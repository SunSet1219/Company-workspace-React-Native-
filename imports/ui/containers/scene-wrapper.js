
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Keyboard,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import NavigationBar from '../components/navigation-bar';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';

const { StatusBarColor } = Theme.Palette;




const SceneWrapper = (props) => {

  let statusBar = (
    <StatusBar
      hidden={props.landscape}
      barStyle='light-content'
      showHideTransition='fade'
      backgroundColor={StatusBarColor}
      translucent={true}
    />
  );


  let navigationBar = !props.landscape ? (
    <NavigationBar title={props.title} />
  ) : null;


  return (
    <View
      onLayout={props.onLayout}
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return false;
      }}
      style={styles.wrapperView}
    >
      {statusBar}
      {navigationBar}
      {props.children}
    </View>
  );

};

SceneWrapper.propTypes = {
  title: PropTypes.string,
  landscape: PropTypes.bool,
  onLayout: PropTypes.func,
};

SceneWrapper.defaultProps = {
  title: '',
  landscape: false,
  onLayout: null,
};


const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    backgroundColor: Canvas1Color,
  },
});


export default SceneWrapper;
