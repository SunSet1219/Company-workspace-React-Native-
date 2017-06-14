
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Alert,
  Dimensions,
  LayoutAnimation,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CalendarSearchModesToggle from '../components/booking/calendar-search-modes-toggle';
import CalendarView from '../components/booking/calendar-view';
import dateHelper from '../helpers/date-helper';
import DateTimePicker from '../components/date-time-picker';
import db from '../../api/db/realm-db';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import ModalRadioButtonPicker from '../components/modal-radio-button-picker';
import moment from '../../api/unpackaged-improvements/moment';
import NavigationBar from '../components/navigation-bar';
import optionsHelper from '../helpers/options-helper';
import OverflowMenu from '../components/overflow-menu';
import PickerMenu from '../components/picker-menu';
import SearchView from '../components/booking/search-view';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';

const { StatusBarColor, Canvas1Color, Primary1Color, Secondary1Color } = Theme.Palette;
const { MenuFontSize } = Theme.Font;
const { Periods, Scenes } = SharedConstants;

const ModalRadioButtonPickerModes = {
  Location: 'location',
  Floor: 'floor',
};

const OverflowMenuItems = Object.keys(ModalRadioButtonPickerModes).map(key => ({
  option: ModalRadioButtonPickerModes[key],
  label: `Change ${ModalRadioButtonPickerModes[key]}`,
}));

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class BookingNew extends Component {

  constructor(props) {
    super(props);

    let propertyId = this.getUserPropertyId(props);
    let defaultTimeZone = SharedConstants.propertiesTimeZone;
    let dateTime = this.getDefaultDateTime(defaultTimeZone);
    let period = Periods[0].value;

    this.state = {
      propertyId,
      floor: undefined,
      dateTime,
      period,
      searchMode: false,
      showModalRadioButtonPicker: false,
      landscape: false,
    };

    this.toggleCalendarSearchModes = this.toggleCalendarSearchModes.bind(this);
    this.handleOverflowMenuSelect = this.handleOverflowMenuSelect.bind(this);
    this.renderModalRadioButtonPicker = this.renderModalRadioButtonPicker.bind(this);
    this.handlePeriodChangeFromPickerMenu = this.handlePeriodChangeFromPickerMenu.bind(this);
    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleBookingStartTimeChange = this.handleBookingStartTimeChange.bind(this);
    this.handlePeriodChangeFromDayView = this.handlePeriodChangeFromDayView.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.modalRadioButtonPickerMode = ModalRadioButtonPickerModes.Location;
    this.initialPropertyAndFloorSetFromServerData = false;
    this.publicationDataProcessedAgainstLocalDB = false;
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




  getUserPropertyId(props) {
    let propertyUse = props.user.propertyUse;
    let userPropertyId = propertyUse && propertyUse[0] && propertyUse[0].propertyId;
    return userPropertyId;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(Scenes.Booking);
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded) {
      if (!this.initialPropertyAndFloorSetFromServerData) {
        this.initialPropertyAndFloorSetFromServerData = true;
        let nextState = {};
        let { propertyId, floor } = this.getUserCompanyPropertyAndFloor(nextProps);
        if (propertyId !== undefined) { nextState.propertyId = propertyId; }
        if (floor !== undefined) { nextState.floor = floor; }
        this.setState(nextState);
      }

      if (!this.publicationDataProcessedAgainstLocalDB) {
        let { rooms, properties } = nextProps;
        this.publicationDataProcessedAgainstLocalDB = db.add({ rooms, properties });
      }
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




  toggleCalendarSearchModes() {
    let animationConfig = LayoutAnimation.create(
      120,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    );
    LayoutAnimation.configureNext(animationConfig);
    this.setState({ searchMode: !this.state.searchMode });
  }




  handleOverflowMenuSelect(item) {
    this.modalRadioButtonPickerMode = item.option;
    this.setState({ showModalRadioButtonPicker: true });
  }




  renderModalRadioButtonPicker() {
    let { properties, rooms } = this.props;
    let { propertyId, floor, showModalRadioButtonPicker } = this.state;
    let items, initialSelectedIndex, handleSubmit;

    if (!showModalRadioButtonPicker) { return null; }

    switch (this.modalRadioButtonPickerMode) {
      case ModalRadioButtonPickerModes.Location: {
        items = optionsHelper.getPropertiesOptions(properties, true);
        let selectedItemIndex = items.findIndex(item => item.id === propertyId);
        initialSelectedIndex = selectedItemIndex !== -1 ? selectedItemIndex : items.length - 1;
        handleSubmit = (item) => {
          this.setState({
            propertyId: item.id,
            floor: undefined,
            showModalRadioButtonPicker: false,
          });
        };
        break;
      }

      case ModalRadioButtonPickerModes.Floor: {
        items = optionsHelper.getPropertyFloorsOptions(propertyId, rooms, true);
        let selectedItemIndex = items.findIndex(item => item.floor === floor);
        initialSelectedIndex = selectedItemIndex !== -1 ? selectedItemIndex : items.length - 1;
        handleSubmit = (item) => {
          this.setState({
            floor: item.floor,
            showModalRadioButtonPicker: false,
          });
        };
        break;
      }

      default:
        let source = 'BookingNew.renderModalRadioButtonPicker';
        console.warn(`[Error][${source}] - case default`, this.modalRadioButtonPickerMode);
    }

    return (
      <ModalRadioButtonPicker
        title={`Select ${this.modalRadioButtonPickerMode}`}
        items={items}
        initialSelectedIndex={initialSelectedIndex}
        onCancel={() => this.setState({ showModalRadioButtonPicker: false })}
        onSubmit={handleSubmit}
        visible={showModalRadioButtonPicker}
      />
    );
  }




  handlePeriodChangeFromPickerMenu(item, index) {
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
    this.setState({ dateTime });
  }




  handleBookingStartTimeChange(hours, minutes) {
    let dateTime = this.state.dateTime.clone().hours(hours).minutes(minutes);
    this.setState({ dateTime });
  }




  handlePeriodChangeFromDayView(period) {
    this.setState({ period });
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let { dataLoaded, properties, rooms, companies } = this.props;
    let { propertyId, floor, dateTime, period } = this.state;


    let statusBar = (
      <StatusBar
        hidden={this.state.landscape}
        barStyle='light-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    let calendarSearchModesToggle = (
      <CalendarSearchModesToggle
        checked={this.state.searchMode}
        onToggle={this.toggleCalendarSearchModes}
      />
    );


    let propertyFloorOverflowMenu = (
      <OverflowMenu
        menuItems={OverflowMenuItems}
        onSelect={this.handleOverflowMenuSelect}
      />
    );


    let navigationBar = !this.state.landscape ? (
      <NavigationBar
        title='Rooms'
        toggle={calendarSearchModesToggle}
        overflowMenu={propertyFloorOverflowMenu}
      />
    ) : null;


    let offline = this.context.isOffline();
    let onlineOfflineColor = !offline ? Primary1Color : Secondary1Color;


    let periodPickerView = (
      <View style={styles.periodPickerButton}>
        <Icon
          name='timelapse'
          size={34}
          color={onlineOfflineColor}
        />
        <View style={[ styles.periodPickerButtonLabelWrapperView, { borderColor: onlineOfflineColor }]}>
          <View style={styles.periodPickerButtonLabelView}>
            <Text style={[ styles.pickerButtonLabelText, { color: onlineOfflineColor }]}>
              {this.state.period / 60}
            </Text>
          </View>
        </View>
      </View>
    );

    let periodSelectedIndex = Periods.findIndex(item => item.value === period);

    let periodPickerMenu = (
      <PickerMenu
        onScreenView={periodPickerView}
        hitSlop={{ top: 10, left: 0, right: 0, bottom: 10 }}
        menuItems={Periods}
        selectedIndex={periodSelectedIndex}
        disabled={offline}
        onChange={this.handlePeriodChangeFromPickerMenu}
        menuWidth={120}
        fontSize={MenuFontSize}
      />
    );


    let datePicker = (
      <DateTimePicker
        disabled={offline}
        initialDateTime={dateTime}
        mode='date'
        onDateTimeChange={this.handleDateTimeChange}
        style={styles.datePickerButton}
      >
        <Icon
          name='event-busy'
          size={35}
          color={onlineOfflineColor}
        />
        <View style={styles.datePickerButtonLabelWrapperView}>
          <View style={styles.datePickerButtonLabelView}>
            <Text style={[ styles.pickerButtonLabelText, { color: onlineOfflineColor }]}>
              {dateTime.format('D')}
            </Text>
          </View>
        </View>
      </DateTimePicker>
    );


    let periodAndDatePickersView = (
      <View style={styles.periodAndDatePickersWrapperView}>
        {periodPickerMenu}
        {datePicker}
      </View>
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        style={styles.wrapperView}
      >
        {statusBar}
        {navigationBar}
        {this.renderModalRadioButtonPicker()}
        {
          this.state.searchMode ? (
            <SearchView
              dataLoaded={dataLoaded}
              propertyId={propertyId}
              floor={floor}
              bookingInterval={this.getBookingInterval()}
              properties={properties}
              rooms={rooms}
              companies={companies}
              periodAndDatePickersView={periodAndDatePickersView}
            />
          ) : (
            <CalendarView
              dataLoaded={dataLoaded}
              propertyId={propertyId}
              floor={floor}
              bookingInterval={this.getBookingInterval()}
              properties={properties}
              rooms={rooms}
              companies={companies}
              periodAndDatePickersView={periodAndDatePickersView}
              onBookingStartTimeChange={this.handleBookingStartTimeChange}
              onPeriodChange={this.handlePeriodChangeFromDayView}
            />
          )
        }
      </View>
    );
  }

}

BookingNew.propTypes = {
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

BookingNew.contextTypes = {
  navigationTracker: PropTypes.object,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  periodAndDatePickersWrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 4,
  },
  datePickerButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  datePickerButtonLabelWrapperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 3.5,
  },
  datePickerButtonLabelView: {
    width: 18,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Canvas1Color,
  },
  pickerButtonLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  periodPickerButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 18,
  },
  periodPickerButtonLabelWrapperView: {
    position: 'absolute',
    right: 19,
    top: Platform.OS === 'ios' ? 3 : 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: Canvas1Color,
  },
  periodPickerButtonLabelView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderRadius: 12,
  },
});




export default createContainer(() => {
  let user = Meteor.user();
  if (!user) {
    return {
      dataLoaded: false,
      user: db.getCurrentUser() || {},
      rooms: db.getPublishedRooms(),
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
}, BookingNew);
