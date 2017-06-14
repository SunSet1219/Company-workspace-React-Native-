
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

import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from '../../../api/unpackaged-improvements/moment';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';
import userHelper from '../../helpers/user-helper';

const { Canvas1Color, Border1Color, TextColor } = Theme.Palette;
const FontSize = 13;
const IconsSize = 24;




class BroadcastCard extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showWholeContent: false,
    };

    this.toggleShowWholeContent = this.toggleShowWholeContent.bind(this);
    this.renderSmsMessagesStatuses = this.renderSmsMessagesStatuses.bind(this);
  }




  toggleShowWholeContent() {
    this.setState({ showWholeContent: !this.state.showWholeContent });
  }




  renderSmsMessagesStatuses() {
    let { broadcast, smsMessages } = this.props;

    let broadcastSmsMessages = smsMessages.filter(message => message.broadcastId === broadcast._id);
    let agregatedStatuses = [];

    broadcastSmsMessages.forEach(message => {
      let messageStatus = message.status && message.status.status;
      if (!messageStatus) { return; }

      let statusIndex = agregatedStatuses.findIndex(item => item.status === messageStatus);
      statusIndex === -1 ?
        agregatedStatuses.push({ status: messageStatus, count: 1 }) :
        agregatedStatuses[statusIndex].count++;
    });

    let smsMessagesStatuses = agregatedStatuses.map((item, i) => (
      <Text key={i} style={styles.smsMessagesStatusText}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}: {item.count}
      </Text>
    ));

    return (
      <View style={styles.smsMessagesStatuses}>
        <Text style={styles.groupItemLabelText}>
          SMS Statuses:
        </Text>
        {smsMessagesStatuses}
        <Text style={styles.smsMessagesTotalText}>
          Total: {broadcastSmsMessages.length}
        </Text>
      </View>
    );
  }




  render() {
    let { showWholeContent } = this.state;
    let { broadcast, users, smsMessages } = this.props;
    let { createdBy, targets, createdAt, sendTime, endpoints, title, message, notes } = broadcast;

    const formatDate = (date) => {
      let timeZone = SharedConstants.propertiesTimeZone;
      let format = 'YYYY-MM-DD HH:mm z';
      return moment(date).tz(timeZone).format(format);
    };

    let creator = users.find(user => user._id === createdBy);
    let createdByText = creator ? userHelper.getName(creator) : '';
    let targetsListText = targets && targets.map(target => target.type).join(', ');
    let createdAtText = formatDate(createdAt);
    let sendTimeText = formatDate(sendTime);
    let endpointsText = endpoints && endpoints.filter(endpoint => endpoint.active).map(endpoint => endpoint.type).join(', ');
    let titleText = title;
    let messageText = message && message.text;
    let notesText = notes;

    const renderIconByName = (name) => (
      <Icon
        name={name}
        size={IconsSize}
        color={TextColor}
        style={styles.descriptionIcon}
      />
    );


    let editAndDeleteButtons = (
      <View style={styles.editAndDeleteButtonsView}>
        <TouchableOpacity
          hitSlop={{ top: 10, left: 10, bottom: 10, right: 5 }}
          onPress={() => this.props.onEdit(broadcast)}
          style={styles.editAndDeleteButtons}
        >
          <Icon
            name='edit'
            size={IconsSize}
            color={TextColor}
          />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 10, left: 5, bottom: 10, right: 10 }}
          onPress={() => this.props.onDelete(broadcast)}
          style={styles.editAndDeleteButtons}
        >
        <Icon
          name='delete-sweep'
          size={IconsSize}
          color={TextColor}
        />
        </TouchableOpacity>
      </View>
    );


    let createdByView = createdByText ? (
      <View style={styles.createdByView}>
        {renderIconByName('account-circle')}
        <Text style={styles.itemText}>
          {createdByText}
        </Text>
      </View>
    ) : null;


    let createdByAndButtonsView = (
      <View style={styles.createdByAndButtonsView}>
        {createdByView}
        {editAndDeleteButtons}
      </View>
    );


    let targetsListView = targetsListText ? (
      <View style={styles.itemView}>
        {renderIconByName('place')}
        <Text style={styles.itemText}>
          {targetsListText}
        </Text>
      </View>
    ) : null;


    let createdAtView = createdAtText && showWholeContent ? (
      <View style={styles.itemView}>
        {renderIconByName('add-circle')}
        <Text style={styles.itemText}>
          {createdAtText}
        </Text>
      </View>
    ) : null;


    let sendTimeView = sendTimeText ? (
      <View style={styles.itemView}>
        {renderIconByName('access-time')}
        <Text style={styles.itemText}>
          {sendTimeText}
        </Text>
      </View>
    ) : null;


    let endpointsView = endpointsText && showWholeContent ? (
      <View style={styles.itemView}>
        {renderIconByName('info')}
        <Text style={styles.itemText}>
          {endpointsText}
        </Text>
      </View>
    ) : null;


    const renderMessageGroupItem = (label, content) => {
      return content ? (
        <Text
          numberOfLines={showWholeContent ? 0 : 2}
          style={styles.groupItemText}
        >
          <Text style={styles.groupItemLabelText}>
            {label}
          </Text>
          {content}
        </Text>
      ) : null;
    };


    let messageGroupItemsView = (
      <View style={styles.messageGroupItemsView}>
        {renderIconByName('email')}
        <View style={styles.groupItemsView}>
          {renderMessageGroupItem('Title: ', titleText)}
          {renderMessageGroupItem('Message: ', messageText)}
          {renderMessageGroupItem('Notes: ', notesText)}
        </View>
      </View>
    );


    let smsMessagesStatusesView = smsMessages.length && showWholeContent ? (
      <View style={styles.itemView}>
        {renderIconByName('notifications')}
        <View style={styles.groupItemsView}>
          {this.renderSmsMessagesStatuses()}
        </View>
      </View>
    ) : null;


    let expandMoreLessButton = (
      <TouchableOpacity
        hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
        onPress={this.toggleShowWholeContent}
        style={styles.expandMoreLessButton}
      >
        <Icon
          name={showWholeContent ? 'expand-less' : 'expand-more'}
          size={36}
          color={TextColor}
        />
      </TouchableOpacity>
    );


    return (
      <View style={styles.cardView}>
        {createdByAndButtonsView}
        {targetsListView}
        {createdAtView}
        {sendTimeView}
        {endpointsView}
        {messageGroupItemsView}
        {smsMessagesStatusesView}
        {expandMoreLessButton}
      </View>
    );
  }

}

BroadcastCard.propTypes = {
  broadcast: PropTypes.object,
  users: PropTypes.array,
  properties: PropTypes.array,
  smsMessages: PropTypes.array,
};




const styles = StyleSheet.create({
  cardView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Canvas1Color,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0.5, },
        shadowOpacity: 0.25,
        shadowRadius: 1.5,
      },
      android: (Platform.Version < 21) ? {
        borderColor: Border1Color,
        borderWidth: StyleSheet.hairlineWidth,
      } : {
        elevation: 2,
      },
    }),
  },
  itemView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  itemText: {
    flex: 1,
    fontSize: FontSize,
    color: TextColor,
    marginTop: 4,
  },
  messageGroupItemsView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingBottom: 9,
  },
  groupItemsView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 4,
    paddingRight: 16,
  },
  groupItemLabelText: {
    fontSize: FontSize,
    lineHeight: 17,
    fontWeight: 'bold',
    color: TextColor,
  },
  groupItemText: {
    fontSize: FontSize,
    lineHeight: 17,
    color: TextColor,
    paddingBottom: 5,
  },
  smsMessagesStatuses: {
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  smsMessagesStatusText: {
    fontSize: FontSize,
    color: TextColor,
  },
  smsMessagesTotalText: {
    fontSize: FontSize,
    fontWeight: 'bold',
    color: TextColor,
    paddingTop: 2,
  },
  descriptionIcon: {
    marginRight: 8,
  },
  createdByView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  createdByAndButtonsView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  editAndDeleteButtonsView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  editAndDeleteButtons: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  expandMoreLessButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});


export default BroadcastCard;
