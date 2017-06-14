
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { Primary1Color, Secondary1Color, Primary2Color, Secondary2Color } = Theme.Palette;
const { Border1Color, Border2Color, WhiteTextColor } = Theme.Palette;

const { NavigationBarHeight } = UISharedConstants;
const SwitchHeight = NavigationBarHeight - 14;
const SwitchMaxWidth = NavigationBarHeight * (Platform.OS === 'ios' ? 3.6 : 3.2);
const SwitchPadding = 2;
const ThumbSize = SwitchHeight - SwitchPadding * 2;
const IconSize = ThumbSize / 2;

const Labels = [ 'Calendar', 'Search' ];
const Icons = [ 'calendar', 'search' ];




const CalendarSearchModesToggle = (props) => {

  let { checked, onToggle, offline } = props;


  let thumb = (
    <View style={[
      styles.thumb,
      !props.offline ?
        { backgroundColor: Primary1Color, borderColor: Border2Color } :
        { backgroundColor: Secondary1Color, borderColor: Border1Color }
    ]}>
      <Icon
        name={Icons[Number(checked)]}
        size={IconSize}
        color={'white'}
      />
    </View>
  );


  let label = (
    <View style={[
      styles.label,
      checked ? { paddingLeft: 12 } : { paddingRight: 12 }
    ]}>
      <Text
        numberOfLines={1}
        style={styles.text}
      >
        {Labels[Number(checked)]}
      </Text>
    </View>
  );


  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onToggle}
      style={[
        styles.switch,
        !props.offline ?
          { backgroundColor:  Primary2Color, borderColor: Border2Color } :
          { backgroundColor:  Secondary2Color, borderColor: Border1Color }
      ]}
    >
      {checked ? null : thumb}
      {label}
      {checked ? thumb : null}
    </TouchableOpacity>
  );
}

CalendarSearchModesToggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  offline: PropTypes.bool,
};




const styles = StyleSheet.create({
  switch: {
    flex: 1,
    height: SwitchHeight,
    maxWidth: SwitchMaxWidth,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: SwitchPadding,
    marginHorizontal: 16,
    borderRadius: SwitchHeight / 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: {
    height: ThumbSize,
    width: ThumbSize,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ThumbSize / 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 6,
  },
  text: {
    fontSize: 20,
    color: WhiteTextColor,
  },
});


export default CalendarSearchModesToggle;
