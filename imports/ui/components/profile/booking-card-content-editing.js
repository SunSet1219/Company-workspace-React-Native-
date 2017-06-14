
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Alert,
  Dimensions,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { Duration } from '../snackbar';
import { MKTextField } from '../../material-ui';
import ActionButtonsBar from '../action-buttons-bar';
import dateHelper from '../../helpers/date-helper';
import DateTimePicker from '../date-time-picker';
import DayView from '../day-view';
import DropdownMenu from '../dropdown-menu';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor from 'baryshok-react-native-meteor';
import moment from '../../../api/unpackaged-improvements/moment';
import NoDataPlaceholder from '../no-data-placeholder';
import optionsHelper from '../../helpers/options-helper';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { StatusBarColor, Border1Color, TextColor } = Theme.Palette;
const { StatusBarHeight } = UISharedConstants;
const { Periods } = SharedConstants;

const FontSize = 14;
const PickerViewHeight = FontSize * 2;
const FilterGroupRowHeight = FontSize * 3;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class BookingCardContentEditing extends Component {

  constructor(props) {
    super(props);

    let { booking, properties, rooms } = props;

    let title = booking.title;
    let propertyId = booking.propertyId;
    let roomId = booking.roomId;
    let room = rooms && rooms.find(room => room._id === roomId);
    let roomPropertyTimeZone = dateHelper.getRoomPropertyTimeZone(room, properties);
    let startDate = moment(booking.startDate).tz(roomPropertyTimeZone);
    let endDate = moment(booking.endDate).tz(roomPropertyTimeZone);
    let period = endDate.diff(startDate, 'minutes');
    let attendees = booking.attendees || [];

    this.state = {
      title,
      propertyId,
      roomId,
      period,
      dateTime: startDate,
      landscape: false,
    };

    this.handlePropertyChange = this.handlePropertyChange.bind(this);
    this.handleRoomChange = this.handleRoomChange.bind(this);
    this.handlePeriodChangeFromDropdownMenu = this.handlePeriodChangeFromDropdownMenu.bind(this);
    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.updateBooking = this.updateBooking.bind(this);
    this.handleBookingStartTimeChange = this.handleBookingStartTimeChange.bind(this);
    this.handlePeriodChangeFromDayView = this.handlePeriodChangeFromDayView.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);
  }




  componentWillMount() {
    this.context.navigationTracker.setSubscene();
  }




  componentWillUnmount() {
    this.context.navigationTracker.unsetSubscene();
  }




  handlePropertyChange(item, index) {
    let { rooms } = this.props;
    let propertyId = item.id;
    let roomsOptions = optionsHelper.getPropertyRoomsOptions(propertyId, rooms);
    let roomId = roomsOptions && roomsOptions[0] && roomsOptions[0].id;
    this.setState({ propertyId, roomId });
  }




  handleRoomChange(item, index) {
    this.setState({ roomId: item.id });
  }




  handlePeriodChangeFromDropdownMenu(item, index) {
    let period = item.value;

    if (!period) {
      return setTimeout(() => {
        Alert.alert(
          '',
          'To make a booking for longer than 3 hours please contact us.',
          [{ text: 'OK', onPress: () => {} }]
        );
      }, 100);
    }

    this.setState({ period });
  }




  handleDateTimeChange(dateTime) {
    let minutes = dateTime.minutes();
    let roundedDateTime = dateTime.clone()
      .minutes(minutes > 30 ? (minutes > 45 ? 60 : 30) : (minutes > 15 ? 30 : 0));

    this.setState({ dateTime: roundedDateTime });
  }




  updateBooking() {
    return new Promise((resolve, reject) => {
      let { roomId, dateTime, period } = this.state;

      if (!roomId) {
        let message = 'Selected room does not exist.';
        return resolve(message);
      }

      let startDate = dateTime.clone();
      let endDate = dateTime.clone().add(period, 'minutes');
      if (endDate.isBefore()) {
        let message = 'This date has already passed. Please pick the correct date range.';
        return resolve(message);
      }

      let title = this.state.title.trim();
      if (!title) {
        let message = 'Please enter a title for your booking.';
        return resolve(message);
      }

      let { booking } = this.props;

      let bookingData = {
        title,
        roomId,
        companyId: booking.companyId,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        attendees: booking.attendees,
      };

      Meteor.call('updateBooking', booking._id, bookingData, (error) => {
        if (error) { return reject(error); }
        return resolve();
      });
    });
  }




  handleBookingStartTimeChange(hours, minutes) {
    let dateTime = this.state.dateTime.clone().hours(hours).minutes(minutes);
    this.setState({ dateTime });
  }




  handlePeriodChangeFromDayView(period) {
    this.setState({ period });
  }




  handleSave() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to save changes while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    this.updateBooking().then((message) => {
      if (message) {
        this.context.showSnackbar({
          message,
          duration: Duration.Long,
        });
      } else {
        this.context.showSnackbar({
          message: 'Booking was successfully updated!',
          duration: Duration.Short,
        });
        Actions.pop();
      }
    }, (error) => {
      console.warn('[Error][BookingCardContentEditing.updateBooking]', error);
      this.context.showSnackbar({
        message: error.reason || 'Failed to update booking.',
        duration: Duration.Indefinite,
        button: {
          label: 'CLOSE',
        },
      });
      Actions.pop();
    }).catch((reason) => {
      console.warn('[Error][BookingCardContentEditing.updateBooking]', reason);
    });
  }




  handleCancel() {
    Actions.pop();
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let { booking, properties, rooms } = this.props;
    let { propertyId, roomId, dateTime, period } = this.state;


    let statusBar = (
      <StatusBar
        hidden={this.state.landscape}
        barStyle='dark-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    let statusBarPlaceholderView = !this.state.landscape ? (
      <View style={styles.statusBarPlaceholderView} />
    ) : null;


    let propertyFilterOptions = optionsHelper.getPropertiesOptions(properties);
    let propertyFilterSelectedIndex = propertyFilterOptions.findIndex(item => item.id === propertyId);

    let propertyFilter = (
      <DropdownMenu
        menuItems={propertyFilterOptions}
        selectedIndex={propertyFilterSelectedIndex}
        onChange={this.handlePropertyChange}
        fontSize={FontSize}
        style={styles.dropdownMenuWithRightMargin}
      />
    );


    let roomPickerOptions = optionsHelper.getPropertyRoomsOptions(propertyId, rooms);
    let roomPickerSelectedIndex = roomPickerOptions.findIndex(item => item.id === roomId);
    if (roomPickerSelectedIndex === -1) { roomPickerSelectedIndex = 0; }

    let roomPicker = (
      <DropdownMenu
        menuItems={roomPickerOptions}
        selectedIndex={roomPickerSelectedIndex}
        onChange={this.handleRoomChange}
        style={styles.dropdownMenuWithLeftMargin}
        fontSize={FontSize}
      />
    );


    let invisiblePlaceholderView = (
      <View style={
        this.state.landscape ?
          landscapeStyles.invisiblePlaceholderView :
          portraitStyles.invisiblePlaceholderView
      }/>
    );


    let titleTextInputView = (
      <View style={styles.inputView}>
        <MKTextField
          autoCapitalize='sentences'
          autoCorrect={false}
          editable={true}
          keyboardType='default'
          onTextChange={text => this.setState({ title: text })}
          placeholder='Title'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.title}
          underlineEnabled={true}
          underlineSize={1}
          textInputStyle={styles.textInput}
        />
      </View>
    );


    let datePicker = (
      <DateTimePicker
        initialDateTime={dateTime}
        mode='date'
        onDateTimeChange={this.handleDateTimeChange}
        style={
          this.state.landscape ?
            landscapeStyles.pickerView :
            portraitStyles.pickerViewWithRightMargin
        }
      >
        <Text style={styles.text}>
          {dateTime.format('YYYY-MM-DD')}
        </Text>
      </DateTimePicker>
    );


    let timePicker = (
      <DateTimePicker
        initialDateTime={dateTime}
        mode='time'
        onDateTimeChange={this.handleDateTimeChange}
        style={
          this.state.landscape ?
            landscapeStyles.pickerView :
            portraitStyles.pickerViewWithLeftMargin
        }
      >
        <Text style={styles.text}>
          {dateTime.format('h:mm a z')}
        </Text>
      </DateTimePicker>
    );


    let timePickerWithText = (
      <View style={styles.filterWithTextWrapperView}>
        <Text style={styles.textWithMargin}>
          at
        </Text>
        {timePicker}
      </View>
    );


    let periodSelectedIndex = Periods.findIndex(item => item.value === period);

    let periodDropdownMenu = (
      <DropdownMenu
        menuItems={Periods}
        selectedIndex={periodSelectedIndex}
        onChange={this.handlePeriodChangeFromDropdownMenu}
        fontSize={FontSize}
        style={this.state.landscape ? styles.dropdownMenu : null}
      />
    );


    let periodDropdownMenuWithText = (
      <View style={styles.filterWithTextWrapperView}>
        <Text style={styles.textWithMargin}>
          for
        </Text>
        {periodDropdownMenu}
      </View>
    );


    let dayView = roomPickerOptions.length ? (
      <DayView
        roomsDataLoaded={true}
        roomId={roomId}
        bookingId={booking._id}
        dateTime={dateTime}
        period={period}
        timeZone={dateHelper.getPropertyTimeZone(propertyId, properties)}
        onBookingStartTimeChange={this.handleBookingStartTimeChange}
        onPeriodChange={this.handlePeriodChangeFromDayView}
        editing={true}
      />
    ) : (
      <NoDataPlaceholder
        label={
          this.state.landscape ?
            'No rooms available for this time and duration' :
            'No rooms available\nfor this time and duration'
        }
        style={styles.noDataPlaceholder}
      />
    );


    let actionButtonsBar = (
      <ActionButtonsBar
        buttons={[{
          label: 'SAVE',
          onPress: this.handleSave,
        }, {
          label: 'CANCEL',
          onPress: this.handleCancel,
        }]}
      />
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          return false;
        }}
        style={styles.wrapperView}
      >
        {statusBar}
        {statusBarPlaceholderView}
        <View style={styles.filterWrapperView}>
          <View style={
            this.state.landscape ?
              landscapeStyles.locationFilterGroupView :
              portraitStyles.locationFilterGroupView
          }>
            {propertyFilter}
            {roomPicker}
            {invisiblePlaceholderView}
          </View>
          {titleTextInputView}
          {
            this.state.landscape ? (
              <View style={landscapeStyles.dateFilterGroupView}>
                {datePicker}
                {timePickerWithText}
                {periodDropdownMenuWithText}
              </View>
            ) : (
              <View style={portraitStyles.dateFilterGroupView}>
                <View style={styles.rowView}>
                  {datePicker}
                  {timePicker}
                </View>
                {periodDropdownMenu}
              </View>
            )
          }
        </View>
        {dayView}
        {actionButtonsBar}
      </View>
    );
  }

}

BookingCardContentEditing.propTypes = {
  booking: PropTypes.object,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  rooms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

BookingCardContentEditing.contextTypes = {
  showSnackbar: PropTypes.func,
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const portraitStyles = StyleSheet.create({
  locationFilterGroupView: {
    height: FilterGroupRowHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateFilterGroupView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 16,
  },
  invisiblePlaceholderView: {
    flex: 0,
  },
  pickerViewWithRightMargin: {
    height: PickerViewHeight,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
    marginBottom: 16,
    marginRight: 12,
  },
  pickerViewWithLeftMargin: {
    height: PickerViewHeight,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
    marginBottom: 16,
    marginLeft: 12,
  },
});


const landscapeStyles = StyleSheet.create({
  locationFilterGroupView: {
    height: FilterGroupRowHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateFilterGroupView: {
    height: FilterGroupRowHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  invisiblePlaceholderView: {
    flex: 1,
  },
  pickerView: {
    flex: 4,
    height: PickerViewHeight,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
  },
});


const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  filterWrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 14,
    paddingBottom: 28,
    paddingHorizontal: 28,
  },
  statusBarPlaceholderView: {
    height: StatusBarHeight,
  },
  dropdownMenu: {
    flex: 1,
  },
  dropdownMenuWithRightMargin: {
    flex: 1,
    marginRight: 12,
  },
  dropdownMenuWithLeftMargin: {
    flex: 1,
    marginLeft: 12,
  },
  text: {
    fontSize: FontSize,
    color: TextColor,
  },
  textWithMargin: {
    fontSize: FontSize,
    color: TextColor,
    marginHorizontal: 20,
  },
  filterWithTextWrapperView: {
    flex: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  inputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  textInputView: {
    height: 30,
  },
  textInput: {
    fontSize: FontSize,
    color: TextColor,
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  noDataPlaceholder: {
    flex: 1,
  },
});


export default BookingCardContentEditing;
