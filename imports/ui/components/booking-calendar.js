
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import ActionButtonsBar from './action-buttons-bar';
import dateHelper from '../helpers/date-helper';
import DayView from '../../ui/components/day-view';
import DropdownMenu from './dropdown-menu';
import moment from '../../api/unpackaged-improvements/moment';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { StatusBarColor, TextColor } = Theme.Palette;
const { HeaderFontSize } = Theme.Font;
const { StatusBarHeight } = UISharedConstants;
const { Subscenes } = SharedConstants;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class BookingCalendar extends Component {

  constructor(props) {
    super(props);

    this.convertBookingIntervalToRoomPropertyTimeZone =
      this.convertBookingIntervalToRoomPropertyTimeZone.bind(this);
    this.handleBookingStartTimeChange = this.handleBookingStartTimeChange.bind(this);
    this.handlePeriodChange = this.handlePeriodChange.bind(this);
    this.handleUpdateBookButton = this.handleUpdateBookButton.bind(this);
    this.getBookingIntervalUTC = this.getBookingIntervalUTC.bind(this);
    this.handleBook = this.handleBook.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    let { room, properties } = props;
    this.roomPropertyTimeZone = dateHelper.getRoomPropertyTimeZone(room, properties);

    let bookingInterval =
      this.convertBookingIntervalToRoomPropertyTimeZone(props.bookingIntervalUTC);
    let dateTime = bookingInterval.startDateTime;
    let period = bookingInterval.period;

    this.state = {
      dateTime,
      period,
      bookButtonEnabled: false,
      landscape: false,
    };
  }




  componentWillMount() {
    this.context.navigationTracker.setSubscene();
  }




  componentWillUnmount() {
    this.context.navigationTracker.unsetSubscene();
  }




  convertBookingIntervalToRoomPropertyTimeZone(bookingIntervalUTC) {
    return {
      startDateTime: bookingIntervalUTC.startDateTimeUTC.clone().tz(this.roomPropertyTimeZone),
      endDateTime: bookingIntervalUTC.endDateTimeUTC.clone().tz(this.roomPropertyTimeZone),
      period: bookingIntervalUTC.period,
    };
  }




  handleBookingStartTimeChange(hours, minutes) {
    let dateTime = this.state.dateTime.clone().hours(hours).minutes(minutes);
    this.setState({ dateTime });
  }




  handlePeriodChange(period) {
    this.setState({ period });
  }




  handleUpdateBookButton(bookButtonEnabled) {
    if (bookButtonEnabled !== this.state.bookButtonEnabled) {
      this.setState({ bookButtonEnabled });
    }
  }




  getBookingIntervalUTC() {
    let { dateTime, period } = this.state;
    let startDateTimeUTC = dateTime.clone().tz('UTC');
    let endDateTimeUTC = dateTime.clone().add(period, 'minutes').tz('UTC');

    return { startDateTimeUTC, endDateTimeUTC, period };
  }




  handleBook() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to book while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    let { room, properties, companies } = this.props;

    Actions[Subscenes.BookingDialog]({
      room,
      properties,
      companies,
      bookingIntervalUTC: this.getBookingIntervalUTC(),
    });
  }




  handleClose() {
    Actions.pop();
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let { room, roomBookings } = this.props;
    let { dateTime, period, bookButtonEnabled, landscape } = this.state;


    let statusBar = (
      <StatusBar
        hidden={landscape}
        barStyle='dark-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    let statusBarPlaceholderView = !landscape ? (
      <View style={styles.statusBarPlaceholderView} />
    ) : null;


    let formattedDateTime = (
      dateTime.format('dddd, MMMM Do [at] h:mm a') +
      ' ' + moment.tz(this.roomPropertyTimeZone).zoneAbbr()
    );

    let headerView = (
      <View style={styles.headerView}>
        <Text style={styles.headerText}>
          {`Booking ${room.name} for ${formattedDateTime} for:`}
        </Text>
      </View>
    );


    let dayView = (
      <DayView
        roomId={room._id}
        roomBookings={roomBookings}
        dateTime={dateTime}
        period={period}
        timeZone={this.roomPropertyTimeZone}
        onBookingStartTimeChange={this.handleBookingStartTimeChange}
        onPeriodChange={this.handlePeriodChange}
        updateBookButton={this.handleUpdateBookButton}
      />
    );


    let actionButtonsBar = (
      <ActionButtonsBar
        buttons={[{
          disabled: !bookButtonEnabled,
          label: 'BOOK',
          onPress: this.handleBook,
        }, {
          label: 'CLOSE',
          onPress: this.handleClose,
        }]}
      />
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        style={styles.wrapperView}
      >
        {statusBar}
        {statusBarPlaceholderView}
        {headerView}
        {dayView}
        {actionButtonsBar}
      </View>
    );
  }

}

BookingCalendar.propTypes = {
  room: PropTypes.object.isRequired,
  roomBookings: PropTypes.array.isRequired,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  bookingIntervalUTC: PropTypes.object.isRequired,
};

BookingCalendar.contextTypes = {
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  headerView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 28,
  },
  statusBarPlaceholderView: {
    height: StatusBarHeight,
  },
  headerText: {
    fontSize: HeaderFontSize,
    lineHeight: 36,
    color: TextColor,
    marginBottom: 8,
  },
});


export default BookingCalendar;
