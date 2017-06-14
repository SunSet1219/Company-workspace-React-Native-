
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  DatePickerIOS,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Theme from '../theme';

const { Canvas1Color, Border1Color, AccentColorNew, Canvas1ColorNew } = Theme.Palette;
const { ActionButtonLabelFontSizeNew } = Theme.Font;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class DateTimePicker extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dateTime: props.initialDateTime.toDate(),
      showPickerModal: false,
    };

    this.showPickerModal = this.showPickerModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleModalInnerViewTouch = this.handleModalInnerViewTouch.bind(this);
    this.handleModalOuterViewTouch = this.handleModalOuterViewTouch.bind(this);

    this.innerViewTouched = false;
  }




  showPickerModal() {
    if (this.props.disabled) { return; }

    this.setState({
      dateTime: this.props.initialDateTime.toDate(),
      showPickerModal: true,
    });
  }




  handleSubmit() {
    const { initialDateTime, onDateTimeChange } = this.props;
    const { dateTime } = this.state;

    const localTimeZoneOffset = -(dateTime.getTimezoneOffset());
    const propertyTimeZoneOffset = initialDateTime.utcOffset();
    const timeZoneDifference = localTimeZoneOffset - propertyTimeZoneOffset;
    let dateTimeClone = new Date(dateTime.getTime());
    dateTimeClone.setMinutes(dateTimeClone.getMinutes() - timeZoneDifference);

    const newDateTime = initialDateTime.clone()
      .year(dateTimeClone.getFullYear())
      .month(dateTimeClone.getMonth())
      .date(dateTimeClone.getDate())
      .hours(dateTimeClone.getHours())
      .minutes(dateTimeClone.getMinutes())
      .seconds(0)
      .milliseconds(0);

    onDateTimeChange && onDateTimeChange(newDateTime);

    this.setState({ showPickerModal: false });
  }




  handleCancel() {
    this.setState({ showPickerModal: false });
  }




  handleModalInnerViewTouch() {
    this.innerViewTouched = true;
    return false;
  }




  handleModalOuterViewTouch() {
    if (this.innerViewTouched) this.innerViewTouched = false;
    else this.handleCancel();
    return false;
  }




  render() {
    const { state, props } = this;


    const actionButtonsBar = (
      <View style={styles.actionButtonsBar}>
        <TouchableOpacity
          activeOpacity={0.3}
          hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
          onPress={this.handleSubmit}
        >
          <Text style={styles.actionButtonText}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    );


    const pickerModal = (
      <Modal
        animationType='slide'
        onRequestClose={this.handleCancel}
        supportedOrientations={['portrait']}
        transparent={true}
        visible={state.showPickerModal}
      >
        <View
          onStartShouldSetResponder={this.handleModalOuterViewTouch}
          style={styles.modalOuterView}
        >
          <View
            onStartShouldSetResponder={this.handleModalInnerViewTouch}
            style={styles.modalInnerView}
          >
            {actionButtonsBar}
            <DatePickerIOS
              date={state.dateTime}
              minuteInterval={30}
              mode={props.mode}
              onDateChange={dateTime => this.setState({ dateTime })}
              timeZoneOffsetInMinutes={props.initialDateTime.utcOffset()}
            />
          </View>
        </View>
      </Modal>
    );


    return (
      <TouchableOpacity
        activeOpacity={props.disabled ? 1 : 0.3}
        onPress={this.showPickerModal}
        style={props.style}
      >
        {props.children}
        {pickerModal}
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




const styles = StyleSheet.create({
  modalOuterView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  modalInnerView: {
    height: 265,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: Canvas1Color,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -0.5 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
  },
  actionButtonsBar: {
    height: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 11,
    backgroundColor: Canvas1ColorNew,
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
  },
  actionButtonText: {
    fontSize: ActionButtonLabelFontSizeNew,
    color: AccentColorNew,
    fontWeight: '500',
  },
});


export default DateTimePicker;
