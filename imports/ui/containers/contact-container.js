
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { MKProgress, MKTextField } from '../material-ui';
import db from '../../api/db/realm-db';
import FlatButton from '../components/flat-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import KeyboardAwareScrollView from '../components/keyboard-aware-scroll-view';
import Meteor from 'baryshok-react-native-meteor';
import SceneWrapperWithOrientationState from './scene-wrapper-with-orientation-state';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';
import validationHelper from '../helpers/validationHelper';

const { Canvas1Color, TextColor } = Theme.Palette;
const { TextInputTintColor, TextInputErrorColor } = Theme.Palette;
const { SuccessIconColor, ErrorIconColor } = Theme.Palette;
const { TextInputFontSize, TextInputErrorFontSize } = Theme.Font;
const { SubmissionResponseFontSize, ActionButtonLabelFontSize } = Theme.Font;

const SubmissionConfirmedText = 'Thanks, we\'ll get in touch shortly.';
const SubmissionFailedText = 'Oops, something went wrong. Please try again.';

const SubmissionAniDurationMS = 2000;
const SubmissionTimeoutMS = 10000;
const DefaultSubmissionError = new Error(
  'Unable to send email at this time.\nPlease try again later'
);




class ContactContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: this.getCurrentUserEmailFromLocalDB(),
      emailValidated: false,
      emailError: ' ',

      message: '',
      messageValidated: false,
      messageError: ' ',

      opsContact: '',
      propertyTitle: '',

      submitting: false,
      submitted: false,
    };

    this.canSubmit = this.canSubmit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);

    this.keyboardAwareScrollViewTextInputs = [];
    this.messageTextInputView = null;
    this.messageTextInput = null;

    this.emailInputEdited = false;
    this.messageInputEdited = false;

    this.submissionAniTimeout = null;
    this.submissionTimeout = null;

    this.submissionSucceeded = false;

    this.mounted = false;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(SharedConstants.Scenes.Contact);
  }




  componentDidMount() {
    this.mounted = true;

    if (Meteor.userId()) { this.getUserContactFormData(); }
  }




  componentWillUnmount() {
    this.submissionTimeout && clearTimeout(this.submissionTimeout);
    this.submissionAniTimeout && clearTimeout(this.submissionAniTimeout);

    this.mounted = false;
  }




  getCurrentUserEmailFromLocalDB() {
    let currentUser = db.getCurrentUser();
    let emails = currentUser && currentUser.emails;
    let email = emails && emails[0] && emails[0].address;
    return email || '';
  }




  getUserContactFormData() {
    return new Promise((resolve, reject) => {
      Meteor.call('getUserContactFormData', (error, result) => {
        if (error) { return reject(error); }
        return resolve(result);
      });
    }).then(result => {
      if (result) {
        let email = result.userEmail;
        let validationResult = validationHelper.isRequiredFieldEmail(email);
        this.setState({
          email,
          emailValidated: validationResult.validated,
          emailError: validationResult.error,
          opsContact: result.opsContact,
          propertyTitle: result.propertyTitle,
        });
      }
    }).catch(reason => {
      console.warn('[Error][ContactContainer.getUserContactFormData]', reason);
    });
  }




  canSubmit() {
    return Boolean(
      this.state.emailValidated &&
      this.state.messageValidated &&
      !this.state.submitting &&
      !this.submissionSucceeded
    );
  }




  handleSubmit() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unablbe to send email while in Offline mode.\n' +
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

      let params = {
        from: this.state.email.trim(),
        subject: 'Knotel Help',
        text: this.state.message.trim(),
      };

      Meteor.call('contact', params, (error) => {
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
        return reject(DefaultSubmissionError);
      });
    });


    let submissionTimeout = new Promise((resolve, reject) => {
      this.submissionTimeout = setTimeout(() => {
        return reject(DefaultSubmissionError);
      }, SubmissionTimeoutMS);
    });


    let onSuccess = () => {
      if (!this.mounted) { return; }

      this.submissionSucceeded = true;
      this.setState({
        submitting: false,
        submitted: true,
      });
    };


    let onFailure = (error) => {
      if (!this.mounted) { return; }

      this.submissionSucceeded = false;
      this.setState({
        submitting: false,
        submitted: true,
      });
    };


    Promise.race([ submission, submissionTimeout ]).then(onSuccess, onFailure).catch(onFailure);
  }




  handleGoBack() {
    let previousScene = this.context.navigationTracker.getPreviousScene();
    let goBack = Actions[previousScene];
    if (typeof goBack === 'function') { goBack(); }
  }




  registerInKeyboardAwareScrollView(view, textInput) {
    if (view && textInput) {
      this.keyboardAwareScrollViewTextInputs.push({ view, textInput });
    }
  }




  render() {
    let headerView = (
      <View style={styles.headerView}>
        <Text style={styles.headerText}>
          This message will go directly to
          {this.state.opsContact ? ` ${this.state.opsContact}` : ' '},
          your General Manager at knotel
          {this.state.propertyTitle ? ` ${this.state.propertyTitle}` : ''}.
        </Text>
      </View>
    );


    let editable = !this.state.submitting && !this.submissionSucceeded;

    let emailInputView = (
      <View style={styles.emailInputView}>
        <MKTextField
          autoCapitalize='none'
          autoCorrect={false}
          editable={editable}
          keyboardType='email-address'
          onSubmitEditing={() => {
            this.messageTextInput &&
            this.messageTextInput.focus();
          }}
          onTextChange={(text) => {
            this.emailInputEdited = true;
            let validationResult = validationHelper.isRequiredFieldEmail(text);
            this.setState({
              email: text,
              emailValidated: validationResult.validated,
              emailError: validationResult.error,
            });
          }}
          placeholder='Email'
          returnKeyType='next'
          style={styles.emailTextInputView}
          value={this.state.email}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={(
            !this.state.emailValidated &&
            this.emailInputEdited
          ) ? TextInputErrorColor : null}
          tintColor={(
            !this.state.emailValidated &&
            this.emailInputEdited
          ) ? TextInputErrorColor : null}
          textInputStyle={
            editable ? styles.emailTextInput : styles.emailDisabledTextInput
          }
        />
        <Text style={styles.inputErrorText}>
          {this.state.emailError}
        </Text>
      </View>
    );


    let messageInputView = (
      <View
        ref={ref => this.messageTextInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.messageTextInputView,
            this.messageTextInput
          );
        }}
        style={styles.messageInputView}
      >
        <MKTextField
          ref={ref => this.messageTextInput = ref}
          autoCapitalize='sentences'
          autoCorrect={false}
          editable={editable}
          onTextChange={(text) => {
            this.messageInputEdited = true;
            let validationResult = validationHelper.isRequiredFieldNotEmpty(text, 'Message');
            this.setState({
              message: text,
              messageValidated: validationResult.validated,
              messageError: validationResult.error,
            });
          }}
          multiline={true}
          placeholder='Message'
          style={styles.messageTextInputView}
          value={this.state.message}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={(
            !this.state.messageValidated &&
            this.messageInputEdited
          ) ? TextInputErrorColor : null}
          tintColor={(
            !this.state.messageValidated &&
            this.messageInputEdited
          ) ? TextInputErrorColor : null}
          textInputStyle={
            editable ? styles.messageTextInput : styles.messageDisabledTextInput
          }
        />
        <Text style={styles.inputErrorText}>
          {this.state.messageError}
        </Text>
      </View>
    );


    let submissionResponseView = this.state.submitted ? (
      <View style={styles.submissionResponseView}>
        <Icon
          name={this.submissionSucceeded ? 'done' : 'clear'}
          size={28}
          color={this.submissionSucceeded ? SuccessIconColor : ErrorIconColor}
          style={styles.submissionResponseIcon}
        />
        <Text style={styles.submissionResponseText}>
          {this.submissionSucceeded ? SubmissionConfirmedText : SubmissionFailedText}
        </Text>
      </View>
    ) : null;


    let actionButtonsView = (
      <View style={styles.actionButtonsView}>
        <FlatButton
          label='GO BACK'
          labelStyle={styles.actionButtonLabel}
          onPress={this.handleGoBack}
          primary={true}
          style={styles.actionButton}
        />
        {
          !this.state.submitted ? (
            <FlatButton
              disabled={!this.canSubmit()}
              disabledLabelStyle={styles.actionButtonDisabledLabel}
              label='SUBMIT'
              labelStyle={styles.actionButtonLabel}
              onPress={this.handleSubmit}
              primary={true}
              style={styles.actionButton}
            />
          ) : null
        }
      </View>
    );


    let progressBarView = this.state.submitting ? (
      <MKProgress.Indeterminate
        progressAniDuration={480}
        progressColor='white'
      />
    ) : null;


    return (
      <SceneWrapperWithOrientationState title='Contact'>
        <KeyboardAwareScrollView
          bounces={false}
          contentContainerStyle={styles.scrollViewContentContainer}
          keyboardShouldPersistTaps='always'
          scrollToTopOnKeyboardDismissal={true}
          textInputs={this.keyboardAwareScrollViewTextInputs}
        >
          {headerView}
          {emailInputView}
          {messageInputView}
          {submissionResponseView}
          {actionButtonsView}
          {progressBarView}
        </KeyboardAwareScrollView>
      </SceneWrapperWithOrientationState>
    );
  }

}

ContactContainer.contextTypes = {
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const styles = StyleSheet.create({
  scrollViewContentContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 28,
  },
  headerView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TextColor,
  },
  emailInputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    marginTop: 20,
  },
  emailTextInputView: {
    height: 55,
  },
  messageInputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  messageTextInputView: {
    height: 125,
  },
  emailTextInput: {
    fontSize: TextInputFontSize,
    color: TextColor,
  },
  emailDisabledTextInput: {
    fontSize: TextInputFontSize,
    color: TextInputTintColor,
  },
  messageTextInput: {
    fontSize: TextInputFontSize,
    color: TextColor,
    textAlignVertical : 'top',
  },
  messageDisabledTextInput: {
    fontSize: TextInputFontSize,
    color: TextInputTintColor,
    textAlignVertical : 'top',
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
    marginTop: 18,
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
    marginVertical: 20,
  },
  actionButton: {
    height: 36,
    width: 100,
  },
  actionButtonLabel: {
    fontSize: ActionButtonLabelFontSize,
    fontWeight: '500',
  },
  actionButtonDisabledLabel: {
    fontSize: ActionButtonLabelFontSize,
  },
});


export default ContactContainer;
