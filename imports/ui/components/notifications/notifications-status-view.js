
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import UISharedConstants from '../../ui-shared-constants';

const IconSize = 25;




class NotificationsStatusView extends Component {

  constructor(props) {
    super(props);

    this.handleLogin = this.handleLogin.bind(this);
  }



  componentWillMount() {
    Meteor.getData().on('onLogin', this.handleLogin);
  }



  componentWillUnmount() {
    Meteor.getData().off('onLogin', this.handleLogin);
  }



  handleLogin() {
    this.forceUpdate();
  }



  render() {
    let { unreadNotificationsCount, onPress } = this.props;

    let unreadNotificationsCountText = unreadNotificationsCount ? (
      <Text style={styles.unreadNotificationsCountText}>
        {unreadNotificationsCount > 10 ? '10+' : unreadNotificationsCount}
      </Text>
    ) : null;

    return (
      <TouchableOpacity
        hitSlop={{ top: 8, left: 8, bottom: 8, right: 4 }}
        onPress={onPress}
        style={styles.wrapperView}
      >
        <Icon
          name={unreadNotificationsCount ? 'notifications-active' : 'notifications-none'}
          size={IconSize}
          color='white'
        />
        {unreadNotificationsCountText}
      </TouchableOpacity>
    );
  }

}

NotificationsStatusView.propTypes = {
  unreadNotificationsCount: PropTypes.number,
  onPress: PropTypes.func,
};



const styles = StyleSheet.create({
  wrapperView: {
    height: UISharedConstants.NavigationBarHeight - 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  unreadNotificationsCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'flex-start',
    marginLeft: 1,
    marginTop: Math.floor((UISharedConstants.NavigationBarHeight - IconSize) / 5),
  },
});



export default createContainer(() => {
  if (!Meteor.userId()) {
    return { unreadNotificationsCount: 0 };
  }

  Meteor.subscribe('userNotifications', 1);

  let totalUnreadNotifications = Meteor.collection('counts').findOne({ _id: 'totalUnreadNotifications' });
  let unreadNotificationsCount = Number(totalUnreadNotifications && totalUnreadNotifications.count);

  return { unreadNotificationsCount };
}, NotificationsStatusView);
