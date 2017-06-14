
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import CalendarView from '../components/booking/calendar-view-4';
import dateHelper from '../helpers/date-helper';
import DateTimePicker from '../components/date-time-picker';
import db from '../../api/db/realm-db';
import LocationPickerMenu from '../components/booking/location-picker-menu';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import moment from '../../api/unpackaged-improvements/moment';
import NavigationBar from '../components/navigation-bar';
import optionsHelper from '../helpers/options-helper';
import RoomCard from '../components/booking/room-card';
import RoomsChanger from '../components/booking/rooms-changer';
import SharedConstants from '../../api/constants/shared';
import TabBar from '../components/booking/tab-bar';
import Theme from '../theme';

const { StatusBarColor, Canvas1Color } = Theme.Palette;
const { Periods, Scenes } = SharedConstants;

const BookingDates = {
  Today: 'Today',
  Tomorrow: 'Tomorrow',
  PickDate: 'Pick Date',
};

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
  LongSide: Math.max(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class Booking4 extends Component {

  constructor(props) {
    super(props);

    this.state = {
      propertyId: this.getUserPropertyId(props),
      floor: undefined,
      propertyFloorRooms: [],
      roomId: undefined,
      dateTime: this.getDefaultDateTime(SharedConstants.propertiesTimeZone),
      period: Periods[0].value,
      bookingDateBarSelectedIndex: 0,
      landscape: false,
    };

    this.getBookingInterval = this.getBookingInterval.bind(this);
    this.handlePropertyChange = this.handlePropertyChange.bind(this);
    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleBookingStartTimeChange = this.handleBookingStartTimeChange.bind(this);
    this.handlePeriodChange = this.handlePeriodChange.bind(this);
    this.handleBookingDateBarSelect = this.handleBookingDateBarSelect.bind(this);
    this.handleRoomChange = this.handleRoomChange.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.initialPropertyAndFloorSetFromServerData = false;
    this.publicationDataProcessedAgainstLocalDB = false;
    this.roomsChanger = null;
  }




  getUserPropertyId(props) {
    let propertyUse = props.user.propertyUse;
    let userPropertyId = propertyUse && propertyUse[0] && propertyUse[0].propertyId;
    return userPropertyId;
  }




  getDefaultDateTime(defaultTimeZone) {
    let now = moment().tz(defaultTimeZone).seconds(0).milliseconds(0);
    let minutes = now.minutes();
    let dateTime = now.minutes(minutes > 30 ? (minutes > 45 ? 60 : 30) : (minutes > 15 ? 30 : 0));
    return dateTime;
  }




  getBookingInterval() {
    let { propertyId, dateTime, period } = this.state;
    let { properties } = this.props;
    let propertyTimeZone = dateHelper.getPropertyTimeZone(propertyId, properties);
    let startDateTime = dateTime.clone().tz(propertyTimeZone);
    let endDateTime = dateTime.clone().tz(propertyTimeZone).add(period, 'minutes');
    return { startDateTime, endDateTime, period };
  }




  getPropertyFloorRooms(propertyId, floor, rooms) {
    if (!rooms) { return []; }

    let filterRoomsForPropertyAndFloor = (room) => {
      let matchesPropertyIfDefined = !propertyId || room.propertyId === propertyId;
      let matchesFloorIfDefined = (
        !floor ||
        !room.location ||
        !room.location.floor ||
        room.location.floor === floor
      );
      return matchesPropertyIfDefined && matchesFloorIfDefined;
    };

    let propertyFloorRooms = [];
    rooms.forEach(room => {
      if (filterRoomsForPropertyAndFloor(room)) { propertyFloorRooms.push(room); }
    });

    return propertyFloorRooms;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(Scenes.Booking);
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded || this.context.isOffline()) {
      if (!this.initialPropertyAndFloorSetFromServerData) {
        this.initialPropertyAndFloorSetFromServerData = true;
        let nextState = {};

        let { propertyId, floor } = this.getUserCompanyPropertyAndFloor(nextProps);
        if (propertyId !== undefined) { nextState.propertyId = propertyId; }
        nextState.floor = floor;

        let propertyFloorRooms = this.getPropertyFloorRooms(propertyId, floor, nextProps.rooms);
        nextState.propertyFloorRooms = propertyFloorRooms;

        let roomId = propertyFloorRooms[0] && propertyFloorRooms[0]._id;
        nextState.roomId = roomId;

        this.setState(nextState);
      }
    }

    if (nextProps.dataLoaded && !this.publicationDataProcessedAgainstLocalDB) {
      let { rooms, properties } = nextProps;
      this.publicationDataProcessedAgainstLocalDB = db.add({ rooms, properties });
    }
  }




  getUserCompanyPropertyAndFloor(props) {
    let { user, companies, properties } = props;
    let companyId = user && user.companies && user.companies[0] && user.companies[0].companyId;
    let company = companyId && companies.find(company => company._id === companyId);
    let property = company && company.properties && company.properties[0];
    let propertyId = property && property.propertyId;
    let floor = property && property.floors && property.floors[0];
    return { propertyId, floor };
  }




  handlePropertyChange(item, index) {
    let propertyId = item.id;
    let floor = undefined;
    let { rooms } = this.props;

    let propertyFloorRooms = this.getPropertyFloorRooms(propertyId, floor, rooms);
    let roomId = propertyFloorRooms[0] && propertyFloorRooms[0]._id;

    this.roomsChanger && this.roomsChanger.setPage(0);

    this.setState({ propertyId, floor, propertyFloorRooms, roomId });
  }




  handleDateTimeChange(dateTime) {
    this.pickDateButtonLabel = dateTime.format('MMM D, YYYY');
    this.setState({ dateTime });
  }




  handleBookingStartTimeChange(hours, minutes) {
    let dateTime = this.state.dateTime.clone().hours(hours).minutes(minutes);
    this.setState({ dateTime });
  }




  handlePeriodChange(period) {
    this.setState({ period });
  }




  handleBookingDateBarSelect(item, index) {
    if (
      index === this.state.bookingDateBarSelectedIndex &&
      index !== Object.keys(BookingDates).findIndex(key => BookingDates[key] === BookingDates.PickDate)
    ) { return; }


    let defaultTimeZone = SharedConstants.propertiesTimeZone;
    let currentDateTime = this.getDefaultDateTime(defaultTimeZone);

    let nextState = { bookingDateBarSelectedIndex: index };

    switch (item.label) {
      case BookingDates.Today:
        this.pickDateButtonLabel = '';
        nextState.dateTime = currentDateTime;
        break;

      case BookingDates.Tomorrow:
        this.pickDateButtonLabel = '';
        nextState.dateTime = currentDateTime.add(1, 'days');
        break;

      default:
        this.dateTimePicker && this.dateTimePicker.onDateTimePickerPress();
    }

    this.setState(nextState);
  }




  handleRoomChange(roomId) {
    this.setState({ roomId });
  };




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let { props, state } = this;
    let offline = this.context.isOffline();


    let statusBar = (
      <StatusBar
        hidden={state.landscape}
        barStyle='light-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    let locationPickerOptions = optionsHelper.getPropertiesOptions(props.properties, true);
    let locationPickerSelectedIndex = locationPickerOptions.findIndex(item => item.id === state.propertyId);
    if (locationPickerSelectedIndex === -1) { locationPickerSelectedIndex = 0; }

    let locationPickerMenu = (
      <LocationPickerMenu
        disabled={offline}
        menuItems={locationPickerOptions}
        onChange={this.handlePropertyChange}
        selectedIndex={locationPickerSelectedIndex}
      />
    );


    let navigationBar = !state.landscape ? (
      <NavigationBar
        title='Booking 0.4'
        toggle={locationPickerMenu}
      />
    ) : null;


    let pickDateButton = (
      <DateTimePicker
        ref={ref => this.dateTimePicker = ref}
        initialDateTime={state.dateTime}
        mode='date'
        onDateTimeChange={this.handleDateTimeChange}
      />
    );


    let bookingDateBarItems = [
      { label: BookingDates.Today },
      { label: BookingDates.Tomorrow },
      { label: this.pickDateButtonLabel || BookingDates.PickDate }
    ];

    let bookingDateBar = !state.landscape ? (
      <TabBar
        disabled={offline}
        items={bookingDateBarItems}
        selectedIndex={state.bookingDateBarSelectedIndex}
        onSelect={this.handleBookingDateBarSelect}
      />
    ) : null;


    let roomsChanger = props.dataLoaded || offline ? (
      <RoomsChanger
        ref={ref => this.roomsChanger = ref}
        rooms={this.state.propertyFloorRooms}
        onChange={this.handleRoomChange}
      />
    ) : null;


    let calendarView = (
      <CalendarView
        dataLoaded={props.dataLoaded}
        propertyId={state.propertyId}
        floor={state.floor}
        roomId={state.roomId}
        bookingInterval={this.getBookingInterval()}
        properties={props.properties}
        rooms={props.rooms}
        companies={props.companies}
        onBookingStartTimeChange={this.handleBookingStartTimeChange}
        onPeriodChange={this.handlePeriodChange}
      />
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        style={styles.wrapperView}
      >
        {statusBar}
        {navigationBar}
        {bookingDateBar}
        {pickDateButton}
        {roomsChanger}
        {calendarView}
      </View>
    );
  }

}

Booking4.propTypes = {
  dataLoaded: PropTypes.bool,
  user: PropTypes.object,
  rooms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

Booking4.contextTypes = {
  navigationTracker: PropTypes.object,
  isOffline: PropTypes.func,
};



const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    backgroundColor: Canvas1Color,
  },
});




export default createContainer(() => {
  let user = Meteor.user();
  if (!user) {
    return {
      dataLoaded: false,
      user: db.getCurrentUser() || {},
      rooms: db.getRooms(),
      companies: db.getCompanies(),
      properties: db.getPublishedProperties(),
    };
  }

  const subscriptionHandle = Meteor.subscribe('roomsDashboardCollections');

  return {
    dataLoaded: subscriptionHandle.ready(),
    user,
    rooms: Meteor.collection('rooms').find(),
    companies: Meteor.collection('companies').find(),
    properties: Meteor.collection('properties').find(),
  };
}, Booking4);
