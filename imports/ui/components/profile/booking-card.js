
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Card from './card';
import dateHelper from '../../helpers/date-helper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from '../../../api/unpackaged-improvements/moment';
import ProgressiveImage from '../progressive-image';
import SharedConstants from '../../../api/constants/shared';
import AttendeesStatus from './attendees-status'
import Theme from '../../theme';

const { Canvas1Color, Canvas4Color, TextColor } = Theme.Palette;
const RoomImageSize = 105;




const BookingCard = (props) => {

  let { booking, rooms, properties, onBookingEdit, onBookingCancel } = props;

  let title = booking.title;
  let room = rooms && rooms.find(room => room._id === booking.roomId);
  let roomName = room && room.name || booking.bookedRoomName;
  let roomImage = room && room.imgUrls && room.imgUrls[0] && room.imgUrls[0].cdnSmall;
  let roomPropertyTimeZone = dateHelper.getRoomPropertyTimeZone(room, properties);
  let startDate = moment(booking.startDate).tz(roomPropertyTimeZone);
  let endDate = moment(booking.endDate).tz(roomPropertyTimeZone);
  let bookingPassed = endDate.isBefore();
  let dateText = startDate.format('MM/DD, h:mm a z') + ' to ' + endDate.format('h:mm a');
  let attendees = booking.attendees || [];



  const handleBookingEdit = () => {
    onBookingEdit && onBookingEdit(booking);
  };



  const handleBookingCancel = () => {
    onBookingCancel && onBookingCancel(booking._id);
  };



  let editAndCancelButtons = !bookingPassed ? (
    <View style={styles.editAndCancelIconView}>
      <Icon
        name='edit'
        size={25}
        color={TextColor}
        onPress={handleBookingEdit}
        style={styles.editIcon}
      />
      <Icon
        name='delete-sweep'
        size={25}
        color={TextColor}
        onPress={handleBookingCancel}
      />
    </View>
  ) : null;



  const renderIconByName = (name) => (
    <Icon
      name={name}
      size={17}
      color={TextColor}
      style={styles.descriptionIcon}
    />
  );


  return (
    <Card>
      <View style={[
        styles.wrapperView,
        { backgroundColor: bookingPassed ? Canvas4Color : Canvas1Color }
      ]}>
        <View style={styles.roomImageView}>
          <ProgressiveImage
            resizeMode='cover'
            source={{ uri: roomImage }}
            style={styles.roomImage}
          />
        </View>

        <View style={styles.descriptionView}>
          <View style={styles.rowView}>
            <Text numberOfLines={1} style={styles.titleText}>
              {title}
            </Text>
            {editAndCancelButtons}
          </View>

          <View style={styles.rowViewWithMarginBottom}>
            {renderIconByName('place')}
            <Text style={styles.descriptionBoldText}>
              {roomName}
            </Text>
          </View>

          <View style={styles.rowViewWithMarginBottom}>
            {renderIconByName('access-time')}
            <Text style={styles.descriptionNormalText}>
              {dateText}
            </Text>
          </View>

          <AttendeesStatus
            attendees={attendees}
          />
        </View>
      </View>
    </Card>
  );

};

BookingCard.propTypes = {
  booking: PropTypes.object,
  rooms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  onBookingEdit: PropTypes.func,
  onBookingCancel: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderRadius: 2,
    overflow: 'hidden',
  },
  roomImageView: {
    width: RoomImageSize,
    height: RoomImageSize,
    backgroundColor: Canvas1Color,
  },
  roomImage: {
    width: RoomImageSize,
    height: RoomImageSize,
  },
  descriptionView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  rowViewWithMarginBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleText: {
    flex: 1,
    fontSize: 15,
    color: TextColor,
    marginRight: 10,
    marginBottom: 6,
  },
  editAndCancelIconView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  editIcon: {
    marginRight: 7,
  },
  descriptionIcon: {
    marginRight: 5,
  },
  descriptionNormalText: {
    flex: 1,
    fontSize: 13,
    color: TextColor,
    marginTop: 1,
  },
  descriptionBoldText: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: TextColor,
    marginTop: 1,
  },
});


export default BookingCard;
