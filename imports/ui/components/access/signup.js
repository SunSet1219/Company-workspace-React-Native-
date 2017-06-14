
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { MKProgress, MKTextField } from '../../material-ui';
import CurrentUserDataView from '../current-user-data-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import KeyboardAwareScrollView from '../keyboard-aware-scroll-view';
import Meteor from 'baryshok-react-native-meteor';
import NavigationBar from '../navigation-bar';
import RaisedButton from '../raised-button';
import Theme from '../../theme';

const { Canvas1Color, StatusBarColor, SuccessIconColor, TextColor, TextInputErrorColor } = Theme.Palette;
const { SubmissionResponseFontSize, TextInputFontSize, TextInputErrorFontSize } = Theme.Font;

const PrimaryAccentColor = '#2baae1';
const SecondaryAccentColor = '#9be102';

const PasswordMinLength = 8;
const PasswordErrorText = 'Password is too short (minimum length is 8)';

const SubmissionConfirmedText = 'You have signed up successfully!';
const SubmissionAniDurationMS = 2000;
const SubmissionTimeoutMS = 10000;
const DefaultSubmissionError = 'Failed to sign up at this time.\nPlease try again later';

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};

const S1 = Math.round(Display.ShortSide * 0.025);
const S2 = Math.round(Display.ShortSide * 0.05);
const S3 = Math.round(Display.ShortSide * 0.1);
const S4 = Math.round(Display.ShortSide * 0.15);




class AccessSignUp extends Component {

  constructor(props) {
    super(props);

    this.state = {
      password: '',
      showPasswordError: false,
      signUpError: '',
      submitting: false,
      submitted: false,
      landscape: false,
    };

    this.registerInKeyboardAwareScrollView =
      this.registerInKeyboardAwareScrollView.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.canSubmit = this.canSubmit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.keyboardAwareScrollViewTextInputs = [];
    this.passwordInputView = null;
    this.passwordTextInput = null;
    this.submissionSucceeded = false;
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
    if (view && textInput) {
      this.keyboardAwareScrollViewTextInputs.push({ view, textInput });
    }
  }




  validateInput() {
    let password = this.state.password.trim();

    if (password.length < PasswordMinLength) {
      this.setState({ showPasswordError: true });
      return false;
    }

    return true;
  }




  canSubmit() {
    if (this.state.submitting || this.submissionSucceeded) { return false; }
    return true;
  }




  handleSubmit() {
    if (!this.validateInput()) {
      this.setState({ signUpError: '' });
      return;
    }

    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to submit while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    let submit = new Promise((resolve, reject) => {
      let password = this.state.password.trim();

      this.submissionSucceeded = false;
      this.setState({
        signUpError: '',
        submitted: false,
        submitting: true,
      });

      Meteor.call('signUpForKisi', password, (error, result) => {
        if (error) { return resolve(error); }
        return resolve();
      });
    });

    let submissionAnimation = new Promise((resolve, reject) => {
      this.submissionAniTimeout = setTimeout(resolve, SubmissionAniDurationMS);
    });

    let submission = new Promise(async (resolve, reject) => {
      try {
        let results = await Promise.all([ submit, submissionAnimation ]);
        let submissionError = results[0];
        if (submissionError) { return reject(submissionError); }
        return resolve();
      } catch (error) {
        console.warn('[Error][SingUp.handleSubmit.submission]', error);
        return reject(error);
      }
    });

    let submissionTimeout = new Promise((resolve, reject) => {
      this.submissionTimeout = setTimeout(() => {
        return reject(new Error('Submission timed out'));
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

    let isKisiError = (error) => {
      let reason = error && error.reason;
      return reason && (typeof reason === 'object') && Object.keys(reason).length;
    }

    let getKisiErrorMessage = (error) => {
      let reason = error && error.reason;
      let key = Object.keys(reason)[0];
      let value = Object.values(reason)[0];
      let errorMessage = `${key} ${value}`;
      return errorMessage;
    }

    let onFailure = (error) => {
      if (!this.mounted) { return; }
      error = typeof error.error === 'object' ? error.error : error;
      let signUpError = isKisiError(error) ? getKisiErrorMessage(error) : (
        error.reason || error.message || DefaultSubmissionError
      );
      this.submissionSucceeded = false;
      this.setState({
        signUpError,
        submitting: false,
        submitted: true,
      });
    };

    Promise.race([ submission, submissionTimeout ]).then(onSuccess, onFailure).catch(onFailure);
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let statusBar = (
      <StatusBar
        hidden={this.state.landscape}
        barStyle='light-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    let navigationBar = !this.state.landscape ? (
      <NavigationBar title='Sign up for the Access Beta' />
    ) : null;


    let currentUserDataView = (
      <CurrentUserDataView
        style={styles.currentUserDataView}
      />
    );


    let headerView = (
      <View style={styles.headerView}>
        <Text style={styles.subHeaderText}>
          Enter your Knotel password and tap submit
          to sign up for the Access Beta at Knotel
        </Text>
      </View>
    );


    let passwordInputView = (
      <View
        ref={ref => this.passwordInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.passwordInputView,
            this.passwordTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.passwordTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={!this.state.submitting && !this.submissionSucceeded}
          onSubmitEditing={this.handleSubmit}
          onTextChange={text => {
            this.setState({
              password: text,
              showPasswordError: false,
            });
          }}
          placeholder='Password'
          returnKeyType='go'
          password={true}
          style={styles.textInputView}
          value={this.state.password}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={this.state.showPasswordError ? TextInputErrorColor : PrimaryAccentColor}
          tintColor={this.state.showPasswordError ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          this.state.showPasswordError ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {PasswordErrorText}
        </Text>
      </View>
    );


    let signUpButton = (
      <RaisedButton
        disabled={!this.canSubmit()}
        label='SUBMIT'
        backgroundColor={SecondaryAccentColor}
        onPress={this.handleSubmit}
        style={styles.signUpButton}
      />
    );


    let signUpError = (
      <Text style={styles.signUpErrorText}>
        {this.state.signUpError}
      </Text>
    );


    let submissionResponseView = this.state.submitted && this.submissionSucceeded ? (
      <View style={styles.submissionResponseView}>
        <Icon
          name={'done'}
          size={28}
          color={SuccessIconColor}
          style={styles.submissionResponseIcon}
        />
        <Text style={styles.submissionResponseText}>
          {SubmissionConfirmedText}
        </Text>
      </View>
    ) : null;


    let progressBarView = this.state.submitting ? (
      <MKProgress.Indeterminate
        progressAniDuration={480}
        progressColor='white'
        style={styles.progressBar}
      />
    ) : null;


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          return false;
        }}
        style={styles.wrapperView}
      >
        {statusBar}
        {navigationBar}
        <KeyboardAwareScrollView
          automaticallyAdjustContentInsets={false}
          keyboardShouldPersistTaps='always'
          bounces={false}
          contentContainerStyle={styles.scrollViewContentContainer}
          scrollToTopOnKeyboardDismissal={true}
          textInputs={this.keyboardAwareScrollViewTextInputs}
        >
          {headerView}
          <View style={styles.formView}>
            {currentUserDataView}
            {passwordInputView}
            {signUpButton}
            {signUpError}
            {progressBarView}
          </View>
          {submissionResponseView}
        </KeyboardAwareScrollView>
      </View>
    );
  }

}

AccessSignUp.contextTypes = {
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: Canvas1Color,
  },
  scrollViewContentContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: S2,
    paddingBottom: S2,
  },
  headerView: {
    width: Display.ShortSide,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: S3,
    paddingBottom: S3,
  },
  subHeaderText: {
    fontSize: 18,
    lineHeight: 27,
    color: TextColor,
  },
  formView: {
    width: Display.ShortSide,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: S4,
  },
  currentUserDataView: {
    marginLeft: S1,
    marginRight: S2,
    marginBottom: S2,
  },
  inputErrorText: {
    fontSize: TextInputErrorFontSize,
    color: TextInputErrorColor,
    marginTop: 3,
    marginBottom: 1,
  },
  inputValidatedText: {
    fontSize: TextInputErrorFontSize,
    color: 'transparent',
    marginTop: 3,
    marginBottom: 1,
  },
  inputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  textInputView: {
    height: 48,
  },
  textInput: {
    fontSize: TextInputFontSize,
    color: TextColor,
  },
  signUpButton: {
    marginTop: S1,
    marginBottom: S2,
  },
  signUpErrorText: {
    fontSize: 14,
    color: PrimaryAccentColor,
    textAlign: 'center',
  },
  progressBar: {
    alignSelf: 'stretch',
  },
  submissionResponseView: {
    width: Display.ShortSide,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: S3,
    paddingBottom: S3,
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
})


export default AccessSignUp;
