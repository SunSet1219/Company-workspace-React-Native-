
'use strict';


import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Avatar from './avatar';
import Colors from '../colors';




const UserChip = (props) => {

  const { height } = props;
  const borderRadius = height / 2;
  const paddingLeft = props.height / 8 * 2;
  const paddingRight = props.height / 8 * 3;
  const fontSize = props.height / 32 * 13;


  const avatar = (
    <Avatar
      username={props.username}
      email={props.email}
      avatarUrl={props.avatarUrl}
      size={height}
    />
  );


  const label = (
    <View style={[ styles.labelView, { paddingLeft, paddingRight }]}>
      <Text
        numberOfLines={1}
        style={[ styles.labelText, { fontSize }]}
      >
        {props.username}
      </Text>
    </View>
  );


  return (
    <View style={[ styles.wrapperView, { height, borderRadius }]}>
      {avatar}
      {label}
    </View>
  );

};

UserChip.propTypes = {
  height: PropTypes.number,
  username: PropTypes.string,
  email: PropTypes.string,
  avatarUrl: PropTypes.string,
};

UserChip.defaultProps = {
  height: 32,
  username: '',
  email: '',
  avatarUrl: '',
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: -1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.grey300,
  },
  labelView: {
    flex: -1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  labelText: {
    color: Colors.darkBlack,
  },
});


export default UserChip;
