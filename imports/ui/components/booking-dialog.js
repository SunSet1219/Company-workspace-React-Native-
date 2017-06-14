
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { MKProgress, MKTextField } from '../material-ui';
import AddInvitees from './add-invitees';
import CurrentUserDataView from './current-user-data-view';
import dateHelper from '../helpers/date-helper';
import DropdownMenu from './dropdown-menu';
import FlatButton from './flat-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor from 'baryshok-react-native-meteor';
import moment from '../../api/unpackaged-improvements/moment';
import optionsHelper from '../helpers/options-helper';
import SharedConstants from '../../api/constants/shared';
import SubsceneWrapper from './subscene-wrapper';
import Theme from '../theme';
import validationHelper from '../helpers/validationHelper';

const { TextInputTintColor, TextInputErrorColor, SuccessIconColor, ErrorIconColor } = Theme.Palette;
const { TextColor, FlatActionButtonLabelColor } = Theme.Palette;
const { MenuFontSize, HeaderFontSize, TextInputFontSize, TextInputErrorFontSize } = Theme.Font;
const { SubmissionResponseFontSize, ActionButtonLabelFontSize } = Theme.Font;

const SubmissionAniDurationMS = 2000;
const SubmissionTimeoutMS = 10000;
const SubmissionTimeoutError = new Error('Submission timed out. Please try again');
const DefaultSubmissionError = new Error('Unable to book at this time.\nPlease try again later');




class BookingDialog extends Component {

  constructor(props) {
    super(props);

    let userCompaniesOptions = optionsHelper.getUserCompaniesOptions(Meteor.user(), props.companies);
    let companyId = userCompaniesOptions && userCompaniesOptions[0] && userCompaniesOptions[0].id;

    this.state = {
      companyId,
      inviteeEmails: [],

      bookingTitle: '',
      bookingTitleValidated: false,
      bookingTitleError: ' ',

      submissionResponseText: '',
      submitting: false,
      submitted: false,
    };

    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);
    this.handleUserCompanyChange = this.handleUserCompanyChange.bind(this);
    this.canSubmit = this.canSubmit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.keyboardAwareScrollViewTextInputs = [];

    this.bookingTitleInputView = null;
    this.bookingTitleTextInput = null;

    this.bookingTitleInputEdited = false;

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




  registerInKeyboardAwareScrollView(item) {
    this.keyboardAwareScrollViewTextInputs.push(item);
  }




  getCurrentUserEmail() {
    let user = Meteor.user();
    if (!user) { return; }

    let emails = user.emails;
    let email = emails && emails[0] && emails[0].address;
    return email;
  }




  handleUserCompanyChange(item, index) {
    this.setState({ companyId: item.id });
  }




  canSubmit() {
    return Boolean(
      this.state.bookingTitleValidated ||
      !this.state.submitting ||
      !this.submissionSucceeded
    );
  }




  handleSubmit() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to book while in Offline mode.\n' +
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

      let { room, properties } = this.props;
      let bookingIntervalUTC = this.props.bookingIntervalUTC;
      let roomPropertyTimeZone = dateHelper.getRoomPropertyTimeZone(room, properties);
      let start = bookingIntervalUTC.startDateTimeUTC.tz(roomPropertyTimeZone).toDate();
      let end = bookingIntervalUTC.endDateTimeUTC.tz(roomPropertyTimeZone).toDate();

      let email = this.getCurrentUserEmail();

      let options = {
        roomId: this.props.room._id,
        title: this.state.bookingTitle,
        start: { dateTime: start, timeZone: roomPropertyTimeZone },
        end: { dateTime: end, timeZone: roomPropertyTimeZone },
        attendees: [
          {
            email: email,
            organiser: true,
          },
          ...this.state.inviteeEmails,
        ],
        creator: email,
      };

      if (this.state.companyId) { options.companyId = this.state.companyId; }

      Meteor.call('bookRoomV002', options, (error) => {
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
        console.warn('[Error][BookingDialog.handleSubmit]', reason);
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

      let submissionResponseText = (
        'Your booking has been confirmed. ' +
        'Please check your email for details. ' +
        'You can modify and see the status of your booking in your profile.'
      );

      this.submissionSucceeded = true;
      this.setState({
        submissionResponseText,
        submitting: false,
        submitted: true,
      });
    };


    let onFailure = (error) => {
      if (!this.mounted) { return; }

      let submissionResponseText = 'Booking failed.';
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




  getPeriodLabelByValue(value) {
    let index = SharedConstants.Periods.findIndex(item => item.value === value);
    if (index === -1) { return ''; }

    let label = SharedConstants.Periods[index].label;
    if (label.substr(-4) === 'mins') {
      label = label.slice(0, -4) + 'minutes';
    }
    return label;
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let { room, properties, companies, bookingIntervalUTC } = this.props;
    let state = this.state;


    let roomPropertyTimeZone = dateHelper.getRoomPropertyTimeZone(room, properties);
    let formattedDateTime = (
      bookingIntervalUTC.startDateTimeUTC.tz(roomPropertyTimeZone).format('dddd, MMMM Do [at] h:mm a') +
      ' ' + moment.tz(roomPropertyTimeZone).zoneAbbr()
    );

    let headerText = (
      <Text style={styles.headerText}>
        {`Booking ${room.name} for ${formattedDateTime} for ${this.getPeriodLabelByValue(bookingIntervalUTC.period)}`}
      </Text>
    );


    let currentUserDataView = (
      <CurrentUserDataView
        style={styles.currentUserDataView}
      />
    );


    let editable = !state.submitting && !this.submissionSucceeded;

    let bookingTitleInputView = (
      <View
        ref={ref => this.bookingTitleInputView = ref}
        onLayout={() => {
          if (this.bookingTitleInputView && this.bookingTitleTextInput) {
            this.registerInKeyboardAwareScrollView({
              view: this.bookingTitleInputView,
              textInput: this.bookingTitleTextInput
            });
          }
        }}
        style={styles.bookingTitleInputView}
      >
        <MKTextField
          ref={ref => this.bookingTitleTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={editable}
          onTextChange={(text) => {
            if (!this.bookingTitleInputEdited) { this.bookingTitleInputEdited = true; }
            let validationResult = validationHelper.isRequiredFieldNotEmpty(text, 'Title');
            this.setState({
              bookingTitle: text,
              bookingTitleValidated: validationResult.validated,
              bookingTitleError: validationResult.error
            });
          }}
          placeholder='Booking title'
          returnKeyType='done'
          style={styles.textInputView}
          value={state.bookingTitle}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={(
            !state.bookingTitleValidated &&
            this.bookingTitleInputEdited
          ) ? TextInputErrorColor : null}
          tintColor={(
            !state.bookingTitleValidated &&
            this.bookingTitleInputEdited
          ) ? TextInputErrorColor : null}
          textInputStyle={
            editable ? styles.textInput : styles.disabledTextInput
          }
        />
        <Text style={
          !state.bookingTitleValidated && this.bookingTitleInputEdited ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {state.bookingTitleError}
        </Text>
      </View>
    );


    let addInviteesView = (
      <AddInvitees
        disabled={!editable}
        existingEmail={this.getCurrentUserEmail()}
        onChange={(inviteeEmails) => {this.setState({ inviteeEmails })}}
        registerInKeyboardAwareScrollView={this.registerInKeyboardAwareScrollView}
      />
    );


    let userCompaniesOptions = optionsHelper.getUserCompaniesOptions(Meteor.user(), companies);
    let userCompaniesSelectedIndex = userCompaniesOptions.findIndex(item => item.id === state.companyId);
    if (userCompaniesSelectedIndex === -1) { userCompaniesSelectedIndex = 0; }

    let userCompaniesDropdownMenu = userCompaniesOptions.length > 1 ? (
      <DropdownMenu
        menuItems={userCompaniesOptions}
        selectedIndex={userCompaniesSelectedIndex}
        onChange={this.handleUserCompanyChange}
        fontSize={MenuFontSize}
        style={styles.userCompaniesDropdownMenu}
      />
    ) : null;


    let submissionResponseView = state.submitted ? (
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
    ) : null;


    let actionButtonsView = state.submitted ? (
      <View style={styles.actionButtonsView}>
        <FlatButton
          label='OK'
          labelStyle={styles.actionButtonsLabel}
          onPress={() => {
            let routeStackLength = this.context.navigationTracker.getRouteStackLength();
            if (routeStackLength > 2) {
              Actions.pop({ popNum: routeStackLength - 1 });
            } else { Actions.pop(); }
          }}
          primary={true}
          style={styles.actionButton}
        />
      </View>
    ) : (
      <View style={styles.actionButtonsView}>
        <FlatButton
          disabled={state.submitting}
          label='CANCEL'
          labelStyle={styles.actionButtonsLabel}
          onPress={Actions.pop}
          primary={true}
          style={styles.actionButton}
        />
        <FlatButton
          disabled={!this.canSubmit()}
          label='BOOK'
          labelStyle={styles.actionButtonsLabel}
          onPress={this.handleSubmit}
          primary={true}
          style={styles.actionButton}
        />
      </View>
    );


    let progressBarView = state.submitting ? (
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
        {currentUserDataView}
        {bookingTitleInputView}
        {userCompaniesDropdownMenu}
        {addInviteesView}
        {submissionResponseView}
        {actionButtonsView}
        {progressBarView}
      </SubsceneWrapper>
    );
  }

}

BookingDialog.propTypes = {
  room: PropTypes.object.isRequired,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  bookingIntervalUTC: PropTypes.object.isRequired,
};

BookingDialog.contextTypes = {
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const styles = StyleSheet.create({
  headerText: {
    fontSize: HeaderFontSize,
    lineHeight: 36,
    color: TextColor,
    marginBottom: 16,
  },
  currentUserDataView: {
    marginTop: 16,
    marginBottom: 20,
    marginLeft: 8,
    marginRight: 24,
  },
  bookingTitleInputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    marginBottom: 16,
  },
  textInputView: {
    height: 48,
  },
  textInput: {
    fontSize: TextInputFontSize,
    color: TextColor,
  },
  disabledTextInput: {
    fontSize: TextInputFontSize,
    color: TextInputTintColor,
  },
  inputValidatedText: {
    fontSize: TextInputErrorFontSize,
    color: 'transparent',
    marginTop: 3,
    marginBottom: 1,
  },
  inputErrorText: {
    fontSize: TextInputErrorFontSize,
    color: TextInputErrorColor,
    marginTop: 3,
    marginBottom: 1,
  },
  submissionResponseView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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
  userCompaniesDropdownMenu: {
    marginTop: -10,
    marginBottom: 20,
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
});


export default BookingDialog;
