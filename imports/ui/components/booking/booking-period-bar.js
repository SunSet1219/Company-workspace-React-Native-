
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { Canvas1Color, TextColor } = Theme.Palette;
const { TextFontSize } = Theme.Font;
const { NavigationBarHeight } = UISharedConstants;
const { Periods } = SharedConstants;
const MinPeriod = Periods[0].value;
const MaxPeriod = Periods[Periods.length - 2].value;
const PeriodInterval = 30;





const BookingPeriodBar = (props) => {

  let increasePeriod = () => {
    let { period, onPeriodChange } = props;
    let nextPeriod = period + PeriodInterval;
    if (nextPeriod > MaxPeriod) { nextPeriod = MaxPeriod; }
    onPeriodChange(nextPeriod);
  };



  let decreasePeriod = () => {
    let { period, onPeriodChange } = props;
    let nextPeriod = period - PeriodInterval;
    if (nextPeriod < MinPeriod) { nextPeriod = MinPeriod; }
    onPeriodChange(nextPeriod);
  };



  let renderBookingInterval = () => {
    let { dateTime, period } = props;

    let periodItem = Periods.find(item => item.value === period) || {};
    let periodLabel = periodItem.label || '';

    let format = 'HH:mm A';
    let startTimeText = dateTime.clone().format(format);
    let endTimeText = dateTime.clone().add(period, 'minutes').format(format);

    return (
      <View style={styles.bookingIntervalView}>
        <Text style={styles.periodText}>
          {periodLabel}
        </Text>
        <Text style={styles.startEndTimeText}>
          {startTimeText} - {endTimeText}
        </Text>
      </View>
    )
  };



  let decreasePeriodButton = (
    <TouchableOpacity
      onPress={decreasePeriod}
      style={styles.decreasePeriodButton}
    >
      <Icon
        name='remove'
        size={28}
        color={TextColor}
      />
    </TouchableOpacity>
  );



  let increasePeriodButton = (
    <TouchableOpacity
      onPress={increasePeriod}
      style={styles.increasePeriodButton}
    >
      <Icon
        name='add'
        size={28}
        color={TextColor}
      />
    </TouchableOpacity>
  );



  return (
    <View style={styles.wrapperView}>
      {decreasePeriodButton}
      {renderBookingInterval()}
      {increasePeriodButton}
    </View>
  );

};

BookingPeriodBar.propTypes = {
  dateTime: PropTypes.object.isRequired,
  period: PropTypes.number.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
};




const styles = StyleSheet.create({
  wrapperView: {
    height: NavigationBarHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Canvas1Color,
  },
  increasePeriodButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  decreasePeriodButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  periodText: {
    fontSize: TextFontSize,
    color: TextColor,
    fontWeight: 'bold',
  },
  bookingIntervalView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startEndTimeText: {
    fontSize: 14,
    color: TextColor,
  },
});


export default BookingPeriodBar;
