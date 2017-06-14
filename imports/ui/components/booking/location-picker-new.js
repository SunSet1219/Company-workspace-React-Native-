
'use strict';


import React, {
  PropTypes,
} from 'react';

import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import PickerMenu from '../picker-menu';
import Theme from '../../theme';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icoMoonConfig from '../../../resources/font/selection.json';
const Icon = createIconSetFromIcoMoon(icoMoonConfig);

const { MainTextColorNew, InactiveColor } = Theme.Palette;
const { MenuFontSize, SemiBoldFontSettings } = Theme.Font;
const MarginHorizontal = 10;
const PaddingHorizontal = 19;
const DisplayWidth = Dimensions.get('window').width;




const LocationPicker = (props) => {

  const locationIcon = (
    <Icon
      name='my-knotel'
      size={24}
      color={InactiveColor}
    />
  );


  const menuWidth = DisplayWidth - MarginHorizontal * 2 - PaddingHorizontal * 2;

  const pickerMenu = (
    <PickerMenu
      onScreenView={locationIcon}
      menuItems={props.menuItems}
      selectedIndex={props.selectedIndex}
      onChange={props.onChange}
      disabled={props.disabled}
      menuWidth={menuWidth}
      fontSize={MenuFontSize}
      alignLeft={true}
    />
  );


  let selectedItem = props.menuItems[props.selectedIndex];
  let locationLabel = selectedItem && selectedItem.label;

  const locationLabelView = (
    <View style={styles.locationLabelView}>
      <Text
        numberOfLines={1}
        style={styles.locationLabelText}
      >
        {locationLabel}
      </Text>
    </View>
  );


  return (
    <View style={styles.wrapperView}>
      {pickerMenu}
      {locationLabelView}
    </View>
  );

};

LocationPicker.propTypes = {
  disabled: PropTypes.bool,
  menuItems: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  selectedIndex: PropTypes.number,
};

LocationPicker.defaultProps = {
  disabled: false,
  menuItems: [],
  onChange: () => {},
  selectedIndex: 0,
};




const styles = StyleSheet.create({
  wrapperView: {
    height: 32,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: MarginHorizontal,
    paddingHorizontal: PaddingHorizontal,
    backgroundColor: '#f2f0ee',
  },
  locationLabelView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginLeft: 8,
  },
  locationLabelText: {
    ...SemiBoldFontSettings,
    fontSize: 13,
    color: MainTextColorNew,
  },
});


export default LocationPicker;
