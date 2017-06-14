
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BookingAppBar from '../components/booking/booking-app-bar';
import DateTimePicker from '../components/date-time-picker';
import dateHelper from '../helpers/date-helper';
import db from '../../api/db/realm-db';
import LocationPicker from '../components/booking/location-picker-new';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import moment from '../../api/unpackaged-improvements/moment';
import optionsHelper from '../helpers/options-helper';
import RoomsContainer from './rooms-container-5';
import SegmentedControl from '../components/segmented-control';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';

const { Canvas6Color, StatusBarColorNew } = Theme.Palette;
const { Scenes } = SharedConstants;

const BookingDates = {
  Today: 'TODAY',
  Tomorrow: 'TOMORROW',
  PickDate: 'PICK A DATE',
};




class Booking extends Component {

  constructor(props) {
    super(props);

    this.state = {
      propertyId: undefined,
      dateTime: this.getDefaultDateTime(SharedConstants.propertiesTimeZone),
      bookingDateBarSelectedIndex: 0,
    };

    this.handlePropertyChange = this.handlePropertyChange.bind(this);
    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.renderLocationPicker = this.renderLocationPicker.bind(this);
    this.renderBookingDateBar = this.renderBookingDateBar.bind(this);
    this.handleBookingDateBarSelect = this.handleBookingDateBarSelect.bind(this);

    this.initialPropertySetFromServerData = false;
    this.publicationDataProcessedAgainstLocalDB = false;
    this.propertyRooms = [];
    this.propertyTimeZone = SharedConstants.propertiesTimeZone;
  }




  componentDidMount() {
    this.context.showNavigationBar();
  }




  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => {
        return resolve(position);
      }, error => {
        console.log('[Error][BookingContainer.getCurrentPosition]', error);
        return resolve();
      }, {
        enableHighAccuracy: false,
        timeout: 4 * 1000,
        maximumAge: 10 * 60 * 1000,
      });
    });
  }




  getClosestPropertyId(position, properties) {
    if (!position || !properties || !properties.length) { return; }

    const { latitude, longitude } = position.coords || {};
    if (!latitude || !longitude) { return; }

    const property = optionsHelper.getClosestProperty(latitude, longitude, properties);
    const propertyId = property && property._id;
    return propertyId;
  }




  getUserCompanyPropertyId(props) {
    const { user, companies } = props;
    const companyId = user.companies && user.companies[0] && user.companies[0].companyId;
    const company = companyId && companies.find(company => company._id === companyId);
    const property = company && company.properties && company.properties[0];
    const propertyId = property && property.propertyId;
    return propertyId;
  }




  getDefaultDateTime(defaultTimeZone) {
    const now = moment().tz(defaultTimeZone).seconds(0).milliseconds(0);
    const minutes = now.minutes();
    const dateTime = now.minutes(minutes > 30 ? (minutes > 45 ? 60 : 30) : (minutes > 15 ? 30 : 0));
    return dateTime;
  }




  getPropertyRooms(propertyId, rooms) {
    if (!rooms) { return []; }

    const propertyRooms = [];
    rooms.forEach(room => {
      if (!propertyId || room.propertyId === propertyId) { propertyRooms.push(room); }
    });

    return propertyRooms;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(Scenes.Booking);
  }




  async componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded || this.context.isOffline()) {
      if (!this.initialPropertySetFromServerData) {
        this.initialPropertySetFromServerData = true;

        // TO DO: implement storing of 'knoteler' flag in LocalDB.
        // If not 'knoteler', set location with getUserCompanyPropertyId method only.
        const position = await this.getCurrentPosition();
        const propertyId = position ?
          this.getClosestPropertyId(position, nextProps.properties) :
          this.getUserCompanyPropertyId(nextProps);

        const { rooms, properties } = nextProps;
        this.propertyRooms = this.getPropertyRooms(propertyId, rooms);
        this.propertyTimeZone = dateHelper.getPropertyTimeZone(propertyId, properties);
        this.setState({ propertyId });
      }
    }

    if (nextProps.dataLoaded && !this.publicationDataProcessedAgainstLocalDB) {
      const { rooms, properties } = nextProps;
      this.publicationDataProcessedAgainstLocalDB = db.add({ rooms, properties });
    }
  }




  handlePropertyChange(item, index) {
    const propertyId = item.id;
    const { rooms, properties } = this.props;
    this.propertyRooms = this.getPropertyRooms(propertyId, rooms);
    this.propertyTimeZone = dateHelper.getPropertyTimeZone(propertyId, properties);
    this.setState({ propertyId });
  }




  handleDateTimeChange(dateTime) {
    this.pickDateButtonLabel = dateTime.format('MMM D, YYYY').toUpperCase();
    this.setState({ dateTime });
  }




  handleTimeChange(hour, minute) {
    const dateTime = this.state.dateTime.clone().hour(hour).minute(minute);
    this.setState({ dateTime })
  }




  renderLocationPicker() {
    const { props, state, context } = this;
    const offline = context.isOffline();
    const options = props.dataLoaded ? optionsHelper.getPropertiesOptionsWithAddressLine(props.properties, false) : [];
    const selectedIndex = options.findIndex(item => item.id === state.propertyId);

    return (
      <LocationPicker
        disabled={offline}
        menuItems={options}
        onChange={this.handlePropertyChange}
        selectedIndex={selectedIndex}
      />
    );
  }




  renderBookingDateBar() {
    const { state } = this;

    const bookingDateBarItems = [
      { label: BookingDates.Today },
      { label: BookingDates.Tomorrow },
      { label: this.pickDateButtonLabel || BookingDates.PickDate }
    ];

    const pickDateButton = (
      <DateTimePicker
        ref={ref => { this.dateTimePicker = ref; }}
        initialDateTime={state.dateTime}
        mode='date'
        onDateTimeChange={this.handleDateTimeChange}
      />
    );

    return (
      <View>
        <SegmentedControl
          items={bookingDateBarItems}
          onSelect={this.handleBookingDateBarSelect}
          selectedIndex={state.bookingDateBarSelectedIndex}
        />
        {pickDateButton}
      </View>
    );
  }




  handleBookingDateBarSelect(item, index) {
    if (this.context.isOffline()) { return false; }

    if (
      index === this.state.bookingDateBarSelectedIndex &&
      index !== Object.keys(BookingDates).findIndex(key => BookingDates[key] === BookingDates.PickDate)
    ) { return; }


    const defaultTimeZone = SharedConstants.propertiesTimeZone;
    const currentDateTime = this.getDefaultDateTime(defaultTimeZone);

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
        this.dateTimePicker && this.dateTimePicker.showPickerModal();
    }

    this.setState(nextState);
  }




  render() {
    const { props, state } = this;


    const statusBar = (
      <StatusBar
        barStyle='dark-content'
        backgroundColor={StatusBarColorNew}
        hidden={false}
        translucent={true}
      />
    );


    const appBar = (
      <BookingAppBar>
        {this.renderLocationPicker()}
        {this.renderBookingDateBar()}
      </BookingAppBar>
    );


    const roomsContainer = (
      <RoomsContainer
        roomsDataLoaded={props.dataLoaded}
        propertyTimeZone={this.propertyTimeZone}
        dateTime={state.dateTime}
        onTimeChange={this.handleTimeChange}
        roomIds={this.propertyRooms.map(room => room._id)}
        rooms={this.propertyRooms}
        user={props.user}
        companies={props.companies}
        properties={props.properties}
      />
    );


    return (
      <View style={styles.wrapperView}>
        {statusBar}
        {appBar}
        {roomsContainer}
      </View>
    );
  }

}

Booking.propTypes = {
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

Booking.contextTypes = {
  navigationTracker: PropTypes.object,
  isOffline: PropTypes.func,
  showNavigationBar: PropTypes.func,
};



const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    backgroundColor: Canvas6Color,
  },
});




export default createContainer(() => {
  const user = Meteor.user();
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
}, Booking);
