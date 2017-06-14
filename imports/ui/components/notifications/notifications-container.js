
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ActivityIndicator,
  ListView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Duration } from '../snackbar';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import NoDataPlaceholder from '../no-data-placeholder';
import NotificationsItem from './notifications-item';




class Notifications extends Component {

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => (
      r1.notification._id !== r2.notification._id ||
      r1.notification.status !== r2.notification.status ||
      r1.broadcast !== r2.broadcast
    ) });

    this.state = {
      showNoNotificationsLabel: false,
      dataSource: ds,
    };

    this.renderNotifications = this.renderNotifications.bind(this);
    this.handleEndReached = this.handleEndReached.bind(this);
    this.handleBroadcastApproveReject = this.handleBroadcastApproveReject.bind(this);
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded) {
      this.renderNotifications(nextProps);
    }
  }




  renderNotifications(nextProps) {
    let { notifications, users, broadcasts, showUnreadNotificationsOnly } = nextProps;
    let listViewData = [];
    let noNotificationsToShow = true;

    notifications.forEach(notification => {
      if (showUnreadNotificationsOnly && notification.status !== 'unread') { return; }

      noNotificationsToShow = false;

      let user = notification.from && users.find(user => user._id === notification.from);
      let broadcast = broadcasts.find(broadcast => broadcast._id === notification.broadcastId);

      listViewData.push({
        notification,
        user,
        broadcast,
      });
    });

    this.setState({
      showNoNotificationsLabel: noNotificationsToShow,
      dataSource: this.state.dataSource.cloneWithRows(listViewData),
    });
  }




  handleEndReached() {
    let { notifications, totalNotifications, onLoadMoreNotifications } = this.props;
    if (notifications.length < totalNotifications) {
      onLoadMoreNotifications && onLoadMoreNotifications();
    }
  }




  handleMarkNotificationAsRead(notificationId) {
    Meteor.call('markNotificationAsRead', notificationId);
  }




  handleBroadcastApproveReject(broadcastId, status) {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to approve while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    let broadcasterId = Meteor.userId();

    Meteor.call('addBroadcastApproval', broadcastId, broadcasterId, status, (error, result) => {
      if (error) {
        return this.context.showSnackbar({
          message: error.reason || `Failed to set broadcast as ${status}`,
          duration: Duration.Indefinite,
          button: {
            label: 'CLOSE',
          },
        });
      }

      this.context.showSnackbar({
        message: `Broadcast is ${result.status}`,
        duration: Duration.Short,
      });
    });
  }




  render() {
    let { notifications, totalNotifications } = this.props;


    let renderHeader = () => (
      this.state.showNoNotificationsLabel ? (
        <NoDataPlaceholder label='No notifications' />
      ) : null
    );


    let renderRow = (rowData) => (
      <NotificationsItem
        notification={rowData.notification}
        user={rowData.user}
        broadcast={rowData.broadcast}
        onMarkNotificationAsRead={this.handleMarkNotificationAsRead}
        onBroadcastApproveReject={this.handleBroadcastApproveReject}
      />
    );


    let renderFooter = () => (
      notifications.length < totalNotifications ? (
        <View style={styles.loadingSpinnerView}>
          <ActivityIndicator
            animating={!this.props.dataLoaded}
            size='small'
          />
        </View>
      ) : null
    );


    return (
      <ListView
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        initialListSize={10}
        onEndReached={this.handleEndReached}
        onEndReachedThreshold={0}
        renderHeader={renderHeader}
        renderRow={renderRow}
        renderFooter={renderFooter}
      />
    );
  }

}

Notifications.propTypes = {
  dataLoaded: PropTypes.bool,
  totalNotifications: PropTypes.number,
  notifications: PropTypes.array,
  users: PropTypes.array,
  notificationsToLoadCount: PropTypes.number,
  onLoadMoreNotifications: PropTypes.func,
  showUnreadNotificationsOnly: PropTypes.bool,
};

Notifications.contextTypes = {
  showSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const styles = StyleSheet.create({
  loadingSpinnerView: {
    height: 36,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});




export default createContainer(props => {
  if (!Meteor.userId()) {
    return {
      dataLoaded: true,
      totalNotifications: 0,
      notifications: [],
      users: [],
      broadcasts: [],
    };
  }

  let limit = props.notificationsToLoadCount;
  let subscriptionHandle = Meteor.subscribe('ReadNotifications', limit);

  let totalNotificationsCollection = Meteor.collection('counts').findOne({ _id: 'totalNotifications' });
  let totalNotificationsCount = Number(totalNotificationsCollection && totalNotificationsCollection.count);

  return {
    dataLoaded: subscriptionHandle.ready(),
    totalNotifications: totalNotificationsCount,
    notifications: Meteor.collection('notifications').find({}, { sort: { createdAt: -1 }}),
    users: Meteor.collection('users').find(),
    broadcasts: Meteor.collection('broadcasts').find(),
  };
}, Notifications);
