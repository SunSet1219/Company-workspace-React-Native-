
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import ActionButtonsBar from '../action-buttons-bar';
import dateHelper from '../../helpers/date-helper';
import DayView from '../day-view';
import NoDataPlaceholder from '../no-data-placeholder';
import optionsHelper from '../../helpers/options-helper';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';

const { Primary1Color, Secondary1Color } = Theme.Palette;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class CalendarView4 extends Component {

  constructor(props) {
    super(props);

    this.state = {
      bookButtonEnabled: false,
      landscape: false,
    };

    this.handleUpdateBookButton = this.handleUpdateBookButton.bind(this);
    this.handleBook = this.handleBook.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);
  }




  convertBookingIntervalToUTC(bookingInterval) {
    return {
      startDateTimeUTC: bookingInterval.startDateTime.clone().tz('UTC'),
      endDateTimeUTC: bookingInterval.endDateTime.clone().tz('UTC'),
      period: bookingInterval.period,
    };
  }




  handleUpdateBookButton(bookButtonEnabled) {
    if (bookButtonEnabled !== this.state.bookButtonEnabled) {
      this.setState({ bookButtonEnabled });
    }
  }




  handleBook() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to book while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    let { roomId, properties, rooms, companies, bookingInterval } = this.props;
    let room = rooms && rooms.find(room => room._id === roomId);

    Actions[SharedConstants.Subscenes.BookingDialog]({
      room,
      properties,
      companies,
      bookingIntervalUTC: this.convertBookingIntervalToUTC(bookingInterval),
    });
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let { props, context, state } = this;
    let offline = context.isOffline();


    let dayView = offline ? (
      <NoDataPlaceholder
        label={
          this.state.landscape ?
            'Booking not available while in Offline mode' :
            'Booking not available\nwhile in Offline mode'
        }
        style={styles.noDataPlaceholder}
      />
    ) : (
      props.dataLoaded && !props.roomId ? (
        <NoDataPlaceholder
          label={
            this.state.landscape ?
              'No rooms available for this time and duration' :
              'No rooms available\nfor this time and duration'
          }
          style={styles.noDataPlaceholder}
        />
      ) : (
        <DayView
          roomsDataLoaded={props.dataLoaded}
          roomId={props.roomId}
          dateTime={props.bookingInterval.startDateTime}
          period={props.bookingInterval.period}
          timeZone={dateHelper.getPropertyTimeZone(props.propertyId, props.properties)}
          onBookingStartTimeChange={props.onBookingStartTimeChange}
          onPeriodChange={props.onPeriodChange}
          updateBookButton={this.handleUpdateBookButton}
          editing={true}
        />
      )
    );


    let actionButtonsBar = (
      <ActionButtonsBar
        buttons={[{
          disabled: !state.bookButtonEnabled || (props.dataLoaded && !props.roomId) || offline,
          label: 'BOOK',
          onPress: this.handleBook,
          style: { backgroundColor: offline ? Secondary1Color : Primary1Color },
        }]}
      />
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        style={styles.wrapperView}
      >
        {dayView}
        {actionButtonsBar}
      </View>
    );
  }

}

CalendarView4.propTypes = {
  dataLoaded: PropTypes.bool,
  propertyId: PropTypes.string,
  floor: PropTypes.number,
  roomId: PropTypes.string,
  bookingInterval: PropTypes.object,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  rooms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  onBookingStartTimeChange: PropTypes.func,
  onPeriodChange: PropTypes.func,
};

CalendarView4.contextTypes = {
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  noDataPlaceholder: {
    flex: 1,
  },
});


export default CalendarView4;
