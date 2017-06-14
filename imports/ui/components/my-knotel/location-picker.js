
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

import Colors from '../../colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PickerMenu from '../picker-menu';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { TextColor } = Theme.Palette;
const { MenuFontSize } = Theme.Font;
const { MyKnotelContainerPaddingHorizontal } = UISharedConstants;
const FontSize = MenuFontSize;
const Height = FontSize * 2.25;
const PaddingHorizontal = 8;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




const LocationPicker = (props) => {

  const locationIcon = (
    <Icon
      name={'room'}
      size={22}
      color={Colors.grey600}
    />
  );


  const menuWidth = (
    Display.ShortSide -
    MyKnotelContainerPaddingHorizontal * 2 -
    PaddingHorizontal * 2
  );

  const pickerMenu = (
    <PickerMenu
      onScreenView={locationIcon}
      menuItems={props.menuItems}
      selectedIndex={props.selectedIndex}
      onChange={props.onChange}
      disabled={props.disabled}
      menuWidth={menuWidth}
      fontSize={FontSize}
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
    height: Height,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: PaddingHorizontal,
    borderRadius: 4,
    backgroundColor: Colors.grey300,
  },
  locationLabelView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginLeft: 6,
  },
  locationLabelText: {
    fontSize: FontSize,
    color: TextColor,
  },
});


export default LocationPicker;
