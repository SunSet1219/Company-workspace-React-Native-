
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  DatePickerAndroid,
  TimePickerAndroid,
  TouchableOpacity,
} from 'react-native';




class DateTimePicker extends Component {

  constructor(props) {
    super(props);

    this.showPickerModal = this.showPickerModal.bind(this);
    this.showAndroidDatePicker = this.showAndroidDatePicker.bind(this);
    this.showAndroidTimePicker = this.showAndroidTimePicker.bind(this);
  }




  showPickerModal() {
    if (this.props.disabled) { return; }

    let { initialDateTime, mode } = this.props;

    switch (mode) {
      case 'date':
        return this.showAndroidDatePicker({ date: initialDateTime.toDate() });

      case 'time':
        return this.showAndroidTimePicker({
          hour: initialDateTime.hour(),
          minute: initialDateTime.minute(),
          is24Hour: false,
        });

      default:
        let source = 'DateTimePicker.showPickerModal';
        console.warn(`[Error][${source}] mode - case default:`, props.mode);
    }
  };




  async showAndroidDatePicker(options) {
    try {
      let { action, year, month, day } = await DatePickerAndroid.open(options);

      if (action === DatePickerAndroid.dateSetAction) {
        let { initialDateTime, onDateTimeChange } = this.props;

        let newDateTime = initialDateTime.clone()
          .year(year)
          .month(month)
          .date(day)
          .seconds(0)
          .milliseconds(0);

        onDateTimeChange && onDateTimeChange(newDateTime);
      }
    } catch ({ code, message }) {
      console.log('[Error][DateTimePicker.showAndroidDatePicker]', message);
    }
  }




  async showAndroidTimePicker(options) {
    try {
      let { action, hour, minute } = await TimePickerAndroid.open(options);

      if (action === TimePickerAndroid.timeSetAction) {
        let { initialDateTime, onDateTimeChange } = this.props;

        let newDateTime = initialDateTime.clone()
          .hours(hour)
          .minutes(minute)
          .seconds(0)
          .milliseconds(0);

        onDateTimeChange && onDateTimeChange(newDateTime);
      }
    } catch ({ code, message }) {
      console.warn('[Error][DateTimePicker.showAndroidTimePicker]', message);
    }
  }




  render() {
    const { props } = this;

    return (
      <TouchableOpacity
        activeOpacity={props.disabled ? 1 : 0.3}
        onPress={this.showPickerModal}
        style={props.style}
      >
        {props.children}
      </TouchableOpacity>
    );
  }
}

DateTimePicker.propTypes = {
  disabled: PropTypes.bool,
  initialDateTime: PropTypes.object,
  mode: PropTypes.string,
  onDateTimeChange: PropTypes.func,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number
  ]),
};

DateTimePicker.defaultProps = {
  disabled: false,
  initialDateTime: new Date(),
  mode: 'date',
  onDateTimeChange: () => {},
  style: null,
};


export default DateTimePicker;
