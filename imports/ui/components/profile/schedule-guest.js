
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { Duration } from '../snackbar';
import { MKProgress, MKTextField } from '../../material-ui';
import DateTimePicker from '../date-time-picker';
import FlatButton from '../flat-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InviteeView from '../invitee-view';
import Meteor from 'baryshok-react-native-meteor';
import moment from '../../../api/unpackaged-improvements/moment';
import RaisedButton from '../raised-button';
import SharedConstants from '../../../api/constants/shared';
import SubsceneWrapper from '../subscene-wrapper';
import Theme from '../../theme';
import validationHelper from '../../helpers/validationHelper';

const { Primary1Color, Border1Color, TextColor } = Theme.Palette;
const { TextInputTintColor, TextInputErrorColor, SuccessIconColor, ErrorIconColor } = Theme.Palette;
const { RaisedDisabledButton2Color, RaisedDisabledButtonLabel2Color, FlatActionButtonLabelColor } = Theme.Palette;
const { HeaderFontSize, SubmissionResponseFontSize, TextFontSize, ActionButtonLabelFontSize } = Theme.Font;
const { TextInputFontSize, TextInputErrorFontSize } = Theme.Font;

const FontSize = TextInputFontSize;
const PickerViewHeight = FontSize * 2;

const SubmissionAniDurationMS = 2000;
const SubmissionTimeoutMS = 10000;
const SubmissionTimeoutError = new Error('Submission timed out. Please try again');
const DefaultSubmissionError = new Error('Unable to schedule at this time.\nPlease try again later');




class ScheduleGuest extends Component {

  constructor(props) {
    super(props);

    this.state = {
      guests: [],

      name: '',
      nameValidated: true,
      nameError: ' ',

      email: '',
      emailValidated: true,
      emailError: ' ',

      notes: '',

      arrivalDateTime: moment().tz(SharedConstants.propertiesTimeZone),
      arrivalDateSet: false,
      arrivalTimeSet: false,

      submissionResponseText: '',
      submitting: false,
      submitted: false,
    };

    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleAddGuestPress = this.handleAddGuestPress.bind(this);
    this.handleRemoveGuestPress = this.handleRemoveGuestPress.bind(this);
    this.renderGuests = this.renderGuests.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleScheduleMoreGuestsPress = this.handleScheduleMoreGuestsPress.bind(this);

    this.keyboardAwareScrollViewTextInputs = [];

    this.nameTextInputView = null;
    this.nameTextInput = null;

    this.emailTextInputView = null;
    this.emailTextInput = null;

    this.notesTextInputView = null;
    this.notesTextInput = null;

    this.submissionAniTimeout = null;
    this.submissionTimeout = null;

    this.submissionSucceeded = false;

    this.mounted = false;
  }




  componentDidMount() {
    this.mounted = true;
  }




  componentWillUnmount() {
    this.submissionTimeout && clearTimeout(this.submissionTimeout);
    this.submissionAniTimeout && clearTimeout(this.submissionAniTimeout);

    this.mounted = false;
  }




  registerInKeyboardAwareScrollView(view, textInput) {
    if (view && textInput) {
      this.keyboardAwareScrollViewTextInputs.push({ view, textInput });
    }
  }




  handleDateChange(dateTime) {
    this.setState({
      arrivalDateTime: dateTime,
      arrivalDateSet: true,
    });
  }




  handleTimeChange(dateTime) {
    let minutes = dateTime.minutes();
    let roundedDateTime = dateTime.clone()
      .minutes(minutes > 30 ? (minutes > 45 ? 60 : 30) : (minutes > 15 ? 30 : 0));

    this.setState({
      arrivalDateTime: roundedDateTime,
      arrivalTimeSet: true,
    });
  }




  handleAddGuestPress() {
    let name = this.state.name.trim();
    let email = this.state.email.trim().toLowerCase();
    let notes = this.state.notes.trim();
    let arrivalDateTime = this.state.arrivalDateTime.clone().utc().format();

    let guests = this.state.guests.slice();
    let guestAlreadyAdded = guests.some(guest => guest.email === email);
    if (guestAlreadyAdded) {
      return this.context.showSnackbar({
        message: 'Guest with this email has already been added',
        duration: Duration.Short,
      });
    }
    guests.push({ name, email, notes, arrivalDateTime });

    Keyboard.dismiss();
    this.setState({
      guests,
      name: '',
      email: '',
      notes: '',
      arrivalDateSet: false,
      arrivalTimeSet: false,
    });
  }




  handleRemoveGuestPress(index) {
    let guests = this.state.guests.slice();
    guests.splice(index, 1);
    this.setState({ guests });
  }




  renderGuests() {
    let guestViews = this.state.guests.map((item, i) => {
      return (
        <InviteeView
          key={i}
          index={i}
          label={item.name}
          onRemove={this.handleRemoveGuestPress}
        />
      );
    });

    return (
      <View style={styles.guestsView}>
        {guestViews}
      </View>
    );
  }




  handleSubmit() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to invite while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }


    let submit = new Promise((resolve, reject) => {
      if (!this.mounted) { return; }

      this.submissionSucceeded = false;
      this.setState({
        submitted: false,
        submitting: true,
      });

      Meteor.call('addGuest', this.state.guests, (error) => {
        if (error) { return resolve(error); }
        return resolve();
      });
    });


    let submissionAnimation = new Promise((resolve, reject) => {
      this.submissionAniTimeout = setTimeout(resolve, SubmissionAniDurationMS);
    });


    let submission = new Promise((resolve, reject) => {
      Promise.all([ submit, submissionAnimation ]).then(values => {
        let submissionError = values[0];
        if (submissionError) { return reject(submissionError); }
        return resolve();
      }).catch(reason => {
        console.warn('[Error][ScheduleGuest.handleSubmit]', reason);
        return reject(DefaultSubmissionError);
      });
    });


    let submissionTimeout = new Promise((resolve, reject) => {
      this.submissionTimeout = setTimeout(() => {
        return reject(SubmissionTimeoutError);
      }, SubmissionTimeoutMS);
    });


    let onSuccess = () => {
      if (!this.mounted) { return; }

      let submissionResponseText = this.state.guests.length > 1 ?
        'Guests have been successfully scheduled' :
        'Guest has been successfully scheduled';

      this.submissionSucceeded = true;
      this.setState({
        submissionResponseText,
        submitting: false,
        submitted: true,
      });
    };


    let onFailure = (error) => {
      if (!this.mounted) { return; }

      let submissionResponseText = this.state.guests.length > 1 ?
        'Failed to schedule guests' :
        'Failed to schedule a guest';

      if (error) { submissionResponseText += '\n' + (error.reason || error.message); }

      this.submissionSucceeded = false;
      this.setState({
        submissionResponseText,
        submitting: false,
        submitted: true,
      });
    };


    Promise.race([ submission, submissionTimeout ]).then(onSuccess, onFailure).catch(onFailure);
  }




  handleScheduleMoreGuestsPress() {
    this.setState({
      guests: [],
      submitted: false,
    })
  }




  render() {
    let headerText = (
      <Text style={styles.headerText}>
        Schedule a guest
      </Text>
    );


    let editable = !this.state.submitting && !this.state.submitted;

    let nameInputView = (
      <View
        ref={ref => this.nameTextInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.nameTextInputView,
            this.nameTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.nameTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={editable}
          keyboardType='default'
          onSubmitEditing={() => {
            this.emailTextInput &&
            this.emailTextInput.focus();
          }}
          onTextChange={(text) => {
            let validationResult = validationHelper.isRequiredFieldNotEmpty(text, 'Guest Name');
            this.setState({
              name: text,
              nameValidated: validationResult.validated,
              nameError: validationResult.error,
            });
          }}
          placeholder='Guest Name'
          returnKeyType='next'
          style={styles.textInputView}
          value={this.state.name}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.nameValidated ? TextInputErrorColor : null}
          tintColor={!this.state.nameValidated ? TextInputErrorColor : null}
          textInputStyle={editable ? styles.textInput : styles.disabledTextInput}
        />
        <Text style={styles.inputErrorText}>
          {this.state.nameError}
        </Text>
      </View>
    );


    let emailInputView = (
      <View
        ref={ref => this.emailTextInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.emailTextInputView,
            this.emailTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.emailTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={editable}
          keyboardType='email-address'
          onTextChange={(text) => {
            let validationResult = validationHelper.isRequiredFieldEmail(text);
            this.setState({
              email: text,
              emailValidated: validationResult.validated,
              emailError: validationResult.error,
            });
          }}
          placeholder='Email'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.email}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.emailValidated ? TextInputErrorColor : null}
          tintColor={!this.state.emailValidated ? TextInputErrorColor : null}
          textInputStyle={editable ? styles.textInput : styles.disabledTextInput}
        />
        <Text style={styles.inputErrorText}>
          {this.state.emailError}
        </Text>
      </View>
    );


    let notesInputView = (
      <View
        ref={ref => this.notesTextInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.notesTextInputView,
            this.notesTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.notesTextInput = ref}
          autoCapitalize='sentences'
          autoCorrect={false}
          editable={editable}
          onTextChange={text => this.setState({ notes: text })}
          multiline={true}
          placeholder='Guest Notes'
          style={styles.notesTextInputView}
          value={this.state.notes}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          textInputStyle={!editable ? styles.notesTextInput : styles.notesDisabledTextInput}
        />
      </View>
    );


    let datePicker = (
      <DateTimePicker
        disabled={!editable}
        initialDateTime={this.state.arrivalDateTime}
        mode='date'
        onDateTimeChange={this.handleDateChange}
        style={styles.pickerViewWithMarginRight}
      >
        {
          this.state.arrivalDateSet ? (
            <Text style={editable ? styles.dateTimePickerText : styles.disabledDateTimePickerText}>
              {this.state.arrivalDateTime.format('YYYY-MM-DD')}
            </Text>
          ) : (
            <Text style={styles.dateTimePickerPlaceholderText}>
              Arrival date
            </Text>
          )
        }
      </DateTimePicker>
    );


    let timePicker = (
      <DateTimePicker
        disabled={!editable}
        initialDateTime={this.state.arrivalDateTime}
        mode='time'
        onDateTimeChange={this.handleTimeChange}
        style={styles.pickerViewWithMarginLeft}
      >
        {
          this.state.arrivalTimeSet ? (
            <Text style={editable ? styles.dateTimePickerText : styles.disabledDateTimePickerText}>
              {this.state.arrivalDateTime.format('h:mm a z')}
            </Text>
          ) : (
            <Text style={styles.dateTimePickerPlaceholderText}>
              Arrival time
            </Text>
          )
        }
      </DateTimePicker>
    );


    let arrivalDateAndTimeInput = (
      <View style={styles.settingsGroupView}>
        <View style={styles.settingsGroupLabelView}>
          <Text style={styles.settingsGroupLabelText}>
            Guest arrival date and time
          </Text>
        </View>
        <View style={styles.arrivalDateAndTimeItemsWrapperView}>
          {datePicker}
          {timePicker}
        </View>
      </View>
    );


    let canAddGuest = Boolean(
      this.state.name &&
      this.state.nameValidated &&
      this.state.email &&
      this.state.emailValidated &&
      this.state.arrivalDateSet &&
      this.state.arrivalTimeSet
    );


    let addIcon = (
      <Icon
        name='add'
        size={28}
        color='white'
        style={styles.addIcon}
      />
    );


    let addGuestButton = (
      <RaisedButton
        disabled={!canAddGuest}
        disabledBackgroundColor={RaisedDisabledButton2Color}
        disabledLabelColor={RaisedDisabledButtonLabel2Color}
        icon={addIcon}
        label='Add Guest'
        labelStyle={styles.addGuestButtonText}
        onPress={this.handleAddGuestPress}
        primary={true}
        style={styles.addGuestButton}
      />
    );


    let submissionResponseView = (
      <View style={styles.submissionResponseView}>
        <Icon
          name={this.submissionSucceeded ? 'done' : 'clear'}
          size={28}
          color={this.submissionSucceeded ? SuccessIconColor : ErrorIconColor}
          style={styles.submissionResponseIcon}
        />
        <Text style={styles.submissionResponseText}>
          {this.state.submissionResponseText}
        </Text>
      </View>
    );


    let actionButtonsView = this.state.submitted && this.submissionSucceeded ? (
      <View style={styles.actionButtonsView}>
        <FlatButton
          label='MORE GUESTS'
          labelStyle={styles.actionButtonsLabel}
          onPress={this.handleScheduleMoreGuestsPress}
          primary={true}
          style={styles.moreButton}
        />
        <FlatButton
          label='CLOSE'
          labelStyle={styles.actionButtonsLabel}
          onPress={Actions.pop}
          primary={true}
          style={styles.actionButton}
        />
      </View>
    ) : (
      <View style={styles.actionButtonsView}>
        <FlatButton
          disabled={this.state.submitting}
          label='CANCEL'
          labelStyle={styles.actionButtonsLabel}
          onPress={() => {
            this.context.hideSnackbar();
            Actions.pop();
          }}
          primary={true}
          style={styles.actionButton}
        />
        <FlatButton
          disabled={this.state.submitting || !this.state.guests.length}
          label='SUBMIT'
          labelStyle={styles.actionButtonsLabel}
          onPress={this.handleSubmit}
          primary={true}
          style={styles.actionButton}
        />
      </View>
    );


    let progressBarView = this.state.submitting ? (
      <MKProgress.Indeterminate
        progressAniDuration={480}
        progressColor='white'
      />
    ) : null;


    return (
      <SubsceneWrapper
        keyboardAwareScrollViewTextInputs={this.keyboardAwareScrollViewTextInputs}
      >
        {headerText}
        {nameInputView}
        {arrivalDateAndTimeInput}
        {emailInputView}
        {notesInputView}
        {addGuestButton}
        {this.state.submitted ? submissionResponseView : this.renderGuests()}
        {actionButtonsView}
        {progressBarView}
      </SubsceneWrapper>
    );
  }

}

ScheduleGuest.contextTypes = {
  showSnackbar: PropTypes.func,
  hideSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  headerText: {
    fontSize: HeaderFontSize,
    lineHeight: 36,
    color: TextColor,
    marginBottom: 16,
  },
  inputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  textInputView: {
    height: 48,
  },
  notesTextInputView: {
    height: 125,
  },
  textInput: {
    fontSize: FontSize,
    color: TextColor,
  },
  notesTextInput: {
    fontSize: FontSize,
    color: TextColor,
    textAlignVertical : 'top',
  },
  disabledTextInput: {
    fontSize: FontSize,
    color: TextInputTintColor,
  },
  notesDisabledTextInput: {
    fontSize: FontSize,
    color: TextInputTintColor,
    textAlignVertical : 'top',
  },
  inputErrorText: {
    fontSize: TextInputErrorFontSize,
    color: TextInputErrorColor,
    marginTop: 3,
    marginBottom: 1,
  },
  guestsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  addIcon: {
    marginLeft: -5,
    marginRight: -5,
  },
  addGuestButton: {
    height: 36,
    width: 130,
    marginVertical: 24,
  },
  addGuestButtonText: {
    fontSize: ActionButtonLabelFontSize,
    color: 'white',
  },
  submissionResponseView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 20,
  },
  submissionResponseIcon: {
    marginTop: -4.5,
    marginRight: 4,
  },
  submissionResponseText: {
    flex: 1,
    fontSize: SubmissionResponseFontSize,
    color: TextColor,
  },
  actionButtonsView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  actionButtonsLabel: {
    fontSize: ActionButtonLabelFontSize,
    fontWeight: '500',
    color: FlatActionButtonLabelColor,
  },
  actionButton: {
    height: 36,
    width: 100,
  },
  moreButton: {
    height: 36,
    width: 150,
  },
  settingsGroupView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 20,
    marginBottom: 24,
  },
  settingsGroupLabelView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingBottom: 6,
  },
  settingsGroupLabelText: {
    fontSize: 13,
    color: Primary1Color,
  },
  arrivalDateAndTimeItemsWrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  pickerViewWithMarginRight: {
    height: PickerViewHeight,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
  },
  pickerViewWithMarginLeft: {
    height: PickerViewHeight,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginLeft: 8,
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
  },
  dateTimePickerPlaceholderText: {
    fontSize: FontSize,
    color: TextInputTintColor,
  },
  dateTimePickerText: {
    fontSize: FontSize,
    color: TextColor,
  },
  disabledDateTimePickerText: {
    fontSize: FontSize,
    color: TextInputTintColor,
  },
});


export default ScheduleGuest;
