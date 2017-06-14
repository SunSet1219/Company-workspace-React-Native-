
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Theme from '../theme';

const { Primary1Color, TextColor } = Theme.Palette;
const DefaultIconSize = 21;
const DefaultIconColor = Primary1Color;




const CheckboxWithLabel = (props) => (
  <TouchableOpacity
    activeOpacity={1}
    hitSlop={props.hitSlop}
    onPress={props.onPress}
    style={!props.style ? styles.button : [ styles.button, props.style ]}
  >
    <Icon
      name={props.checked ? 'check-box' : 'check-box-outline-blank'}
      size={props.iconSize || DefaultIconSize}
      color={props.iconColor || DefaultIconColor}
      style={!props.iconStyle ? styles.icon : [ styles.icon, props.iconStyle ]}
    />
    <Text style={!props.labelStyle ? styles.label : [ styles.label, props.labelStyle ]}>
      {props.label}
    </Text>
  </TouchableOpacity>
);

CheckboxWithLabel.PropTypes = {
  checked: PropTypes.bool,
  hitSlop: PropTypes.object,
  iconColor: PropTypes.string,
  iconSize: PropTypes.number,
  iconStyle: View.propTypes,
  label: PropTypes.string,
  labelStyle: Text.propTypes,
  onPress: PropTypes.func,
  style: View.propTypes,
};




const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    color: TextColor,
  },
});


export default CheckboxWithLabel;
