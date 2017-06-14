
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Image,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import PickerMenu from '../picker-menu';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { Primary2Color, Secondary2Color, WhiteTextColor } = Theme.Palette;
const { MenuFontSize } = Theme.Font;
const { NavigationBarHeight } = UISharedConstants;

const KnotelLogo = require('../../../resources/logo-bookings.png');
const Height = 32;
const LocationLabelPlaceholder = 'Detecting...';




const LocationPickerMenu = (props) => {

  const knotelLogoView = !props.disabled ? (
    <View style={styles.knotelLogoView}>
      <Image
        source={KnotelLogo}
        style={styles.knotelLogoImage}
      />
    </View>
  ) : null;


  const pickerMenu = (
    <PickerMenu
      onScreenView={knotelLogoView}
      menuItems={props.menuItems}
      selectedIndex={props.selectedIndex}
      onChange={props.onChange}
      disabled={props.disabled}
      menuWidth={180}
      fontSize={MenuFontSize}
      alignLeft={true}
    />
  );


  const selectedItem = props.menuItems[props.selectedIndex];
  const locationLabel = selectedItem && selectedItem.label;

  const locationLabelView = (
    <View style={styles.locationLabelView}>
      <Text
        numberOfLines={1}
        style={styles.locationLabelText}
      >
        {locationLabel || LocationLabelPlaceholder}
      </Text>
    </View>
  );


  return (
    <View style={[
      styles.wrapperView,
      { backgroundColor: !props.disabled ? Primary2Color : Secondary2Color }
    ]}>
      {pickerMenu}
      {locationLabelView}
    </View>
  );

};

LocationPickerMenu.propTypes = {
  disabled: PropTypes.bool,
  menuItems: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  selectedIndex: PropTypes.number,
};

LocationPickerMenu.defaultProps = {
  disabled: false,
  menuItems: [],
  onChange: () => {},
  selectedIndex: 0,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 16,
  },
  knotelLogoView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  knotelLogoImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  locationLabelView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  locationLabelText: {
    fontSize: 16,
    color: WhiteTextColor,
  },
});


export default LocationPickerMenu;
