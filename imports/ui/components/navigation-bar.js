
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor from 'baryshok-react-native-meteor';
import NotificationsStatusView from './notifications/notifications-status-view';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { Primary1Color, Secondary1Color, WhiteTextColor } = Theme.Palette;
const { StatusBarHeight, NavigationBarHeight } = UISharedConstants;




class NavigationBar extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      offline: context.isOffline(),
    };

    this.goOffline = this.goOffline.bind(this);
    this.goOnline = this.goOnline.bind(this);
    this.handleMenuIconPress = this.handleMenuIconPress.bind(this);
    this.handleNotificationsIconPress = this.handleNotificationsIconPress.bind(this);
  }




  componentWillMount() {
    Meteor.ddp.on('disconnected', this.goOffline);
    Meteor.getData().on('onLogin', this.goOnline);
  }




  componentWillUnmount() {
    Meteor.ddp.off('disconnected', this.goOffline);
    Meteor.getData().off('onLogin', this.goOnline);
  }




  goOffline() {
    this.setState({ offline: true });
  }




  goOnline() {
    this.setState({ offline: false });
  }




  handleMenuIconPress() {
    let { onMenuIconPress } = this.props;

    if (onMenuIconPress) {
      onMenuIconPress();
    } else {
      this.context.openMenuDrawer();
      this.context.hideSnackbar();
    }
  }




  handleNotificationsIconPress() {
    if (this.state.offline) {
      return this.context.showToast(
        'Unable to show while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    let { onNotificationsIconPress } = this.props;

    if (onNotificationsIconPress) {
      onNotificationsIconPress();
    } else {
      this.context.openNotificationsDrawer();
      this.context.hideSnackbar();
    }
  }




  render() {
    let props = this.props;
    let state = this.state;


    let menuButton = (
      <TouchableOpacity
        hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
        onPress={this.handleMenuIconPress}
      >
        <Icon
          name='dehaze'
          size={28}
          color='white'
        />
      </TouchableOpacity>
    );


    let titleOrToggle = !props.toggle ? (
      <Text
        numberOfLines={1}
        style={styles.titleText}
      >
        {props.title}
      </Text>
    ) : React.cloneElement(props.toggle, { offline: state.offline });


    let offlineLabel = state.offline ? (
      <Text style={styles.offlineLabelText}>
        Offline
      </Text>
    ) : null;


    let notificationsStatusView = (
      <NotificationsStatusView
        onPress={this.handleNotificationsIconPress}
      />
    );


    return (
      <View
        onLayout={this.onLayout}
        style={
          state.offline ?
            [ styles.navBarWrapperView, { backgroundColor: Secondary1Color }] :
            styles.navBarWrapperView
        }
      >
        <View style={styles.navBarView}>
          <View style={styles.menuButtonAndTitleOrToggleView}>
            {menuButton}
            {titleOrToggle}
          </View>
          <View style={styles.offlineLabelAndNotificationsStatusView}>
            {offlineLabel}
            {notificationsStatusView}
            {props.overflowMenu}
          </View>
        </View>
      </View>
    );
  }

}

NavigationBar.propTypes = {
  title: PropTypes.string,
  toggle: PropTypes.element,
  overflowMenu: PropTypes.element,
  onMenuIconPress: PropTypes.func,
  onNotificationsIconPress: PropTypes.func,
};

NavigationBar.contextTypes = {
  openMenuDrawer: PropTypes.func,
  openNotificationsDrawer: PropTypes.func,
  hideSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  navBarWrapperView: {
    height: StatusBarHeight + NavigationBarHeight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: Primary1Color,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        zIndex: 999,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  navBarView: {
    height: StatusBarHeight + NavigationBarHeight,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: StatusBarHeight,
    paddingLeft: 16,
    paddingRight: 10,
  },
  menuButtonAndTitleOrToggleView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
    fontSize: 20,
    color: WhiteTextColor,
    paddingHorizontal: 16,
    paddingBottom: 3,
  },
  offlineLabelAndNotificationsStatusView: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  offlineLabelText: {
    fontSize: 16,
    fontWeight: '100',
    color: WhiteTextColor,
    paddingRight: 8,
  },
});


export default NavigationBar;
