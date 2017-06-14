
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
import DropdownMenu from '../dropdown-menu';
import DayView from '../day-view';
import NoDataPlaceholder from '../no-data-placeholder';
import optionsHelper from '../../helpers/options-helper';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';

const { Primary1Color, Secondary1Color } = Theme.Palette;
const { MenuFontSize } = Theme.Font;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class CalendarView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      roomId: undefined,
      bookButtonEnabled: false,
      landscape: false,
    };

    this.getDefaultRoomId = this.getDefaultRoomId.bind(this);
    this.handleRoomChange = this.handleRoomChange.bind(this);
    this.handleUpdateBookButton = this.handleUpdateBookButton.bind(this);
    this.handleBook = this.handleBook.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.initialRoomIdSetFromServerData = false;
  }




  getDefaultRoomId(props) {
    let { propertyId, floor, rooms } = props;
    let currentRoomId = this.state.roomId;

    let propertyFloorRoomsOptions = optionsHelper.getPropertyFloorRoomsOptions(propertyId, floor, rooms);
    let optionsContainCurrentRoomId =
      propertyFloorRoomsOptions.some(item => currentRoomId && item.id === currentRoomId);
    if (optionsContainCurrentRoomId) { return currentRoomId; }

    let optionsFirstRoomId = propertyFloorRoomsOptions[0] && propertyFloorRoomsOptions[0].id;
    return optionsFirstRoomId;
  }




  componentWillReceiveProps(nextProps) {
    let propertyOrFloorChanged = (
      nextProps.propertyId !== this.props.propertyId ||
      nextProps.floor !== this.props.floor
    );

    if (nextProps.dataLoaded) {
      if (!this.initialRoomIdSetFromServerData || propertyOrFloorChanged) {
        this.initialRoomIdSetFromServerData = true;
        let roomId = this.getDefaultRoomId(nextProps);
        if (roomId !== this.state.roomId) { this.setState({ roomId }); }
      }
    }
  }




  convertBookingIntervalToUTC(bookingInterval) {
    return {
      startDateTimeUTC: bookingInterval.startDateTime.clone().tz('UTC'),
      endDateTimeUTC: bookingInterval.endDateTime.clone().tz('UTC'),
      period: bookingInterval.period,
    };
  }




  handleRoomChange(item, index) {
    this.setState({ roomId: item.id })
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

    let { properties, rooms, companies, bookingInterval } = this.props;
    let { roomId } = this.state;
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
    let props = this.props;
    let state = this.state;
    let offline = this.context.isOffline();


    let roomPickerOptions = optionsHelper.getPropertyFloorRoomsOptions(props.propertyId, props.floor, props.rooms);
    let roomPickerSelectedIndex = roomPickerOptions.findIndex(item => item.id === state.roomId);
    if (roomPickerSelectedIndex === -1) { roomPickerSelectedIndex = 0; }

    let roomPicker = (
      <DropdownMenu
        menuItems={roomPickerOptions}
        selectedIndex={roomPickerSelectedIndex}
        disabled={offline}
        onChange={this.handleRoomChange}
        style={styles.roomPicker}
        fontSize={MenuFontSize}
      />
    );


    let menuBar = (
      <View style={styles.menuBar}>
        {roomPicker}
        {props.periodAndDatePickersView}
      </View>
    );


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
      props.dataLoaded && !roomPickerOptions.length ? (
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
          roomId={state.roomId}
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
          disabled: !state.bookButtonEnabled || (props.dataLoaded && !roomPickerOptions.length) || offline,
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
        {menuBar}
        {dayView}
        {actionButtonsBar}
      </View>
    );
  }

}

CalendarView.propTypes = {
  dataLoaded: PropTypes.bool,
  propertyId: PropTypes.string,
  floor: PropTypes.number,
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
  periodAndDatePickersView: PropTypes.element,
  onBookingStartTimeChange: PropTypes.func,
  onPeriodChange: PropTypes.func,
};

CalendarView.contextTypes = {
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
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },
  roomPicker: {
    flex: 1,
  },
});


export default CalendarView;
