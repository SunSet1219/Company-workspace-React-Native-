
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

import Avatar from './avatar';
import moment from '../../api/unpackaged-improvements/moment';
import Theme from '../theme';
import userHelper from '../helpers/user-helper';

const { TextColor, GreyTextColor } = Theme.Palette;




const NotificationUserDataView = (props) => {

  let { user, notification, style } = props;
  let { username, email, avatarUrl } = userHelper.getUserDataForAvatar(user);

  let timestamp = (
    notification &&
    notification.createdAt &&
    moment(notification.createdAt).fromNow()
  ) || '';


  return (
    <View style={!style ? styles.wrapperView : [ styles.wrapperView, style ]}>
      <Avatar
        username={username}
        email={email}
        avatarUrl={avatarUrl}
        size={40}
      />
      <View style={styles.labelsView}>
        <Text numberOfLines={1} style={styles.upperLabelText}>
          {userHelper.getName(user)}
        </Text>
        <Text numberOfLines={1} style={styles.lowerLabelText}>
          {timestamp}
        </Text>
      </View>
    </View>
  );

};

NotificationUserDataView.propTypes = {
  notification: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  style: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
  ]),
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  labelsView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  upperLabelText: {
    fontSize: 14,
    color: TextColor,
  },
  lowerLabelText: {
    fontSize: 12,
    color: GreyTextColor,
  },
});


export default NotificationUserDataView;
