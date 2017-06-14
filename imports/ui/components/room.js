
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from '../../api/unpackaged-improvements/moment';
import ProgressiveImage from './progressive-image';
import RaisedButton from './raised-button';
import RoomDescription from './room-description';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { Canvas1Color, Border1Color, WhiteTextColor } = Theme.Palette;
const { RoomsContainerPaddingHorizontal } = UISharedConstants;

let { height, width } = Dimensions.get('window');
let shortSide = height > width ? width : height;
const CardMediaHeight = Math.floor(shortSide * 0.85) - RoomsContainerPaddingHorizontal * 2;
const CardMediaBottomBorderWidth = StyleSheet.hairlineWidth;




const Room = (props, context) => {

  let isRoomAvailable = () => {
    let { startDateTimeUTC, endDateTimeUTC } = props.bookingIntervalUTC;
    let startDate = startDateTimeUTC.clone().toDate();
    let endDate = endDateTimeUTC.clone().toDate();

    let currentDate = moment().tz('UTC').toDate();
    let bookingStartTimePassed = endDate < currentDate;
    if (bookingStartTimePassed) { return false; }

    let isRoomAvailable = !props.roomBookings.some(booking => {
      let bookingStartDate = new Date(booking.startDate);
      let bookingEndDate = new Date(booking.endDate);
      bookingStartDate && bookingStartDate.setMilliseconds && bookingStartDate.setMilliseconds(0);
      bookingEndDate && bookingEndDate.setMilliseconds && bookingEndDate.setMilliseconds(0);

      return (
        bookingStartDate >= startDate && bookingStartDate < endDate ||
        bookingEndDate > startDate && bookingEndDate <= endDate ||
        bookingStartDate <= startDate && bookingEndDate >= endDate
      );
    });

    return isRoomAvailable;
  };



  let handleBook = () => {
    if (context.isOffline()) {
      return context.showToast(
        'Unable to book while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    let { room, properties, companies, bookingIntervalUTC } = props;

    Actions[SharedConstants.Subscenes.BookingDialog]({
      room,
      properties,
      companies,
      bookingIntervalUTC,
    });
  };



  let handleShowCalendar = () => {
    if (context.isOffline()) {
      return context.showToast(
        'Unable to show while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    let { room, properties, companies, bookingIntervalUTC, roomBookings } = props;

    Actions[SharedConstants.Subscenes.BookingCalendar]({
      room,
      properties,
      companies,
      bookingIntervalUTC,
      roomBookings,
    });
  };



  let roomAvailable = isRoomAvailable();


  let cardMediaView = (
    <View style={styles.cardMediaView}>
      <ProgressiveImage
        resizeMode='cover'
        source={{ uri: props.room.imgUrls[0].cdnRetinaMedium }}
        style={styles.cardMediaImage}
      />
    </View>
  );


  let calendarIcon = (
    <Icon
      name='date-range'
      size={20}
      color='white'
    />
  );


  let cardMediaOverlayView = (
    <View style={styles.cardMediaOverlayView}>
      <View>
        <Text style={styles.cardMediaTitleText}>
          {props.room.name}
        </Text>
        <Text style={[
          styles.cardMediaSubtitleText, (
            !props.room.location ||
            !props.room.location.floor
          ) && { color: 'transparent' }
        ]}>
          {'Floor ' + (props.room.location && props.room.location.floor)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleShowCalendar}
        style={styles.calendarView}
      >
        <Text style={styles.calendarText}>
          Calendar
        </Text>
        {calendarIcon}
      </TouchableOpacity>
    </View>
  );


  let cardTextView = (
    <RoomDescription
      room={props.room}
    />
  );


  let bookButton = (
    <RaisedButton
      disabled={!roomAvailable}
      label={roomAvailable ? 'BOOK' : 'BOOKED'}
      onPress={handleBook}
      primary={true}
      style={styles.bookButton}
    />
  );


  let cardActionsView = (
    <View style={styles.cardActionsView}>
      {bookButton}
    </View>
  );


  let cardOverlayView =
    !roomAvailable ? (
      <View style={styles.cardOverlayView}>
        <Text style={styles.cardOverlayText}>
          Booked
        </Text>
      </View>
    ) : null;


  return (
    <View style={styles.cardView}>
      {cardMediaView}
      {cardTextView}
      {cardActionsView}
      {cardOverlayView}
      {cardMediaOverlayView}
    </View>
  );

};

Room.propTypes = {
  room: PropTypes.object.isRequired,
  roomBookings: PropTypes.array.isRequired,
  bookingIntervalUTC: PropTypes.object.isRequired,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
};

Room.contextTypes = {
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  cardView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
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
  cardMediaView: {
    left: 0,
    right: 0,
    height: CardMediaHeight,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'stretch',
    borderBottomWidth: CardMediaBottomBorderWidth,
    borderBottomColor: Border1Color,
  },
  cardMediaImage: {
    left: 0,
    right: 0,
    height: CardMediaHeight - CardMediaBottomBorderWidth,
  },
  cardMediaOverlayView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: Math.floor(CardMediaHeight / 5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingLeft: 12,
    paddingRight: 15,
  },
  cardMediaTitleText: {
    fontSize: 18.5,
    fontWeight: 'bold',
    color: WhiteTextColor,
  },
  cardMediaSubtitleText: {
    fontSize: 11,
    lineHeight: 18,
    fontWeight: 'bold',
    color: WhiteTextColor,
    letterSpacing: -0.5,
  },
  calendarView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  calendarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: WhiteTextColor,
    letterSpacing: -0.5,
    marginRight: 4,
  },
  cardActionsView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 8,
  },
  bookButton: {
    height: 36,
    width: 88,
  },
  cardOverlayView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.3)',
  },
  cardOverlayText: {
    fontSize: 32,
    fontWeight: '400',
    color: WhiteTextColor,
    marginTop: Math.floor(CardMediaHeight / 5 * 4),
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});


export default Room;
