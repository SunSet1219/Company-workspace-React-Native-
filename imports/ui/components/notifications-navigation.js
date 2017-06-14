
'use strict';


import React, {
  Component,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CheckboxWithLabel from './checkbox-with-label';
import NotificationsContainer from './notifications/notifications-container';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { Canvas1Color, Primary2Color, WhiteTextColor } = Theme.Palette;
const { StatusBarHeight, NavigationBarHeight } = UISharedConstants;
const NotificationsPerPage = 10;




class NotificationsNavigation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      notificationsToLoadCount: NotificationsPerPage,
      showUnreadNotificationsOnly: false,
    };

    this.handleLoadMoreNotifications = this.handleLoadMoreNotifications.bind(this);
    this.toggleShowUnreadNotificationsOnly = this.toggleShowUnreadNotificationsOnly.bind(this);
  }




  handleLoadMoreNotifications() {
    this.setState({
      notificationsToLoadCount: this.state.notificationsToLoadCount + NotificationsPerPage,
    });
  }




  toggleShowUnreadNotificationsOnly() {
    this.setState({
      showUnreadNotificationsOnly: !this.state.showUnreadNotificationsOnly,
    });
  }




  render() {
    let { notificationsToLoadCount, showUnreadNotificationsOnly } = this.state;

    return (
      <View style={styles.wrapperView}>
        <View style={styles.headerView}>
          <Text style={styles.headerText}>
            Notifications
          </Text>
          <CheckboxWithLabel
            checked={showUnreadNotificationsOnly}
            hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
            iconColor='white'
            iconSize={16}
            label='UNREAD'
            labelStyle={styles.showUnreadNotificationsOnlyButtonText}
            onPress={this.toggleShowUnreadNotificationsOnly}
            style={styles.showUnreadNotificationsOnlyButton}
          />
        </View>
        <NotificationsContainer
          notificationsToLoadCount={notificationsToLoadCount}
          onLoadMoreNotifications={this.handleLoadMoreNotifications}
          showUnreadNotificationsOnly={showUnreadNotificationsOnly}
        />
      </View>
    );
  }

}




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    backgroundColor: Canvas1Color,
  },
  headerView: {
    height: StatusBarHeight + NavigationBarHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBarHeight,
    paddingHorizontal: 16,
    backgroundColor: Primary2Color,
  },
  headerText: {
    fontSize: 20,
    color: WhiteTextColor,
  },
  showUnreadNotificationsOnlyButton: {
    paddingTop: 6,
  },
  showUnreadNotificationsOnlyButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: WhiteTextColor,
  },
});


export default NotificationsNavigation;
