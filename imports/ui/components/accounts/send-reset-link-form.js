
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';

import { MKTextField } from '../../material-ui';
import { Modes, AccentColor } from './login';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor, { Accounts } from 'baryshok-react-native-meteor';
import RaisedButton from '../raised-button';
import Theme from '../../theme';
import validationHelper from '../../helpers/validationHelper';

const { TextColor, GreyTextColor, SuccessIconColor } = Theme.Palette;
const { TextInputErrorColor, TextInputTintColor } = Theme.Palette;
const { TextFontSize, HeaderFontSize, SubmissionResponseFontSize } = Theme.Font;
const { TextInputFontSize, TextInputErrorFontSize } = Theme.Font;

const SubmissionAniDurationMS = 2000;
const SubmissionTimeoutMS = 10000;
const DefaultSubmissionError = new Error(
  'Unable to send reset link at this time.\nPlease try again later'
);




class SendResetLinkForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      emailValidated: true,
      emailError: ' ',

      submitting: false,
      submitted: false,
      submissionError: ' ',
    };

    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);
    this.canSendResetLink = this.canSendResetLink.bind(this);
    this.sendResetLink = this.sendResetLink.bind(this);
    this.switchToLoginMode = this.switchToLoginMode.bind(this);

    this.emailInputView = null;
    this.emailTextInput = null;

    this.submissionAniTimeout = null;
    this.submissionTimeout = null;

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
    let { registerInKeyboardAwareScrollView } = this.props;

    if (view && textInput && registerInKeyboardAwareScrollView) {
      registerInKeyboardAwareScrollView({ view, textInput });
    }
  }




  canSendResetLink() {
    return Boolean(
      this.state.email.trim() &&
      this.state.emailValidated &&
      !this.state.submitting &&
      !this.state.submitted
    );
  }




  sendResetLink() {
    // Preventing method from calling twice, because of 'onSubmitEditing' event firing twice on Android
    // https://github.com/facebook/react-native/issues/10443
    if (!this.canSendResetLink()) { return; }

    if (!Meteor.status().connected) {
      return this.context.showToast(
        'No connection with the server.\n' +
        'Check Internet connection and try again'
      );
    }


    let submit = new Promise((resolve, reject) => {
      if (!this.mounted) { return; }

      this.setState({
        submitting: true,
        submissionError: ' ',
      });

      let options = {
        email: this.state.email.trim(),
      };

      Accounts.forgotPassword(options, (error) => {
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
        console.warn('[Error][SendResetLinkForm.sendResetLink]', reason);
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

      this.setState({
        submitting: false,
        submitted: true,
      });
    };


    let onFailure = (error) => {
      if (!this.mounted) { return; }

      this.setState({
        submitting: false,
        submissionError: error.reason || error.message,
      });
    };


    Promise.race([ submission, submissionTimeout ]).then(onSuccess, onFailure).catch(onFailure);
  }




  switchToLoginMode() {
    let { onModeChange } = this.props;
    onModeChange && onModeChange(Modes.Login);
  }




  render() {
    let headerView = (
      <View style={styles.headerView}>
        <Text style={styles.headerText}>
          Forgot password?
        </Text>
        <Text style={styles.subheaderText}>
          Let's recover your account
        </Text>
      </View>
    );


    let emailInputView = (
      <View
        ref={ref => this.emailInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.emailInputView,
            this.emailTextInput
          );
        }}
        style={styles.emailInputView}
      >
        <MKTextField
          ref={ref => this.emailTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={!this.state.submitting && !this.state.submitted}
          keyboardType='email-address'
          onSubmitEditing={this.sendResetLink}
          onTextChange={(text) => {
            let validationResult = validationHelper.isRequiredFieldEmail(text);
            this.setState({
              email: text,
              emailValidated: validationResult.validated,
              emailError: validationResult.error,
            });
          }}
          placeholder='Enter your email'
          returnKeyType='go'
          style={styles.textInputView}
          value={this.state.email}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.emailValidated ? TextInputErrorColor : AccentColor}
          tintColor={!this.state.emailValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={styles.inputErrorText}>
          {this.state.emailError}
        </Text>
      </View>
    );


    let sendResetLinkButton = (
      <RaisedButton
        disabled={!this.canSendResetLink()}
        label='Send reset link'
        backgroundColor={AccentColor}
        onPress={this.sendResetLink}
      />
    );


    let submissionResponseText = (
      <View style={styles.submissionResponseView}>
        <Icon
          name={'done'}
          size={28}
          color={SuccessIconColor}
          style={styles.submissionResponseIcon}
        />
        <Text style={styles.submissionResponseText}>
          Your password reset email has been sent!
        </Text>
      </View>
    );


    let submissionError = (
      <Text style={styles.submissionErrorText}>
        {this.state.submissionError}
      </Text>
    );


    let goBackToLoginButton = (
      <TouchableOpacity
        onPress={this.switchToLoginMode}
        style={styles.goBackToLoginButton}
      >
        <Text style={styles.goBackToLoginButtonText}>
          Back to Login
        </Text>
      </TouchableOpacity>
    );


    return (
      <View style={styles.wrapperView}>
        {headerView}
        {emailInputView}
        {this.state.submitted ? submissionResponseText : sendResetLinkButton}
        {submissionError}
        {goBackToLoginButton}
      </View>
    );
  }




  componentDidUpdate(prevProps, prevState) {
    if (this.state.submitting !== prevState.submitting) {
      let { onStartSubmitting, onEndSubmitting } = this.props;

      this.state.submitting ?
        onStartSubmitting && onStartSubmitting() :
        onEndSubmitting && onEndSubmitting();
    }
  }

}

SendResetLinkForm.propTypes = {
  onModeChange: PropTypes.func,
  onStartSubmitting: PropTypes.func,
  onEndSubmitting: PropTypes.func,
  registerInKeyboardAwareScrollView: PropTypes.func,
};

SendResetLinkForm.contextTypes = {
  showToast: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  headerView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 24,
  },
  headerText: {
    fontSize: HeaderFontSize,
    color: TextColor,
  },
  subheaderText: {
    fontSize: 14,
    color: GreyTextColor,
  },
  emailInputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    marginBottom: 24,
  },
  textInputView: {
    height: 48,
  },
  textInput: {
    fontSize: TextInputFontSize,
    color: TextColor,
  },
  inputErrorText: {
    fontSize: TextInputErrorFontSize,
    color: TextInputErrorColor,
    marginTop: 3,
    marginBottom: 1,
  },
  submissionErrorText: {
    fontSize: 14,
    color: '#ff6246',
    textAlign: 'center',
    marginTop: 16,
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
  goBackToLoginButton: {
    alignSelf: 'center',
    padding: 8,
  },
  goBackToLoginButtonText: {
    fontSize: TextFontSize,
    color: TextColor,
    alignSelf: 'center',
  },
});


export default SendResetLinkForm;
