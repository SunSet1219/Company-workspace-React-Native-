
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Theme from '../theme';

const { Border1Color, TextColor } = Theme.Palette;
const { TextFontSize } = Theme.Font;




const NoDataPlaceholder = (props) => (
  <View style={
    !props.style ?
      styles.placeholderView :
      [ styles.placeholderView, props.style ]
  }>
    <View style={styles.labelView}>
      <Text style={styles.labelText}>
        {props.label}
      </Text>
    </View>
  </View>
);

NoDataPlaceholder.PropTypes = {
  label: PropTypes.string.isRequired,
  style: View.propTypes,
};




const styles = StyleSheet.create({
  placeholderView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  labelView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 14 : 12,
    borderRadius: 2,
    backgroundColor: Border1Color,
  },
  labelText: {
    fontSize: TextFontSize,
    lineHeight: 24,
    textAlign: 'center',
    color: TextColor,
  },
});


export default NoDataPlaceholder;
