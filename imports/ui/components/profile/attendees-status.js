
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import _ from 'underscore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ModalInfo from '../modal-info';
import Theme from '../../theme';

const { TextColor } = Theme.Palette;

const Status = [ 'accepted', 'tentative', 'needsAction', 'declined' ];

const ModalTitles = {
  accepted: 'Members',
  tentative: 'May attend',
  needsAction: 'Invited',
  declined: 'Declined',
};

const IconNames = {
  accepted: 'thumb-up',
  tentative: 'thumbs-up-down',
  needsAction: 'help',
  declined: 'thumb-down',
};




class AttendeesStatus extends Component {

  constructor(props) {
    super(props);

    this.state = {
      statusAttendees: _.groupBy(props.attendees, 'responseStatus'),
      statusToShowInModal: undefined,
      modalVisible: false,
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.renderStatusItem = this.renderStatusItem.bind(this);
    this.renderStatusItems = this.renderStatusItems.bind(this);
    this.renderStatusListModal = this.renderStatusListModal.bind(this);
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.attendees) {
      this.setState({
        statusAttendees: _.groupBy(nextProps.attendees, 'responseStatus'),
      });
    }
  }




  renderIconByStatus(status) {
    return (
      <Icon
        name={IconNames[status]}
        size={17}
        color={TextColor}
        style={styles.statusIcon}
      />
    );
  }




  showModal(status) {
    this.setState({
      statusToShowInModal: status,
      modalVisible: true,
    });
  }




  hideModal() {
    this.setState({
      statusToShowInModal: undefined,
      modalVisible: false,
    })
  }




  renderStatusItem(status, count) {
    return (
      <TouchableOpacity
        key={status}
        onPress={() => this.showModal(status)}
        style={styles.attendeesStatusButton}
      >
        {this.renderIconByStatus(status)}
        <Text style={styles.attendeesStatusText}>
          {count}
        </Text>
      </TouchableOpacity>
    );
  }




  renderStatusItems() {
    let statusItems = [];
    const { statusAttendees } = this.state;

    Status.forEach(status => {
      const count = statusAttendees[status] && statusAttendees[status].length;
      if (count) { statusItems.push(this.renderStatusItem(status, count)); }
    });

    return statusItems;
  }




  renderStatusListModal() {
    const { modalVisible, statusAttendees, statusToShowInModal } = this.state;

    if (!modalVisible) { return null; }

    const attendees = statusAttendees[statusToShowInModal];
    const attendeeEmailViews = attendees && attendees.map((attendee, i) => (
      <View key={i} style={styles.attendeeEmailView}>
        <Text style={styles.attendeeEmailText}>
          {attendee.email}
        </Text>
      </View>
    ));

    return (
      <ModalInfo
        title={ModalTitles[statusToShowInModal]}
        visible={modalVisible}
        onRequestClose={this.hideModal}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
          {attendeeEmailViews}
        </ScrollView>
      </ModalInfo>
    );
  }




  render() {
    return (
      <View style={styles.wrapperView}>
        {this.renderStatusItems()}
        {this.renderStatusListModal()}
      </View>
    );
  }

}

AttendeesStatus.propTypes = {
  attendees: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  scrollViewContentContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 20,
  },
  attendeesStatusButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: 15,
  },
  attendeesStatusText: {
    fontSize: 14,
    color: TextColor,
  },
  statusIcon: {
    marginRight: 5,
  },
  attendeeEmailView: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  attendeeEmailText: {
    fontSize: 16,
    color: TextColor,
  },
});


export default AttendeesStatus;
