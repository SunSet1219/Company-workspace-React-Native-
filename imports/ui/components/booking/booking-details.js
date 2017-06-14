
'use strict';


import React, {
  PropTypes,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import ModalInfo from '../modal-info';
import moment from '../../../api/unpackaged-improvements/moment';
import Ordinal from '../../helpers/ordinal';
import Theme from '../../theme';
import UserChip from '../user-chip';
import userHelper from '../../helpers/user-helper';

const { TextColor } = Theme.Palette;
const { ModalTitleFontSize, TextFontSize } = Theme.Font;




const BookingDetails = (props) => {

  const renderIconByName = (name) => (
    <Icon
      name={name}
      size={24}
      color={TextColor}
    />
  );


  const renderItem = (iconName, label) => (
    <View style={styles.itemWrapperView}>
      {renderIconByName(iconName)}
      <View style={styles.itemLabelView}>
        <Text style={styles.itemLabelText}>
          {label}
        </Text>
      </View>
    </View>
  );


  const { booking, users, rooms, properties, propertyTimeZone } = props;

  const creator = users && users.find(user => user._id === booking.creatorId);
  const { username, email, avatarUrl } = userHelper.getUserDataForAvatar(creator);

  const startDate = moment(booking.startDate).tz(propertyTimeZone);
  const endDate = moment(booking.endDate).tz(propertyTimeZone);
  const bookingDateText = startDate.format('MMMM Do, YYYY');
  const bookingPeriodText = `${startDate.format('h:mm a')} - ${endDate.format('h:mm a')}`;

  const room = rooms && rooms.find(room => room._id === booking.roomId);
  const roomName = room && room.name || '';
  const roomLocation = room && room.location;
  const floor = roomLocation && `${Ordinal.getOrdinal(Number(roomLocation.floor))} floor` || '';
  const property = properties && properties.find(property => property._id === room.propertyId);
  const propertyTitle = property && property.title || '';
  const roomInfoText = [ roomName, floor, propertyTitle ].join(', ');


  const createdByView = (
    <View style={styles.createdByView}>
      <Text style={styles.itemHeader}>
        Created by:
      </Text>
      <UserChip
        username={username}
        email={email}
        avatarUrl={avatarUrl}
        height={32}
      />
    </View>
  );


  const attendeesListItems = props.booking.attendees.map((attendee, i) => (
    <View key={i} style={styles.attendeeListItemView}>
      <Text style={styles.attendeeListItemText}>
        {`${attendee.displayName || attendee.email} `}
        ({attendee.organiser ? 'organiser' : attendee.responseStatus})
      </Text>
    </View>
  ));


  const attendeesList = (
    <View style={styles.attendeesListWrapperView}>
      <Text style={styles.itemHeader}>
        Attendees:
      </Text>
      {attendeesListItems}
    </View>
  );


  return (
    <ModalInfo
      title={booking.title}
      visible={props.visible}
      onRequestClose={props.onRequestClose}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {renderItem('place', roomInfoText)}
        {renderItem('date-range', bookingDateText)}
        {renderItem('access-time', bookingPeriodText)}
        {createdByView}
        {attendeesList}
      </ScrollView>
    </ModalInfo>
  );

};

BookingDetails.propTypes = {
  visible: PropTypes.bool,
  booking: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  propertyTimeZone: PropTypes.string.isRequired,
  onRequestClose: PropTypes.func,
};




const styles = StyleSheet.create({
  scrollViewContentContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 20,
  },
  itemWrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemLabelView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  itemLabelText: {
    fontSize: TextFontSize,
    color: TextColor,
    marginTop: 2.5,
    marginLeft: 8,
  },
  itemHeader: {
    fontSize: TextFontSize,
    fontWeight: '500',
    color: TextColor,
    marginRight: 8,
  },
  createdByView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 12,
  },
  attendeesListWrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 8,
  },
  attendeeListItemView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  attendeeListItemText: {
    fontSize: TextFontSize,
    color: TextColor,
  },
});


export default BookingDetails;
