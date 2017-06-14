
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Platform,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import _ from 'underscore';
import { Actions } from 'react-native-router-flux';
import { MKSpinner } from '../material-ui';
import BookingDetails from '../components/booking/booking-details';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import NoDataPlaceholder from '../components/no-data-placeholder';
import RoomsListItem from '../components/booking/rooms-list-item';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { Canvas1Color, TextColor } = Theme.Palette;
const { HeaderFontSize } = Theme.Font;
const { LoadingSpinnerSize } = UISharedConstants;
const { Periods, Subscenes } = SharedConstants;




class Rooms extends Component {

  constructor(props) {
    super(props);

    this.state = {
      period: Periods[0].value,
      roomId: undefined,
      booking: {},
      bookingDetailsVisible: false,
    };

    this.getBookingIntervalUTC = this.getBookingIntervalUTC.bind(this);
    this.handlePeriodChange = this.handlePeriodChange.bind(this);
    this.handleRoomSelect = this.handleRoomSelect.bind(this);
    this.gotoBookingDialog = this.gotoBookingDialog.bind(this);
    this.showBookingDetails = this.showBookingDetails.bind(this);
    this.hideBookingDetails = this.hideBookingDetails.bind(this);
  }




  getBookingIntervalUTC() {
    const { dateTime } = this.props;
    const { period } = this.state;
    const startDateTimeUTC = dateTime.clone().tz('UTC');
    const endDateTimeUTC = dateTime.clone().add(period, 'minutes').tz('UTC');
    return { startDateTimeUTC, endDateTimeUTC, period };
  }




  handlePeriodChange(period) {
    this.setState({ period });
  }




  handleRoomSelect(roomId) {
    if (roomId !== this.state.roomId) {
      this.setState({ roomId });
    }
  }




  gotoBookingDialog() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to book while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    const { rooms, properties, companies } = this.props;
    const room = rooms.find(room => room._id === this.state.roomId);
    const bookingIntervalUTC = this.getBookingIntervalUTC();

    Actions[Subscenes.BookingDialog]({
      room,
      properties,
      companies,
      bookingIntervalUTC,
    });
  }




  showBookingDetails(booking) {
    this.setState({
      booking,
      bookingDetailsVisible: true,
    });
  }




  hideBookingDetails() {
    this.setState({
      booking: {},
      bookingDetailsVisible: false,
    });
  }




  render() {
    const { props, state } = this;


    if (!props.bookingsDataLoaded) {
      return (
        <View style={styles.placeholderView}>
          <SingleColorSpinner />
        </View>
      );
    }


    const sections = _.chain(props.rooms)
      .groupBy(room => (room.location && room.location.floor))
      .map((rooms, floor) => ({ key: floor, data: rooms }))
      .value();


    const ListHeaderComponent = (props) => {
      return !sections.length ? (
        <NoDataPlaceholder
          label={'No rooms available\nfor this time and duration'}
          style={styles.noDataPlaceholder}
        />
      ) : null;
    };


    const renderSectionHeader = ({ section }) => (
      <View style={styles.sectionHeaderView}>
        <Text style={styles.sectionHeaderText}>
          Floor {section.key}
        </Text>
      </View>
    );


    const renderItem = ({ item }) => (
      <RoomsListItem
        room={item}
        propertyTimeZone={props.propertyTimeZone}
        dateTime={props.dateTime}
        onTimeChange={props.onTimeChange}
        period={state.period}
        onPeriodChange={this.handlePeriodChange}
        selected={Boolean(state.roomId && item._id === state.roomId)}
        onSelect={this.handleRoomSelect}
        bookings={props.bookings}
        onShowBookingDetails={this.showBookingDetails}
        user={props.user}
        onNextButtonPress={this.gotoBookingDialog}
      />
    );


    const bookingDetails = state.bookingDetailsVisible ? (
      <BookingDetails
        visible={state.bookingDetailsVisible}
        booking={state.booking}
        users={props.users}
        rooms={props.rooms}
        properties={props.properties}
        propertyTimeZone={props.propertyTimeZone}
        onRequestClose={this.hideBookingDetails}
      />
    ) : null;


    return (
      <View style={styles.wrapperView}>
        <SectionList
          initialNumToRender={4}
          keyExtractor={item => item._id}
          ListHeaderComponent={ListHeaderComponent}
          //renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          sections={sections}
          stickySectionHeadersEnabled={Platform.OS === 'ios'}
        />
        {bookingDetails}
      </View>
    );
  }

}

Rooms.propTypes = {
  roomsDataLoaded: PropTypes.bool.isRequired,
  propertyTimeZone: PropTypes.string.isRequired,
  dateTime: PropTypes.object.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  roomIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.object.isRequired,
  bookingsDataLoaded: PropTypes.bool.isRequired,
  bookings: PropTypes.arrayOf(PropTypes.object).isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

Rooms.contextTypes = {
  isOffline: PropTypes.func,
  showToast: PropTypes.func,
};




const styles = StyleSheet.create({
  placeholderView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: LoadingSpinnerSize,
    height: LoadingSpinnerSize,
  },
  wrapperView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  noDataPlaceholder: {
    flex: 1,
  },
  sectionHeaderView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: Canvas1Color,
  },
  sectionHeaderText: {
    fontSize: HeaderFontSize,
    fontWeight: '500',
    color: TextColor,
  },
});

const SingleColorSpinner = MKSpinner.singleColorSpinner()
  .withStyle(styles.loadingSpinner)
  .build();




export default createContainer(props => {
  if (!props.roomsDataLoaded) {
    return {
      bookingsDataLoaded: false,
      bookings: [],
      users: [],
    };
  }

  if (!Meteor.userId()) {
    return {
      bookingsDataLoaded: true,
      bookings: [],
      users: [],
    };
  }

  const { roomIds, dateTime } = props;

  const subscriptionHandle = Meteor.subscribe('roomsDashboardBookings', dateTime.format('YYYY-MM-DD'), 'day', roomIds);

  const startDate = dateTime.clone().hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
  const endDate = dateTime.clone().hours(23).minutes(59).seconds(59).milliseconds(999).toDate();

  return {
    bookingsDataLoaded: subscriptionHandle.ready(),
    bookings: Meteor.collection('bookings').find({
      $or: [
        { startDate: { $gte: startDate, $lt: endDate }},
        { endDate: { $gt: startDate, $lte: endDate }},
        { startDate: { $lte: startDate }, endDate: { $gte: endDate }},
      ],
    }),
    users: Meteor.collection('users').find(),
  };
}, Rooms);
