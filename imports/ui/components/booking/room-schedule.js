
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import Colors from '../../colors';
import moment from '../../../api/unpackaged-improvements/moment';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';

const { Canvas1Color, Border2Color, TextColor, WhiteTextColor } = Theme.Palette;

const ScrollViewContainerPaddings = {
  Top: 12,
  Horizontal: 0,
};

const WrapperViewHeight = 80;
const HourLabelHeight = 15;
const HalfHourBlockWidth = 40;
const HourBlockWidth = HalfHourBlockWidth * 2;
const HourGridBorderWidth = StyleSheet.hairlineWidth;
const BookingRegionBorderWidth = 2;
const BookingRegionTailCircleSize = 12;

const { Periods } = SharedConstants;
const MinPeriod = Periods[0].value;
const MaxPeriod = Periods[Periods.length - 2].value;
const MinBookingRegionWidth = MinPeriod / 30 * HalfHourBlockWidth + HourGridBorderWidth * 2;
const MaxBookingRegionWidth = MaxPeriod / 30 * HalfHourBlockWidth + HourGridBorderWidth * 2;

const UnavailableTimeslotPattern = require('../../../resources/unavailable-timeslot-pattern.png');
const DateOnly = 'DDD YYYY';
const UserBookingsColor = Colors.cyan600;
//const OtherBookingsColor = Colors.grey200;




class RoomSchedule extends Component {

  constructor(props) {
    super(props);

    this.getCurrentTime = this.getCurrentTime.bind(this);

    this.getBookingRegionWrapperLeft = this.getBookingRegionWrapperLeft.bind(this);
    this.getBookingRegionWidth = this.getBookingRegionWidth.bind(this);
    this.disableScroll = this.disableScroll.bind(this);
    this.enableScroll = this.enableScroll.bind(this);
    this.setBookingRegionWrapperLeft = this.setBookingRegionWrapperLeft.bind(this);
    this.setBookingRegionWidth = this.setBookingRegionWidth.bind(this);

    this.handleBookingRegionWrapperPanResponderGrant = this.handleBookingRegionWrapperPanResponderGrant.bind(this);
    this.handleBookingRegionWrapperPanResponderMove = this.handleBookingRegionWrapperPanResponderMove.bind(this);
    this.handleBookingRegionWrapperPanResponderReleaseOrTerminate =
      this.handleBookingRegionWrapperPanResponderReleaseOrTerminate.bind(this);
    this.handleBookingRegionTailPanResponderGrant = this.handleBookingRegionTailPanResponderGrant.bind(this);
    this.handleBookingRegionTailPanResponderMove = this.handleBookingRegionTailPanResponderMove.bind(this);
    this.handleBookingRegionTailPanResponderReleaseOrTerminate =
      this.handleBookingRegionTailPanResponderReleaseOrTerminate.bind(this);

    this.handleHourGridItemPress = this.handleHourGridItemPress.bind(this);
    this.renderHourGridItem = this.renderHourGridItem.bind(this);
    this.renderHourGrid = this.renderHourGrid.bind(this);

    this.getBookingLeftAndWidth = this.getBookingLeftAndWidth.bind(this);
    this.renderUnavailableTimeslot = this.renderUnavailableTimeslot.bind(this);
    this.renderPassedTimeslots = this.renderPassedTimeslots.bind(this);
    this.renderBookingTimeslots = this.renderBookingTimeslots.bind(this);
    this.renderBookedTimeslots = this.renderBookedTimeslots.bind(this);
    this.renderUnavailableTimeslots = this.renderUnavailableTimeslots.bind(this);

    //this.getBookingBackgroundColor = this.getBookingBackgroundColor.bind(this);
    this.renderBooking = this.renderBooking.bind(this);
    this.renderUserBookings = this.renderUserBookings.bind(this);

    this.renderBookingRegion = this.renderBookingRegion.bind(this);

    this.onScroll = this.onScroll.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this.scrollToDateTimeHour = this.scrollToDateTimeHour.bind(this);


    this.scrollView = null;
    this.contentOffsetX = 0;

    this.bookingRegionWrapper = null;
    this.bookingRegionWrapperPanResponder = null;
    this.dateTimeSavedOnGrant = 0;
    this.bookingRegionWrapperLeftSavedOnGrant = 0;

    this.bookingRegion = null;
    this.bookingRegionTailPanResponder = null;
    this.periodSavedOnGrant = 0;
    this.bookingRegionWidthSavedOnGrant = 0;
  }




  componentDidMount() {
    this.scrollToDateTimeHour();
  }




  getCurrentTime() {
    const { propertyTimeZone } = this.props;
    return moment().tz(propertyTimeZone);
  }




  getOffsetByHour(hour) {
    return hour * HourBlockWidth + ScrollViewContainerPaddings.Horizontal;
  }




  getBookingRegionWrapperLeft(dateTime) {
    if (dateTime === undefined) { dateTime = this.props.dateTime; }
    const startHour = dateTime.hours() + dateTime.minutes() / 60;
    const startOffset = this.getOffsetByHour(startHour);
    return startOffset - HourGridBorderWidth;
  }




  getBookingRegionWidth(period) {
    if (period === undefined) { period = this.props.period; }
    const { dateTime } = this.props;
    const startHour = dateTime.hours() + dateTime.minutes() / 60;
    const endHour = startHour + period / 60;
    const startOffset = this.getOffsetByHour(startHour);
    const endOffset = this.getOffsetByHour(endHour);
    return endOffset - startOffset + HourGridBorderWidth * 2;
  }




  disableScroll() {
    this.scrollView && this.scrollView.setNativeProps({ scrollEnabled: false });
  }




  enableScroll() {
    this.scrollView && this.scrollView.setNativeProps({ scrollEnabled: true });
  }




  setBookingRegionWrapperLeft(left) {
    this.bookingRegionWrapper && this.bookingRegionWrapper.setNativeProps({ style: { left }});
  }




  setBookingRegionWidth(width) {
    this.bookingRegion && this.bookingRegion.setNativeProps({ style: { width }});
  }




  handleBookingRegionWrapperPanResponderGrant() {
    this.disableScroll();

    this.dateTimeSavedOnGrant = this.props.dateTime.clone();
    this.bookingRegionWrapperLeftSavedOnGrant = this.getBookingRegionWrapperLeft();
  }




  handleBookingRegionWrapperPanResponderMove(event, gestureState) {
    let bookingRegionWrapperLeft = this.bookingRegionWrapperLeftSavedOnGrant + gestureState.dx;
    this.setBookingRegionWrapperLeft(bookingRegionWrapperLeft);
  }




  handleBookingRegionWrapperPanResponderReleaseOrTerminate(event, gestureState) {
    this.enableScroll();

    const minuteChange = Math.round(gestureState.dx / HalfHourBlockWidth) * 30;
    const nextDateTime = this.dateTimeSavedOnGrant.clone().add(minuteChange, 'minute');

    const bookingRegionWrapperLeft = this.getBookingRegionWrapperLeft(nextDateTime);
    this.setBookingRegionWrapperLeft(bookingRegionWrapperLeft);

    const nextHour = nextDateTime.hour();
    const nextMinute = nextDateTime.minute();
    const prevHour = this.dateTimeSavedOnGrant.hour();
    const prevMinute = this.dateTimeSavedOnGrant.minute();

    if (nextHour !== prevHour || nextMinute !== prevMinute) {
      const { onTimeChange } = this.props;
      onTimeChange && onTimeChange(nextHour, nextMinute);
    }
  }




  handleBookingRegionTailPanResponderGrant() {
    this.disableScroll();

    this.periodSavedOnGrant = this.props.period;
    this.bookingRegionWidthSavedOnGrant = this.getBookingRegionWidth();
  }




  handleBookingRegionTailPanResponderMove(event, gestureState) {
    let bookingRegionWidth = this.bookingRegionWidthSavedOnGrant + gestureState.dx;

    if (bookingRegionWidth < MinBookingRegionWidth) {
      bookingRegionWidth = MinBookingRegionWidth;
    } else if (bookingRegionWidth > MaxBookingRegionWidth) {
      bookingRegionWidth = MaxBookingRegionWidth;
    }

    this.setBookingRegionWidth(bookingRegionWidth);
  }




  handleBookingRegionTailPanResponderReleaseOrTerminate(event, gestureState) {
    this.enableScroll();

    const periodChange = Math.round(gestureState.dx / HalfHourBlockWidth) * 30;
    let nextPeriod = this.periodSavedOnGrant + periodChange;

    if (nextPeriod < MinPeriod) {
      nextPeriod = MinPeriod;
    } else if (nextPeriod > MaxPeriod) {
      nextPeriod = MaxPeriod;
    }

    const bookingRegionWidth = this.getBookingRegionWidth(nextPeriod);
    this.setBookingRegionWidth(bookingRegionWidth);

    if (nextPeriod !== this.props.period) {
      const { onPeriodChange } = this.props;
      onPeriodChange && onPeriodChange(nextPeriod);
    }
  }




  componentWillMount() {
    this.bookingRegionWrapperPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderGrant: this.handleBookingRegionWrapperPanResponderGrant,
      onPanResponderMove: this.handleBookingRegionWrapperPanResponderMove,
      onPanResponderTerminationRequest: (event, gestureState) => true,
      onPanResponderTerminate: this.handleBookingRegionWrapperPanResponderReleaseOrTerminate,
      onPanResponderRelease: this.handleBookingRegionWrapperPanResponderReleaseOrTerminate,
      onShouldBlockNativeResponder: (event, gestureState) => false, // not working without it in Android
    });

    this.bookingRegionTailPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderGrant: this.handleBookingRegionTailPanResponderGrant,
      onPanResponderMove: this.handleBookingRegionTailPanResponderMove,
      onPanResponderTerminationRequest: (event, gestureState) => true,
      onPanResponderTerminate: this.handleBookingRegionTailPanResponderReleaseOrTerminate,
      onPanResponderRelease: this.handleBookingRegionTailPanResponderReleaseOrTerminate,
      onShouldBlockNativeResponder: (event, gestureState) => false, // not working without it in Android
    });
  }




  handleHourGridItemPress(hour, minute) {
    const { onTimeChange, onSelect } = this.props;
    onSelect && onSelect();
    onTimeChange && onTimeChange(hour, minute);
  }




  renderHourGridItem(hour) {
    const hourLabel = (
      <View style={styles.hourLabelView}>
        <Text style={styles.hourLabelText}>
          { hour > 11 ? ((hour - 12) || 12) + 'PM' : (hour || 12) + 'AM' }
        </Text>
      </View>
    );


    const firstHalfHourBlock = (
      <View style={styles.firstHalfHourBlock}>
        {hourLabel}
      </View>
    );


    const secondHalfHourBlock = (
      <View style={hour === 23 ? styles.secondHalfHourBlockWithBorderRight : styles.secondHalfHourBlock}>
        <View style={styles.secondHalfHourBlockTopPlug} />
        <View style={styles.secondHalfHourSubblock} />
      </View>
    );


    return (
      <View key={hour} style={styles.hourGridItem}>
        <TouchableWithoutFeedback
          onPress={() => this.handleHourGridItemPress(hour, 0)}
        >
          {firstHalfHourBlock}
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => this.handleHourGridItemPress(hour, 30)}
        >
          {secondHalfHourBlock}
        </TouchableWithoutFeedback>
      </View>
    );
  };




  renderHourGrid() {
    let hourGridItems = [];

    for (let hour = 0; hour < 24; hour++) {
      hourGridItems.push(this.renderHourGridItem(hour));
    }

    return hourGridItems;
  }




  getBookingLeftAndWidth(booking) {
    const { dateTime, propertyTimeZone } = this.props;
    const startDate = moment(booking.startDate).tz(propertyTimeZone);
    const endDate = moment(booking.endDate).tz(propertyTimeZone);
    const startHour = startDate.hour() + startDate.minute() / 60;
    const endHour = endDate.hour() + endDate.minute() / 60;
    let startOffset = this.getOffsetByHour(startHour);
    let endOffset = this.getOffsetByHour(endHour);

    if (startHour > endHour) {
      if (startDate.format(DateOnly) !== dateTime.format(DateOnly)) {
        startOffset = this.getOffsetByHour(0);
      } else {
        endOffset = this.getOffsetByHour(24);
      }
    }

    const left = startOffset;
    const width = endOffset - startOffset;
    return { left, width };
  }




  renderUnavailableTimeslot(key) {
    return (
      <Image
        key={key}
        resizeMode='contain'
        source={UnavailableTimeslotPattern}
        style={styles.unavailableTimeslot}
      />
    );
  }




  renderPassedTimeslots() {
    const currentTime = this.getCurrentTime();
    const { dateTime } = this.props;
    if (currentTime.isBefore(dateTime, 'days')) { return null; }

    let passedTimeslots = [];
    const renderToday = currentTime.format(DateOnly) === dateTime.format(DateOnly);
    const passedTimeslotsCount = renderToday ?
      currentTime.hours() * 2 + Math.floor(currentTime.minutes() / 30) :
      24 * 2;

    for (let i = 0; i < passedTimeslotsCount; i++) {
      passedTimeslots.push(this.renderUnavailableTimeslot(i));
    }

    return (
      <View style={styles.passedTimeslotsWrapperView}>
        { passedTimeslots }
      </View>
    );
  }




  renderBookingTimeslots(booking, key) {
    let bookingTimeslots = [];
    const { left, width } = this.getBookingLeftAndWidth(booking);
    const bookingTimeslotsCount = width / HalfHourBlockWidth;

    for (let i = 0; i < bookingTimeslotsCount; i++) {
      bookingTimeslots.push(this.renderUnavailableTimeslot(i));
    }

    return (
      <View
        key={key}
        style={[ styles.bookingTimeslotsWrapperView, { left }]}
      >
        { bookingTimeslots }
      </View>
    );
  }




  renderBookedTimeslots() {
    let bookedTimeslots = [];
    const { roomBookings, userId } = this.props;

    roomBookings.forEach((booking, i) => {
      const isCreator = booking.creatorId === userId;
      const isAttendee = booking.attendees && booking.attendees.some(attendee => attendee.userId === userId);
      if (!isCreator && !isAttendee) { bookedTimeslots.push(this.renderBookingTimeslots(booking, i)); }
    });

    return bookedTimeslots;
  }




  renderUnavailableTimeslots() {
    return (
      <View style={styles.layer}>
        { this.renderPassedTimeslots() }
        { this.renderBookedTimeslots() }
      </View>
    );
  }




  // getBookingBackgroundColor(booking, i) {
  //   const { userId } = this.props;
  //   const isCreator = booking.creatorId === userId;
  //   const isAttendee = booking.attendees && booking.attendees.some(attendee => attendee.userId === userId);
  //   return (isCreator || isAttendee) ? UserBookingsColor : OtherBookingsColor;
  // }




  renderBooking(booking, key) {
    const { left, width } = this.getBookingLeftAndWidth(booking);
    const backgroundColor = UserBookingsColor; // this.getBookingBackgroundColor(booking, key);

    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.5}
        onPress={() => this.props.onShowBookingDetails(booking)}
        style={[ styles.bookingButton, { left, width, backgroundColor }]}
      />
    );
  }




  renderUserBookings() {
    let userBookings = [];
    const { roomBookings, userId } = this.props;

    roomBookings.forEach((booking, i) => {
      const isCreator = booking.creatorId === userId;
      const isAttendee = booking.attendees && booking.attendees.some(attendee => attendee.userId === userId);
      if (isCreator || isAttendee) { userBookings.push(this.renderBooking(booking, i)); }
    });

    return userBookings;
  }




  renderBookingRegion() {
    if (!this.props.selected) { return null; }

    const { dateTime, period, roomAvailable } = this.props;
    const startHour = dateTime.hours() + dateTime.minutes() / 60;
    const endHour = startHour + period / 60;
    const startOffset = this.getOffsetByHour(startHour);
    const endOffset = this.getOffsetByHour(endHour);
    const left = startOffset - HourGridBorderWidth;
    const width = endOffset - startOffset + HourGridBorderWidth * 2;

    const activeColors = {
      backgroundColor: 'rgba(35, 179, 246, 0.35)',
      borderColor: Colors.blueGrey500,
    };
    const inactiveColors = {
      backgroundColor: 'rgba(205, 60, 50, 0.35)',
      borderColor: Colors.red600,
    };
    const { backgroundColor, borderColor } = roomAvailable ? activeColors : inactiveColors;

    return (
      <View
        ref={ref => { this.bookingRegionWrapper = ref; }}
        style={[ styles.bookingRegionWrapper, { left }]}
        {...this.bookingRegionWrapperPanResponder.panHandlers}
      >
        <View
          ref={ref => { this.bookingRegion = ref; }}
          style={[ styles.bookingRegion, { width, backgroundColor, borderColor }]}
        />
        <View
          style={styles.bookingRegionTail}
          {...this.bookingRegionTailPanResponder.panHandlers}
        >
          <View style={[ styles.bookingRegionTailCircle, { borderColor }]} />
        </View>
      </View>
    );
  }




  onScroll({ nativeEvent: { contentOffset }}) {
    this.contentOffsetX = contentOffset.x;
  }




  scrollTo(x) {
    this.scrollView && this.scrollView.scrollTo({ x, y: 0, animated: true });
  }




  scrollToDateTimeHour() {
    const dateTime = this.props.dateTime.clone().minutes(0);
    let hourToScrollTo = dateTime.hour() - 1;
    let x = this.getOffsetByHour(hourToScrollTo);
    this.scrollTo(x);
  }




  render() {
    return (
      <View style={styles.wrapperView}>
        <ScrollView
          ref={ref => { this.scrollView = ref; }}
          contentContainerStyle={styles.scrollViewContentContainer}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          onScroll={this.onScroll}
          scrollEventThrottle={16}
        >
          {this.renderUnavailableTimeslots()}
          {this.renderHourGrid()}
          {this.renderUserBookings()}
          {this.renderBookingRegion()}
        </ScrollView>
      </View>
    );
  }

}




RoomSchedule.propTypes = {
  userId: PropTypes.string.isRequired,
  roomId: PropTypes.string.isRequired,
  roomBookings: PropTypes.array.isRequired,
  onShowBookingDetails: PropTypes.func.isRequired,
  roomAvailable: PropTypes.bool.isRequired,
  propertyTimeZone: PropTypes.string.isRequired,
  dateTime: PropTypes.object.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  period: PropTypes.number.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};




const styles = StyleSheet.create({
  wrapperView: {
    height: WrapperViewHeight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: Colors.grey400,
  },
  scrollViewContentContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: ScrollViewContainerPaddings.Top,
    paddingHorizontal: ScrollViewContainerPaddings.Horizontal,
    backgroundColor: Canvas1Color,
  },


  hourGridItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  firstHalfHourBlock: {
    width: HalfHourBlockWidth,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderColor: Border2Color,
    borderLeftWidth: HourGridBorderWidth,
  },
  secondHalfHourBlock: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  secondHalfHourBlockWithBorderRight: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderColor: Border2Color,
    borderRightWidth: HourGridBorderWidth,
  },
  secondHalfHourBlockTopPlug: {
    flex: 1,
  },
  secondHalfHourSubblock: {
    width: HalfHourBlockWidth,
    flex: 1,
    borderColor: Border2Color,
    borderLeftWidth:HourGridBorderWidth,
  },
  hourLabelView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 4,
  },
  hourLabelText: {
    fontSize: 10,
    fontWeight: '100',
    color: TextColor,
  },


  bookingRegionWrapper: {
    position: 'absolute',
    top: HourLabelHeight + ScrollViewContainerPaddings.Top,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  bookingRegion: {
    flex: 1,
    borderLeftWidth: BookingRegionBorderWidth,
    borderRightWidth: BookingRegionBorderWidth,
    marginRight: (BookingRegionTailCircleSize + BookingRegionBorderWidth) / 2,
  },
  bookingRegionTail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: BookingRegionTailCircleSize + BookingRegionBorderWidth,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bookingRegionTailCircle: {
    height: BookingRegionTailCircleSize,
    width: BookingRegionTailCircleSize,
    backgroundColor: 'white',
    borderRadius: BookingRegionTailCircleSize / 2,
    borderWidth: BookingRegionBorderWidth,
  },


  layer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: HourLabelHeight + ScrollViewContainerPaddings.Top,
    marginHorizontal: ScrollViewContainerPaddings.Horizontal,
  },
  passedTimeslotsWrapperView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: Colors.grey100,
  },
  bookingTimeslotsWrapperView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: Colors.grey100,
  },
  unavailableTimeslot: {
    height: WrapperViewHeight - ScrollViewContainerPaddings.Top - HourLabelHeight,
    width: HalfHourBlockWidth,
  },


  bookingButton: {
    position: 'absolute',
    top: ScrollViewContainerPaddings.Top + HourLabelHeight,
    bottom: 0,
    opacity: 0.75,
  },
});


export default RoomSchedule;
