
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Theme from '../theme';

const { Primary1Color, WhiteTextColor } = Theme.Palette;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




const InviteeView = (props) => {

  let handleRemovePress = () => {
    let { index, label, onRemove } = props;
    onRemove && onRemove(index, label);
  }



  let removeButton = (
    <TouchableOpacity
      hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
      onPress={handleRemovePress}
    >
      <Icon
        name='cancel'
        size={28}
        color='white'
        style={styles.icon}
      />
    </TouchableOpacity>
  );



  return (
    <View style={styles.inviteeEmailView}>
      <View style={styles.labelView}>
        <Text style={styles.labelText}>
          {props.label}
        </Text>
      </View>
      {removeButton}
    </View>
  );

};

InviteeView.propTypes = {
  index: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
};




const styles = StyleSheet.create({
  inviteeEmailView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 17,
    paddingLeft: 13,
    paddingRight: 3,
    paddingTop: 2,
    paddingBottom: 3,
    marginBottom: 26,
    marginRight: 13,
    backgroundColor: Primary1Color,
  },
  labelView: {
    maxWidth: Display.ShortSide - 121,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingVertical: 6,
  },
  labelText: {
    fontSize: 14,
    color: WhiteTextColor,
  },
  icon: {
    marginTop: 1,
    marginLeft: 4,
    backgroundColor: 'transparent',
  },
});


export default InviteeView;
