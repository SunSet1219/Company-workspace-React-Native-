
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MKSpinner } from '../material-ui';
import BookingPeriodBar from './booking/booking-period-bar';
import Colors from '../colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import moment from '../../api/unpackaged-improvements/moment';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';

const { Canvas1Color, Border1Color, WhiteTextColor } = Theme.Palette;

const DateOnly = 'DDD YYYY';
const BookingStartButtonPressInDelay = 100;
const PeriodChangeButtonPressInDelay = 200;
const PeriodChangeButtonHeight = 20;
const { Periods } = SharedConstants;
const MinPeriod = Periods[0].value;
const MaxPeriod = Periods[Periods.length - 2].value;

const PaddingRight = 16;
const HourLabelWidth = 80;
const HourHeight = 78;
const HalfHourHeight = HourHeight / 2;
const MinuteHandHeight = 12;
const MinuteHandLineHeight = 2;
const HourLabelTopOffset = -9;
const BookingRegionTopOffset = 1;
const LoadingSpinnerViewSize = 40;

const EventColors = [
  Colors.lightBlue600,
  Colors.lightGreen600,
  Colors.cyan600,
  Colors.pink400
];




class DayView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentTime: this.getCurrentTime(),
    };

    this.handleBookingStartButtonsPanResponderGrant = this.handleBookingStartButtonsPanResponderGrant.bind(this);
    this.handleBookingStartButtonsPanResponderMove = this.handleBookingStartButtonsPanResponderMove.bind(this);
    this.handleBookingStartButtonsPanResponderTerminate = this.handleBookingStartButtonsPanResponderTerminate.bind(this);
    this.handleBookingStartButtonsPanResponderRelease = this.handleBookingStartButtonsPanResponderRelease.bind(this);

    this.handlePeriodChangeButtonPanResponderGrant = this.handlePeriodChangeButtonPanResponderGrant.bind(this);
    this.handlePeriodChangeButtonPanResponderMove = this.handlePeriodChangeButtonPanResponderMove.bind(this);
    this.handlePeriodChangeButtonPanResponderTerminateOrRelease =
      this.handlePeriodChangeButtonPanResponderTerminateOrRelease.bind(this);

    this.highlightBookingStartButton = this.highlightBookingStartButton.bind(this);
    this.dimBookingStartButton = this.dimBookingStartButton.bind(this);
    this.disableScroll = this.disableScroll.bind(this);
    this.enableScroll = this.enableScroll.bind(this);
    this.highlightSavedBookingRegion = this.highlightSavedBookingRegion.bind(this);
    this.dimSavedBookingRegion = this.dimSavedBookingRegion.bind(this);

    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.changeBookingStartTime = this.changeBookingStartTime.bind(this);
    this.changePeriod = this.changePeriod.bind(this);
    this.isRoomAvailable = this.isRoomAvailable.bind(this);
    this.isBookingStartTimePassed = this.isBookingStartTimePassed.bind(this);
    this.getBookingRegionStartInHours = this.getBookingRegionStartInHours.bind(this);
    this.getBookingRegionStartInMinutes = this.getBookingRegionStartInMinutes.bind(this);
    this.renderBookingRegion = this.renderBookingRegion.bind(this);
    this.renderSavedBookingRegion = this.renderSavedBookingRegion.bind(this);
    this.renderEvents = this.renderEvents.bind(this);
    this.renderHourRows = this.renderHourRows.bind(this);
    this.renderMinuteHand = this.renderMinuteHand.bind(this);
    this.renderBookingStartButtons = this.renderBookingStartButtons.bind(this);
    this.renderPeriodChangeButton = this.renderPeriodChangeButton.bind(this);
    this.canScrollToEditingEvent = this.canScrollToEditingEvent.bind(this);
    this.scrollToEditingEvent = this.scrollToEditingEvent.bind(this);
    this.canScrollToCurrentHour = this.canScrollToCurrentHour.bind(this);
    this.scrollToCurrentHour = this.scrollToCurrentHour.bind(this);
    this.maybeScrollToInitialPosition = this.maybeScrollToInitialPosition.bind(this);
    this.maybeScrollToCurrentHour = this.maybeScrollToCurrentHour.bind(this);
    this.scrollToSavedPosition = this.scrollToSavedPosition.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onLayout = this.onLayout.bind(this);
    this.onContentSizeChange = this.onContentSizeChange.bind(this);


    this.minuteInterval = null;
    this.scrollView = null;
    this.scrollViewHeight = 0;
    this.scrollViewContentHeight = 0;
    this.editingEventOffsetY = 0;
    this.currentContentOffsetY = 0;
    this.savedContentOffsetY = this.currentContentOffsetY;
    this.needToScrollToSavedPosition = false;
    this.scrolledToSavedPosition = false;
    this.scrolledToInitialPosition = false;

    this.bookingStartButtonsPanResponder = null;
    this.bookingStartButtonPressInDelayTimeout = null;
    this.bookingStartButtons = {};
    this.bookingStartButtonPressed = false;
    this.touchYSavedOnBookingStartButtonPress = 0;

    this.periodChangeButtonPanResponder = null;
    this.periodChangeButtonPressInDelayTimeout = null;
    this.periodChangeButtonPressed = false;
    this.periodSavedOnPeriodChangeButtonPress = 0;

    this.savedBookingRegion = null;
    this.bookingAvailable = false;
  }




  componentWillMount() {
    this.bookingStartButtonsPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderGrant: this.handleBookingStartButtonsPanResponderGrant,
      onPanResponderMove: this.handleBookingStartButtonsPanResponderMove,
      onPanResponderTerminationRequest: (event, gestureState) => true,
      onPanResponderTerminate: this.handleBookingStartButtonsPanResponderTerminate,
      onPanResponderRelease: this.handleBookingStartButtonsPanResponderRelease,
      onShouldBlockNativeResponder: (event, gestureState) => false, // not working without it in Android
    });

    this.periodChangeButtonPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderGrant: this.handlePeriodChangeButtonPanResponderGrant,
      onPanResponderMove: this.handlePeriodChangeButtonPanResponderMove,
      onPanResponderTerminationRequest: (event, gestureState) => true,
      onPanResponderTerminate: this.handlePeriodChangeButtonPanResponderTerminateOrRelease,
      onPanResponderRelease: this.handlePeriodChangeButtonPanResponderTerminateOrRelease,
      onShouldBlockNativeResponder: (event, gestureState) => false, // not working without it in Android
    });
  }




  handlePeriodChangeButtonPanResponderGrant(event, gestureState) {
    let onPeriodChangeButtonPress = () => {
      this.periodSavedOnPeriodChangeButtonPress = this.props.period;
      this.periodChangeButtonPressed = true;
      this.disableScroll();
      this.highlightSavedBookingRegion();
    };

    this.periodChangeButtonPressInDelayTimeout =
      setTimeout(onPeriodChangeButtonPress, PeriodChangeButtonPressInDelay);
  }




  handlePeriodChangeButtonPanResponderMove(event, gestureState) {
    if (!this.periodChangeButtonPressed) { return; }

    let periodChange = Math.round(gestureState.dy / HalfHourHeight) * 30;
    let nextPeriod = this.periodSavedOnPeriodChangeButtonPress + periodChange;

    if (nextPeriod < MinPeriod) {
      nextPeriod = MinPeriod;
    } else if (nextPeriod > MaxPeriod) {
      nextPeriod = MaxPeriod;
    }

    if (nextPeriod !== this.props.period) {
      this.changePeriod(nextPeriod);
    }
  }




  handlePeriodChangeButtonPanResponderTerminateOrRelease(event, gestureState) {
    this.periodChangeButtonPressed = false;
    this.periodChangeButtonPressInDelayTimeout && clearTimeout(this.periodChangeButtonPressInDelayTimeout);
    this.enableScroll();
    this.dimSavedBookingRegion();
  }




  handleBookingStartButtonsPanResponderGrant(event, gestureState) {
    let { hours, minutes } = event._targetInst._currentElement.props;

    if (this.isBookingStartTimePassed(hours, minutes, this.props.period)) { return; }

    this.touchYSavedOnBookingStartButtonPress = event.nativeEvent.locationY;

    let onBookingStartButtonPress = () => {
      this.highlightBookingStartButton(hours, minutes);
      this.bookingStartButtonPressed = true;
    };

    this.bookingStartButtonPressInDelayTimeout =
      setTimeout(onBookingStartButtonPress, BookingStartButtonPressInDelay);
  }




  handleBookingStartButtonsPanResponderMove(event, gestureState) {
    if (!this.bookingStartButtonPressed) { return; }

    let touchYRelatedToPressedButton = this.touchYSavedOnBookingStartButtonPress + gestureState.dy;
    let touchYOutsidePressedButton = (
      touchYRelatedToPressedButton < 0 ||
      touchYRelatedToPressedButton > HalfHourHeight
    );

    if (touchYOutsidePressedButton) {
      let { hours, minutes } = event._targetInst._currentElement.props;
      this.dimBookingStartButton(hours, minutes);
      this.bookingStartButtonPressed = false;
    }
  }




  handleBookingStartButtonsPanResponderTerminate(event, gestureState) {
    if (!this.bookingStartButtonPressed) {
      this.bookingStartButtonPressInDelayTimeout && clearTimeout(this.bookingStartButtonPressInDelayTimeout);
      return;
    }

    let { hours, minutes } = event._targetInst._currentElement.props;
    this.dimBookingStartButton(hours, minutes);
    this.bookingStartButtonPressed = false;
  }




  handleBookingStartButtonsPanResponderRelease(event, gestureState) {
    let { hours, minutes } = event._targetInst._currentElement.props;

    if (!this.bookingStartButtonPressed) {
      this.bookingStartButtonPressInDelayTimeout && clearTimeout(this.bookingStartButtonPressInDelayTimeout);
    } else {
      this.dimBookingStartButton(hours, minutes);
      this.bookingStartButtonPressed = false;
    }

    this.changeBookingStartTime(hours, minutes);
  }




  highlightBookingStartButton(hours, minutes) {
    let bookingStartButton = this.bookingStartButtons[String(hours * 60 + minutes)];
    bookingStartButton &&
    bookingStartButton.setNativeProps({ style: { backgroundColor: 'rgba(0, 0, 0, 0.025)' }});
  }




  dimBookingStartButton(hours, minutes) {
    let bookingStartButton = this.bookingStartButtons[String(hours * 60 + minutes)];
    bookingStartButton &&
    bookingStartButton.setNativeProps({ style: { backgroundColor: 'transparent' }});
  }




  disableScroll() {
    this.scrollView && this.scrollView.setNativeProps({ scrollEnabled: false });
  }




  enableScroll() {
    this.scrollView && this.scrollView.setNativeProps({ scrollEnabled: true });
  }




  highlightSavedBookingRegion() {
    let bookingRegionTopOffset = this.getBookingRegionStartInHours() * HourHeight;
    let top = bookingRegionTopOffset - HourLabelTopOffset;
    let height = this.props.period / 60 * HourHeight;
    let backgroundColor = Colors.amber50;

    this.savedBookingRegion &&
    this.savedBookingRegion.setNativeProps({ style: { top, height, backgroundColor }});
  }




  dimSavedBookingRegion() {
    this.savedBookingRegion &&
    this.savedBookingRegion.setNativeProps({ style: { backgroundColor: 'transparent' }});
  }




  componentDidMount() {
    this.minuteInterval = setInterval(() => {
      this.setState({ currentTime: this.getCurrentTime() });
    }, 60 * 1000);

    let { updateBookButton } = this.props;
    updateBookButton && updateBookButton(this.bookingAvailable);
  }




  componentWillUnmount() {
    this.bookingStartButtonPressInDelayTimeout && clearTimeout(this.bookingStartButtonPressInDelayTimeout);
    this.periodChangeButtonPressInDelayTimeout && clearTimeout(this.periodChangeButtonPressInDelayTimeout);
    this.minuteInterval && clearInterval(this.minuteInterval);
  }




  componentWillReceiveProps(nextProps) {
    let dateTime = this.props.dateTime;
    let nextDateTime = nextProps.dateTime;

    if (
      nextDateTime.date() !== dateTime.date() ||
      nextDateTime.month() !== dateTime.month() ||
      nextDateTime.year() !== dateTime.year()
    ) {
      this.savedContentOffsetY = this.currentContentOffsetY;
      this.needToScrollToSavedPosition = true;
      this.scrolledToSavedPosition = false;
    }

    if (nextProps.roomId !== this.props.roomId) {
      this.scrolledToInitialPosition = false;
    }
  }




  getCurrentTime() {
    return moment().tz(this.props.timeZone);
  }




  getTopDistance(time) {
    return (time.hours() + (time.minutes() / 60)) * HourHeight - HourLabelTopOffset;
  }




  changeBookingStartTime(hours, minutes) {
    let { dateTime, period, onBookingStartTimeChange } = this.props;
    let date = dateTime.clone().hours(hours).minutes(minutes);
    let startDate = date.clone().tz('UTC').toDate();
    let endDate = date.clone().add(period, 'minutes').tz('UTC').toDate();

    if (this.isBookingStartTimePassed(hours, minutes, period) || !this.isRoomAvailable(startDate, endDate)) {
      return this.context.showToast(
        'Room is not available at this time and duration'
      );
    }

    onBookingStartTimeChange && onBookingStartTimeChange(hours, minutes);
  }




  changePeriod(period) {
    let { dateTime, onPeriodChange } = this.props;
    let hours = dateTime.hours();
    let minutes = dateTime.minutes();
    let startDate = dateTime.clone().tz('UTC').toDate();
    let endDate = dateTime.clone().add(period, 'minutes').tz('UTC').toDate();

    if (this.isBookingStartTimePassed(hours, minutes, period) || !this.isRoomAvailable(startDate, endDate)) {
      return this.context.showToast(
        'Room is not available at this time and duration'
      );
    }

    onPeriodChange && onPeriodChange(period);
  }




  isRoomAvailable(startDate, endDate) {
    return !this.props.roomBookings.some(booking => {
      let bookingStartDate = new Date(booking.startDate);
      let bookingEndDate = new Date(booking.endDate);
      bookingStartDate && bookingStartDate.setMilliseconds && bookingStartDate.setMilliseconds(0);
      bookingEndDate && bookingEndDate.setMilliseconds && bookingEndDate.setMilliseconds(0);

      return (
        bookingStartDate >= startDate && bookingStartDate < endDate ||
        bookingEndDate > startDate && bookingEndDate <= endDate ||
        bookingStartDate <= startDate && bookingEndDate >= endDate
      );
    });
  }




  isBookingStartTimePassed(hours, minutes, period) {
    let { dateTime } = this.props;
    let endDateTime = dateTime.clone().hours(hours).minutes(minutes).add(period, 'minutes').toDate();
    let currentDateTime = this.state.currentTime.toDate();
    let bookingStartTimePassed = endDateTime < currentDateTime;
    return bookingStartTimePassed;
  }




  getBookingRegionStartInHours() {
    let { dateTime } = this.props;
    return dateTime.hours() + dateTime.minutes() / 60;
  }




  getBookingRegionStartInMinutes() {
    let { dateTime } = this.props;
    return dateTime.hours() * 60 + dateTime.minutes();
  }




  renderBookingRegion() {
    let { dateTime, period } = this.props;
    let hours = dateTime.hours();
    let minutes = dateTime.minutes();
    let startDate = dateTime.clone().tz('UTC').toDate();
    let endDate = dateTime.clone().add(period, 'minutes').tz('UTC').toDate();

    if (this.isBookingStartTimePassed(hours, minutes, period) || !this.isRoomAvailable(startDate, endDate)) {
      this.bookingAvailable = false;
      return null;
    }

    this.bookingAvailable = true;

    let bookingRegionStart = this.getBookingRegionStartInHours();
    let top = bookingRegionStart * HourHeight - HourLabelTopOffset;
    let height = period / 60 * HourHeight - BookingRegionTopOffset;

    let arrowUpIcon = (
      <Icon
        name='arrow-drop-up'
        size={28}
        color={period > MinPeriod ? Colors.blueGrey500 : 'transparent'}
        style={{
          top: -20,
          alignSelf: 'center',
          backgroundColor: 'transparent',
        }}
      />
    );

    let arrowDownIcon = (
      <Icon
        name='arrow-drop-down'
        size={28}
        color={period < MaxPeriod ? Colors.blueGrey500 : 'transparent'}
        style={{
          top: -37,
          alignSelf: 'center',
          backgroundColor: 'transparent',
        }}
      />
    );

    return (
      <View
        onLayout={this.needToScrollToSavedPosition ? this.scrollToSavedPosition : null}
        style={[ styles.bookingRegionWrapperView, { top }]}
      >
        <View style={[ styles.bookingRegion, { height }]} />
        {arrowUpIcon}
        {arrowDownIcon}
      </View>
    );
  }




  renderSavedBookingRegion() {
    return (
      <View
        ref={ref => this.savedBookingRegion = ref}
        style={styles.savedBookingRegion}
      />
    );
  }




  renderEvents() {
    let currentTime = this.getCurrentTime();
    let { bookingId } = this.props;

    let eventViews = this.props.roomBookings.map((booking, i) => {
      let d1 = moment(booking.startDate).tz(SharedConstants.propertiesTimeZone);
      let d2 = moment(booking.endDate).tz(SharedConstants.propertiesTimeZone);
      let top = this.getTopDistance(d1);
      let bottom = this.getTopDistance(d2);

      if (d1.hours() > d2.hours()) {
        if (d1.format(DateOnly) !== currentTime.format(DateOnly)) {
          top = 0;
        } else {
          bottom = HourHeight * 24;
        }
      }

      let backgroundColor = Colors.grey400;

      booking.attendees.forEach((attendee) => {
        if (attendee.userId === Meteor.userId()) backgroundColor = EventColors[i % EventColors.length];
      });

      let height = bottom - top;
      let onLayout = bookingId && booking._id === bookingId ? (event) => {
        this.editingEventOffsetY = event.nativeEvent.layout.y;
        this.maybeScrollToInitialPosition();
      } : null;

      return (
        <View
          key={i}
          onLayout={onLayout}
          style={[ styles.eventView, { top, height, backgroundColor }]}
        >
          <Text numberOfLines={2} style={styles.eventLabelText}>
            {booking.title + ' '}
            {d1.format('D h:mm A') + ' - '}
            {d2.format('h:mm A')}
          </Text>
        </View>
      );
    });


    return (
      <View style={styles.eventsLayer}>
        {eventViews}
      </View>
    );
  }




  renderHourRows() {
    let hourRows = [];

    for (let i = 0; i < 24; i++) {
      let hourLabel = (
        <View style={styles.hourLabelView}>
          <Text style={styles.hourLabelText}>
            {
              this.props.timeFormat === 24 ?
                i : (i > 11 ? ((i - 12) || 12) + ' PM' : (i || 12) + ' AM')
            }
          </Text>
        </View>
      );

      let passedColor = 'rgba(0,0,0,0.05)';
      let topHalfHourPassed = this.isBookingStartTimePassed(i, 0, MinPeriod);
      let topHalfHourBlockBorderTopColor = topHalfHourPassed ? { borderTopColor: 'white' } : null;
      let topHalfHourBlockColor = topHalfHourPassed ? { backgroundColor: passedColor } : null;
      let bottomHalfHourPassed = this.isBookingStartTimePassed(i, 30, MinPeriod);
      let bottomHalfHourBlockColor = bottomHalfHourPassed ? { backgroundColor: passedColor } : null;
      let bottomHalfHourBlockBorderColor = bottomHalfHourPassed ? { borderColor: 'white' } : null;

      let hourBlock = (
        <View style={[ styles.hourBlock, topHalfHourBlockBorderTopColor ]}>
          <View style={[ styles.topHalfHourBlock, topHalfHourBlockColor ]} />
          <View style={[ styles.bottomHalfHourBlock, bottomHalfHourBlockColor ]}>
            <View style={[ styles.halfHourBlockWithDashedBorder, bottomHalfHourBlockBorderColor ]} />
          </View>
        </View>
      );

      hourRows.push(
        <View key={i} style={styles.hourRow}>
          {hourLabel}
          {hourBlock}
        </View>
      );
    }


    return (
      <View style={styles.hourRowsLayer}>
        {hourRows}
      </View>
    );
  }




  renderBookingStartButtons() {
    let bookingStartButtons = [];

    for (let i = 0; i < 48; i++) {
      let hours = Math.floor(i / 2);
      let minutes = (i % 2) * 30;

      bookingStartButtons.push(
        <View
          ref={ref => this.bookingStartButtons[String(hours * 60 + minutes)] = ref}
          key={i}
          hours={hours}
          minutes={minutes}
          style={styles.bookingStartButton}
          {...this.bookingStartButtonsPanResponder.panHandlers}
        />
      );
    }

    return (
      <View style={styles.bookingStartButtonsLayer}>
        {bookingStartButtons}
      </View>
    );
  }




  renderPeriodChangeButton() {
    let bookingRegionTopOffset = this.getBookingRegionStartInHours() * HourHeight;
    let periodHeight = this.props.period / 60 * HourHeight;
    let top = bookingRegionTopOffset + periodHeight - PeriodChangeButtonHeight / 2 - HourLabelTopOffset;

    return (
      <View style={[ styles.periodChangeButtonWrapperView, { top }]}>
        <View
          style={styles.periodChangeButton}
          {...this.periodChangeButtonPanResponder.panHandlers}
        />
      </View>
    );
  }




  renderMinuteHand() {
    let { currentTime } = this.state;
    let { dateTime, bookingId } = this.props;

    let top = this.getTopDistance(currentTime) - (MinuteHandHeight / 2);
    let opacity = currentTime.format(DateOnly) !== dateTime.format(DateOnly) ? 0.2 : 1;
    let onLayout = !bookingId ? () => {
      this.maybeScrollToInitialPosition();
      this.maybeScrollToCurrentHour();
    } : null;

    return (
      <View
        onLayout={onLayout}
        style={[ styles.minuteHandWrapperView, { top, opacity }]}
      >
        <View style={styles.minuteHandCircle} />
        <View style={styles.minuteHandLine} />
      </View>
    );
  }




  canScrollToEditingEvent() {
    return this.editingEventOffsetY && this.scrollViewHeight && this.scrollViewContentHeight;
  }




  scrollToEditingEvent() {
    let y = this.editingEventOffsetY - MinuteHandHeight;

    let maxContentOffsetY = this.scrollViewContentHeight - this.scrollViewHeight;
    if (maxContentOffsetY < 0) { maxContentOffsetY = 0; }
    if (y > maxContentOffsetY) { y = maxContentOffsetY; }

    this.scrollView && this.scrollView.scrollTo({ y, x: 0, animated: true });
    return true;
  }




  canScrollToCurrentHour() {
    return this.scrollViewHeight && this.scrollViewContentHeight;
  }




  scrollToCurrentHour() {
    let currentHour = this.state.currentTime.clone().minutes(0);
    let hourToScrollTo = currentHour.hour(currentHour.hour());
    let y = this.getTopDistance(hourToScrollTo) - MinuteHandHeight;
    if (y < 0) { y = 0; }

    let maxContentOffsetY = this.scrollViewContentHeight - this.scrollViewHeight;
    if (maxContentOffsetY < 0) { maxContentOffsetY = 0; }
    if (y > maxContentOffsetY) { y = maxContentOffsetY; }

    this.scrollView && this.scrollView.scrollTo({ y, x: 0, animated: true });
    return true;
  }




  maybeScrollToInitialPosition() {
    if (this.scrolledToInitialPosition) { return; }

    this.scrolledToInitialPosition = this.props.bookingId ?
      this.canScrollToEditingEvent() && this.scrollToEditingEvent() :
      this.canScrollToCurrentHour() && this.scrollToCurrentHour();
  }




  maybeScrollToCurrentHour() {
    if (this.needToScrollToSavedPosition && !this.scrolledToSavedPosition) {
      return this.canScrollToCurrentHour() && this.scrollToCurrentHour();
    }
  }




  scrollToSavedPosition() {
    this.scrollView && this.scrollView.scrollTo({ y: this.savedContentOffsetY, x: 0, animated: true });
    this.needToScrollToSavedPosition = false;
    this.scrolledToSavedPosition = true;
  }




  onScroll({ nativeEvent: { contentOffset }}) {
    this.currentContentOffsetY = contentOffset.y;
  }




  onLayout({ nativeEvent: { layout }}) {
    this.scrollViewHeight = layout.height;
    this.maybeScrollToInitialPosition();
  }




  onContentSizeChange(contentWidth, contentHeight) {
    this.scrollViewContentHeight = contentHeight;
    this.maybeScrollToInitialPosition();
  }




  render() {
    if (!this.props.bookingsDataLoaded) {
      return (
        <View style={styles.loadingSpinnerContainer}>
          <View style={styles.loadingSpinnerView}>
            <SingleColorSpinner />
          </View>
        </View>
      );
    }


    let bookingPeriodBar = this.bookingAvailable ? (
      <BookingPeriodBar
        dateTime={this.props.dateTime}
        period={this.props.period}
        onPeriodChange={this.changePeriod}
      />
    ) : null;


    return (
      <View style={styles.wrapperView}>
        <ScrollView
          ref={ref => this.scrollView = ref}
          contentContainerStyle={styles.scrollViewContentContainer}
          onLayout={this.onLayout}
          onContentSizeChange={this.onContentSizeChange}
          onScroll={this.onScroll}
          scrollEventThrottle={16}
        >
          {this.renderSavedBookingRegion()}
          {this.renderBookingRegion()}
          {this.renderEvents()}
          {this.renderHourRows()}
          {this.renderMinuteHand()}
          {this.renderBookingStartButtons()}
          {this.renderPeriodChangeButton()}
        </ScrollView>
        {bookingPeriodBar}
      </View>
    );
  }




  componentDidUpdate() {
    let { updateBookButton } = this.props;
    updateBookButton && updateBookButton(this.bookingAvailable);
  }

}

DayView.propTypes = {
  roomsDataLoaded: PropTypes.bool,
  bookingsDataLoaded: PropTypes.bool,
  roomId: PropTypes.string,
  bookingId: PropTypes.string,
  roomBookings: PropTypes.array,
  dateTime: PropTypes.object.isRequired,
  period: PropTypes.number.isRequired,
  timeZone: PropTypes.string,
  timeFormat: PropTypes.oneOf([ 12, 24 ]),
  onBookingStartTimeChange: PropTypes.func,
  onPeriodChange: PropTypes.func,
  updateBookButton: PropTypes.func,
  editing: PropTypes.bool,
};

DayView.defaultProps = {
  timeZone: SharedConstants.propertiesTimeZone,
  timeFormat: 12,
};

DayView.contextTypes = {
  showToast: PropTypes.func,
};




const styles = StyleSheet.create({
  loadingSpinnerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinnerView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Canvas1Color,
    borderRadius: 25,
    width: LoadingSpinnerViewSize,
    height: LoadingSpinnerViewSize,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0, },
        shadowOpacity: 0.25,
        shadowRadius: 1.5,
      },
      android: (Platform.Version < 21) ? {
        borderColor: Border1Color,
        borderWidth: StyleSheet.hairlineWidth,
      } : {
        elevation: 4,
      },
    }),
  },
  loadingSpinner: {
    width: 27,
    height: 27,
  },


  wrapperView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  scrollViewContentContainer: {
    paddingRight: PaddingRight,
    paddingBottom: 8,
    backgroundColor: Canvas1Color,
  },


  savedBookingRegion: {
    position: 'absolute',
    left: HourLabelWidth,
    right: PaddingRight,
    paddingVertical: BookingRegionTopOffset,
    backgroundColor: 'transparent',
  },


  bookingRegionWrapperView: {
    position: 'absolute',
    left: HourLabelWidth,
    right: PaddingRight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingVertical: BookingRegionTopOffset,
  },
  bookingRegion: {
    backgroundColor: 'rgba(35, 179, 246, 0.35)',
    borderColor: Colors.blueGrey500,
    borderStyle: 'dashed',
    borderRadius: 1,
    borderWidth: 1.5,
  },


  eventsLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    paddingRight: 16,
  },
  eventView: {
    position: 'absolute',
    left: HourLabelWidth,
    right: PaddingRight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 4
  },
  eventLabelText: {
    flex: 1,
    fontSize: 12,
    color: WhiteTextColor,
  },


  hourRowsLayer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: -HourLabelTopOffset,
  },
  hourRow: {
    height: HourHeight,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  hourLabelView: {
    width: HourLabelWidth,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  hourLabelText: {
    top: HourLabelTopOffset,
    fontSize: 14,
    fontWeight: '100',
    color: Colors.grey600,
  },
  hourBlock: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderTopColor: Colors.grey200,
    borderTopWidth: 1,
  },
  topHalfHourBlock: {
    height: HalfHourHeight - 1,
  },
  bottomHalfHourBlock: {
    height: HalfHourHeight,
    overflow: 'hidden',
  },
  halfHourBlockWithDashedBorder: {
    ...Platform.select({
      ios: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 0,
        borderColor: Colors.grey200,
        borderStyle: 'dashed',
        marginBottom: -2,
        marginLeft: -2,
        marginRight: -2,
      },
      android: {
        flex: 1,
      },
    }),
  },


  minuteHandWrapperView: {
    position: 'absolute',
    left: HourLabelWidth - MinuteHandHeight - 4,
    right: PaddingRight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  minuteHandCircle: {
    width: MinuteHandHeight,
    height: MinuteHandHeight,
    borderRadius: MinuteHandHeight / 2,
    backgroundColor: Colors.deepOrange500,
  },
  minuteHandLine: {
    flex: 1,
    top: -(MinuteHandHeight + MinuteHandLineHeight) / 2,
    height: MinuteHandLineHeight,
    marginLeft: MinuteHandHeight,
    backgroundColor: Colors.deepOrange500,
  },


  bookingStartButtonsLayer: {
    position: 'absolute',
    left: HourLabelWidth,
    right: PaddingRight,
    top: -HourLabelTopOffset,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  bookingStartButton: {
    height: HalfHourHeight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: 'transparent', // not working without it in Android
  },


  periodChangeButtonWrapperView: {
    position: 'absolute',
    left: HourLabelWidth,
    right: PaddingRight,
    height: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  periodChangeButton: {
    height: PeriodChangeButtonHeight,
    width: PeriodChangeButtonHeight * 2,
    alignSelf: 'center',
    backgroundColor: 'transparent', // not working without it in Android
  },
});

const SingleColorSpinner = MKSpinner.singleColorSpinner()
  .withStyle(styles.loadingSpinner)
  .build();




export default createContainer(props => {
  if (!props.editing) {
    return {
      bookingsDataLoaded: true,
    };
  }

  if (!props.roomsDataLoaded) {
    return {
      bookingsDataLoaded: false,
      roomBookings: [],
    };
  }

  const user = Meteor.user();
  if (!user) {
    return {
      bookingsDataLoaded: true,
      roomBookings: [],
    };
  }

  let utcTimeStart = props.dateTime.clone().hours(0).minutes(0).seconds(0).tz('UTC').toDate();
  let utcTimeEnd = props.dateTime.clone().hours(23).minutes(59).seconds(59).tz('UTC').toDate();
  let options = {
    roomsIds: [props.roomId],
    utcTimeStart,
    utcTimeEnd,
  };

  const subscriptionHandle = Meteor.subscribe('bookings', options);

  let roomBookings = [];
  if (subscriptionHandle.ready()) {
    roomBookings = Meteor.collection('bookings').find({
      roomId: props.roomId,
      cancelled: { $ne: true },
      $or: [
        { startDate: { $gte: utcTimeStart, $lt: utcTimeEnd }},
        { endDate: { $gt: utcTimeStart, $lte: utcTimeEnd }},
        { startDate: { $lte: utcTimeStart }, endDate: { $gte: utcTimeEnd }}
      ]
    });
  }

  return {
    bookingsDataLoaded: subscriptionHandle.ready(),
    roomBookings,
  };
}, DayView);
