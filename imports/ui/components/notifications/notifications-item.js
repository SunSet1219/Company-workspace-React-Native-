
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

import Colors from '../../colors';
import CurrentUserDataView from '../current-user-data-view';
import { MKButton } from 'baryshok-react-native-material-kit';
import RaisedButton from '../raised-button';
import Theme from '../../theme';
import UserNotificationDataView from '../user-notification-data-view';

const { Canvas1Color, Canvas2Color, Border1Color } = Theme.Palette;
const { MKButtonMaskColor, MKButtonRippleColor } = Theme.Palette;

const PaddingTop = 12;
const PaddingBottom = 14;
const ApproveRejectButtonsHeight = 22;
const ApproveRejectButtonsViewHeight = PaddingTop + ApproveRejectButtonsHeight + PaddingBottom;




class NotificationsItem extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showWholeMessageContent: false,
      unread: props.notification.status === 'unread',
    };

    this.handleNotificationPress = this.handleNotificationPress.bind(this);
    this.handleBroadcastApproveReject = this.handleBroadcastApproveReject.bind(this);
  }




  componentWillReceiveProps(nextProps) {
    let unread = nextProps.notification.status === 'unread';
    if (unread !== this.state.unread) {
      this.setState({ unread });
    }
  }




  handleNotificationPress() {
    let { notification, onMarkNotificationAsRead } = this.props;

    this.setState({
      showWholeMessageContent: !this.state.showWholeMessageContent,
      unread: false,
    });

    if (notification.status === 'unread') {
      onMarkNotificationAsRead && onMarkNotificationAsRead(notification._id);
    }
  }




  handleBroadcastApproveReject(status) {
    let { notification, onBroadcastApproveReject } = this.props;
    let broadcastId = notification.broadcastId;
    onBroadcastApproveReject && onBroadcastApproveReject(broadcastId, status);
  }




  render() {
    let { notification, user, broadcast } = this.props;
    let { unread, showWholeMessageContent } = this.state;

    let broadcastRequest = notification.createdBy === 'broadcastRequest';
    let broadcastApprovals = broadcast && broadcast.approvals;
    let broadcastApproved = broadcastApprovals && broadcastApprovals.some(item => item.approved);
    let broadcastActive = broadcast && broadcast.jobStatus === 'Active';


    let approveRejectButtonsView = broadcastRequest ? (
      <View style={styles.approveRejectButtonsView}>
        <RaisedButton
          backgroundColor={Colors.green500}
          disabled={!broadcastActive}
          disabledBackgroundColor={Colors.grey400}
          label={broadcastActive ? 'APPROVE' : (broadcastApproved ? 'APPROVED' : 'REJECTED')}
          labelStyle={styles.approveRejectButtonsLabel}
          onPress={() => this.handleBroadcastApproveReject('approved')}
          style={styles.approveButton}
        />
        {
          broadcastActive ? (
            <RaisedButton
              backgroundColor={Colors.red500}
              label='REJECT'
              labelStyle={styles.approveRejectButtonsLabel}
              onPress={() => this.handleBroadcastApproveReject('rejected')}
              style={styles.rejectButton}
            />
          ) : null
        }
      </View>
    ) : null;


    return (
      <View style={[
        styles.wrapperView,
        { backgroundColor: unread ? Canvas2Color : Canvas1Color }
      ]}>
        <MKButton
          maskColor={MKButtonMaskColor}
          rippleColor={MKButtonRippleColor}
          onPress={this.handleNotificationPress}
          style={[
            styles.rippledButton,
            broadcastRequest && { paddingBottom: ApproveRejectButtonsViewHeight }
          ]}
        >
          <UserNotificationDataView
            notification={notification}
            user={user}
          />
          <View style={styles.contentView}>
            <Text
              numberOfLines={showWholeMessageContent ? 0 : 2}
              style={styles.messageText}
            >
              <Text style={styles.titleText}>
                {notification.title + ' -- '}
              </Text>
              {notification.message}
            </Text>
          </View>
        </MKButton>
      {approveRejectButtonsView}
      </View>
    );
  }

}

NotificationsItem.propTypes = {
  notification: PropTypes.object,
  user: PropTypes.object,
  broadcast: PropTypes.object,
  onMarkNotificationAsRead: PropTypes.func,
  onBroadcastApproveReject: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Border1Color,
  },
  rippledButton: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 18,
    paddingTop: PaddingTop,
    paddingBottom: PaddingBottom,
  },
  contentView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 10,
  },
  titleText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.grey800,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.grey600,
  },
  approveRejectButtonsView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ApproveRejectButtonsViewHeight,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingTop: PaddingTop,
    paddingBottom: PaddingBottom,
  },
  approveRejectButtonsLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'white',
  },
  approveButton: {
    height: ApproveRejectButtonsHeight,
  },
  rejectButton: {
    height: ApproveRejectButtonsHeight,
    marginLeft: 14,
  },
});


export default NotificationsItem;
