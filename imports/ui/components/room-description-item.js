
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Theme from '../theme';

const { TextColor } = Theme.Palette;

const IconColor = TextColor;
const IconSize = 24;




const RoomDescriptionItem = (props) => {

  let icon = props.icon ? (
    <Icon
      name={props.icon.name}
      size={props.icon.size || IconSize}
      color={props.icon.color || IconColor}
      style={[ styles.icon, props.icon.style ]}
    />
  ) : null;


  let iconText = props.iconText && props.iconText.value ? (
    <Text style={[ styles.iconText, props.iconText.style ]}>
      {props.iconText.value}
    </Text>
  ) : null;


  let noteView = props.noteText && props.noteText.value ? (
    <View style={styles.noteView}>
      <Text style={[ styles.noteText, props.noteText.style ]}>
        {props.noteText.value}
      </Text>
    </View>
  ) : null;


  return (
    <View style={styles.wrapperView}>
      {icon}
      {iconText}
      {noteView}
    </View>
  );

};

RoomDescriptionItem.propTypes = {
  icon: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
    style: View.propTypes.style
  }),
  iconText: PropTypes.shape({
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    style: Text.propTypes.style
  }),
  noteText: PropTypes.shape({
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    style: Text.propTypes.style
  })
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  icon: {},
  iconText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: TextColor,
    marginTop: 2.5,
    marginLeft: 2,
  },
  noteView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  noteText: {
    fontSize: 13,
    color: TextColor,
    marginTop: 4.5,
    marginLeft: 8,
  },
});


export default RoomDescriptionItem;
