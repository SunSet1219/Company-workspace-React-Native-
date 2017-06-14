
'use strict';


import React from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import Theme from '../theme';
const { Canvas1Color } = Theme.Palette;


const InitialScene = () => (
  <View style={styles.initialScene} />
);


const styles = StyleSheet.create({
  initialScene: {
    flex: 1,
    backgroundColor: Canvas1Color,
  }
});


export default InitialScene;
