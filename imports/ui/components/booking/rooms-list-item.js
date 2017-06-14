
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import BookingPeriodBar from './booking-period-bar';
import FlatButton from '../flat-button';
import RoomCard from './room-card';
import RoomSchedule from './room-schedule';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { Primary1Color, WhiteTextColor } = Theme.Palette;
const { ActionButtonLabelFontSize2 } = Theme.Font;
const { ActionButtonsBarHeight } = UISharedConstants;




class RoomsListItem extends Component {

  constructor(props) {
    super(props);

    this.isRoomAvailable = this.isRoomAvailable.bind(this);
  }




  shouldComponentUpdate(nextProps) {
    if (this.props.selected || nextProps.selected) { return true; }
    return false;
  }




  isRoomAvailable(roomBookings) {
    const { dateTime, period } = this.props;
    const startDate = dateTime.clone().tz('UTC').toDate();
    if (startDate < Date.now()) { return false; }
    const endDate = dateTime.clone().add(period, 'minutes').tz('UTC').toDate();

    return !roomBookings.some(booking => {
      let bookingStartDate = new Date(booking.startDate);
      let bookingEndDate = new Date(booking.endDate);

      return (
        bookingStartDate >= startDate && bookingStartDate < endDate ||
        bookingEndDate > startDate && bookingEndDate <= endDate ||
        bookingStartDate <= startDate && bookingEndDate >= endDate
      );
    });
  }




  render() {
    const { props } = this;
    const offline = this.context.isOffline();


    const roomCard = (
      <RoomCard room={props.room} />
    );


    const userId = props.user && props.user._id;
    const roomId = props.room && props.room._id;
    const roomBookings = props.bookings.filter(booking => booking.roomId === roomId);
    const roomAvailable = this.isRoomAvailable(roomBookings);

    const roomSchedule = (
      <RoomSchedule
        userId={userId}
        roomId={roomId}
        roomBookings={roomBookings}
        onShowBookingDetails={props.onShowBookingDetails}
        roomAvailable={roomAvailable}
        propertyTimeZone={props.propertyTimeZone}
        dateTime={props.dateTime}
        onTimeChange={props.onTimeChange}
        period={props.period}
        onPeriodChange={props.onPeriodChange}
        selected={props.selected}
        onSelect={() => props.onSelect(roomId)}
      />
    );


    const bookingPeriodBar = props.selected ? (
      <BookingPeriodBar
        dateTime={props.dateTime}
        period={props.period}
        onPeriodChange={props.onPeriodChange}
      />
    ) : null;


    const nextButton = props.selected ? (
      <FlatButton
        disabled={!roomAvailable || offline}
        label={(roomAvailable && !offline) ? 'NEXT' : 'UNAVAILABLE'}
        labelStyle={styles.nextButtonLabel}
        onPress={props.onNextButtonPress}
        primary={true}
        style={styles.nextButton}
      />
    ) : null;


    return (
      <View style={styles.wrapperView}>
        {roomCard}
        {roomSchedule}
        {bookingPeriodBar}
        {nextButton}
      </View>
    );
  }

}

RoomsListItem.propTypes = {
  room: PropTypes.object.isRequired,
  propertyTimeZone: PropTypes.string.isRequired,
  dateTime: PropTypes.object.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  period: PropTypes.number.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  bookings: PropTypes.arrayOf(PropTypes.object).isRequired,
  onShowBookingDetails: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  onNextButtonPress: PropTypes.func.isRequired,
};

RoomsListItem.contextTypes = {
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginBottom: 15,
  },
  nextButton: {
    height: ActionButtonsBarHeight,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Primary1Color,
  },
  nextButtonLabel: {
    fontSize: ActionButtonLabelFontSize2,
    fontWeight: '500',
    color: WhiteTextColor,
  },
});


export default RoomsListItem;
