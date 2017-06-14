
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Platform,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import { MKButton } from '../../material-ui';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { Primary1Color, Secondary1Color, GreyTextColor, WhiteTextColor, Border3Color } = Theme.Palette;
const { MKButtonMaskColor2, MKButtonRippleColor2 } = Theme.Palette;
const { MenuFontSize } = Theme.Font;
const { NavigationBarHeight } = UISharedConstants;

const styles = StyleSheet.create({
  wrapperView: {
    height: NavigationBarHeight,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: Primary1Color,
    borderTopColor: Border3Color,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        zIndex: 999,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  item: {
    height: NavigationBarHeight,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    height: NavigationBarHeight - StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: WhiteTextColor,
    borderBottomWidth: 2.5,
  },
  rightBorder: {
    // borderRightColor: Border3Color,
    // borderRightWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: MenuFontSize,
    color: GreyTextColor,
  },
  selectedLabel: {
    fontSize: MenuFontSize,
    fontWeight: '500',
    color: WhiteTextColor,
  },
});




const TabBar = (props) => {

  let renderItem = (item, index) => {
    let selected = index === props.selectedIndex;
    let last = index === (props.items.length - 1);

    let label = item.label ? (
      <Text style={selected ? props.selectedLabelStyle : props.labelStyle}>
        {item.label}
      </Text>
    ) : null;

    return (
      <MKButton
        key={index}
        disabled={props.disabled}
        maskColor={MKButtonMaskColor2}
        rippleColor={MKButtonRippleColor2}
        onPress={() => props.onSelect(item, index)}
        style={[
          selected ? styles.selectedItem : styles.item,
          last ? {} : styles.rightBorder
        ]}
      >
        {label}
      </MKButton>
    );
  };



  let renderItems = () => {
    let { items } = props;
    return items && items.map(renderItem);
  };



  return (
    <View style={[
      styles.wrapperView,
      { backgroundColor: props.disabled ? Secondary1Color : Primary1Color }
    ]}>
      {renderItems()}
    </View>
  );

};

TabBar.propTypes = {
  disabled: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object),
  selectedIndex: PropTypes.number,
  onSelect: PropTypes.func,
  labelStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object
  ]),
  selectedLabelStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object
  ]),
};

TabBar.defaultProps = {
  disabled: false,
  items: [],
  selectedIndex: 0,
  onSelect: () => {},
  labelStyle: styles.label,
  selectedLabelStyle: styles.selectedLabel,
};


export default TabBar;
