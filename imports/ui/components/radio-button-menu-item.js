
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MKButton } from '../material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Theme from '../theme';

const { MKButtonMaskColor, MKButtonRippleColor, TextColor } = Theme.Palette;
const { MenuFontSize } = Theme.Font;

const styles = StyleSheet.create({
  wrapperView: {
    minHeight: 40,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  labelView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  labelText: {
    fontSize: MenuFontSize,
    color: TextColor,
  },
});




const RadioButtonMenuItem = (props) => {

  let icon = (
    <Icon
      name={props.selected ? 'radio-button-checked' : 'radio-button-unchecked'}
      size={props.iconSize}
      color={props.iconColor}
    />
  );


  let label = (
    <View style={props.labelStyle}>
      <Text style={props.labelTextStyle}>
        {props.label}
      </Text>
    </View>
  );


  return (
    <MKButton
      maskColor={MKButtonMaskColor}
      rippleColor={MKButtonRippleColor}
      onPress={() => props.onSelect(props.index)}
      style={props.style}
    >
      {icon}
      {props.label ? label : props.children}
    </MKButton>
  );

};

RadioButtonMenuItem.propTypes = {
  index: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  style: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object
  ]),
  iconSize: PropTypes.number,
  iconColor: PropTypes.string,
  labelStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object
  ]),
  labelTextStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object
  ]),
};

RadioButtonMenuItem.defaultProps = {
  style: styles.wrapperView,
  iconSize: MenuFontSize + 1,
  iconColor: TextColor,
  labelStyle: styles.labelView,
  labelTextStyle: styles.labelText,
};


export default RadioButtonMenuItem;
