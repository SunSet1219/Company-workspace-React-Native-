
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

import { Actions } from 'react-native-router-flux';
import { MKTextField } from '../../material-ui';
import { Modes, AccentColor } from './login';
import Meteor from 'baryshok-react-native-meteor';
import RaisedButton from '../raised-button';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';

const { TextInputErrorColor, TextColor } = Theme.Palette;
const { TextFontSize, TextInputFontSize, TextInputErrorFontSize } = Theme.Font;

const LoginErrorText = 'Email or Username required';
const PasswordErrorText = 'Password required';

const SubmissionAniDurationMS = 2000;
const SubmissionTimeoutMS = 10000;
const DefaultSubmissionError = new Error(
  'Unable to login at this time.\nPlease try again later'
);




class LoginForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      login: '',
      loginValidated: true,
      loginError: ' ',

      password: '',
      passwordValidated: true,
      passwordError: ' ',

      submitting: false,
      submissionError: ' ',
    };

    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.login = this.login.bind(this);
    this.switchToSendResetLinkMode = this.switchToSendResetLinkMode.bind(this);

    this.loginInputView = null;
    this.loginTextInput = null;

    this.passwordInputView = null;
    this.passwordTextInput = null;

    this.submissionAniTimeout = null;
    this.submissionTimeout = null;

    this.mounted = false;
  }




  componentDidMount() {
    this.mounted = true;
  }




  componentWillUnmount() {
    this.submissionAniTimeout && clearTimeout(this.submissionAniTimeout);
    this.submissionTimeout && clearTimeout(this.submissionTimeout);

    this.mounted = false;
  }




  registerInKeyboardAwareScrollView(view, textInput) {
    let { registerInKeyboardAwareScrollView } = this.props;

    if (view && textInput && registerInKeyboardAwareScrollView) {
      registerInKeyboardAwareScrollView({ view, textInput });
    }
  }




  validateInput() {
    let login = this.state.login.trim();
    let password = this.state.password.trim();
    let nextState = {};

    if (login === '') {
      nextState.loginValidated = false;
      nextState.loginError = LoginErrorText;
    }
    if (password === '') {
      nextState.passwordValidated = false;
      nextState.passwordError = PasswordErrorText;
    }

    if (Object.keys(nextState).length) {
      nextState.submissionError = ' ';
      this.setState(nextState);
      return false;
    }

    return true;
  }




  login() {
    if (!this.validateInput()) { return; }

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

      let login = this.state.login.trim();
      let password = this.state.password.trim();

      Meteor.loginWithPassword(login, password, (error) => {
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
        console.warn('[Error][LoginForm.login]', reason);
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

      this.setState({ submitting: false });

      Actions[SharedConstants.Scenes.Booking]();
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




  switchToSendResetLinkMode() {
    let { onModeChange } = this.props;
    onModeChange && onModeChange(Modes.SendResetLink);
  }




  render() {
    let editable = !this.state.submitting;

    let loginInputView = (
      <View
        ref={ref => this.loginInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.loginInputView,
            this.loginTextInput
          );
        }}
        style={styles.loginInputView}
      >
        <MKTextField
          ref={ref => this.loginTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={editable}
          keyboardType='email-address'
          onSubmitEditing={() => {
            this.passwordTextInput &&
            this.passwordTextInput.focus();
          }}
          onTextChange={(text) => {
            this.setState({
              login: text,
              loginValidated: true,
              loginError: ' ',
            });
          }}
          placeholder='Email or Username'
          returnKeyType='next'
          style={styles.textInputView}
          value={this.state.login}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.loginValidated ? TextInputErrorColor : AccentColor}
          tintColor={!this.state.loginValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={styles.inputErrorText}>
          {this.state.loginError}
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
        style={styles.passwordInputView}
      >
        <MKTextField
          ref={ref => this.passwordTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={editable}
          onSubmitEditing={this.login}
          onTextChange={(text) => {
            this.setState({
              password: text,
              passwordValidated: true,
              passwordError: ' ',
            });
          }}
          placeholder='Password'
          returnKeyType='go'
          password={true}
          style={styles.textInputView}
          value={this.state.password}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.passwordValidated ? TextInputErrorColor : AccentColor}
          tintColor={!this.state.passwordValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={styles.inputErrorText}>
          {this.state.passwordError}
        </Text>
      </View>
    );


    let loginButton = (
      <RaisedButton
        label='Login'
        backgroundColor={AccentColor}
        onPress={this.login}
      />
    );


    let submissionError = (
      <Text style={styles.submissionErrorText}>
        {this.state.submissionError}
      </Text>
    );


    let forgotPasswordButton = (
      <TouchableOpacity
        onPress={this.switchToSendResetLinkMode}
        style={styles.forgotPasswordButton}
      >
        <Text style={styles.forgotPasswordButtonText}>
          Forgot password?
        </Text>
      </TouchableOpacity>
    );


    return (
      <View style={styles.wrapperView}>
        {loginInputView}
        {passwordInputView}
        {loginButton}
        {submissionError}
        {forgotPasswordButton}
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

LoginForm.propTypes = {
  onModeChange: PropTypes.func,
  onStartSubmitting: PropTypes.func,
  onEndSubmitting: PropTypes.func,
  registerInKeyboardAwareScrollView: PropTypes.func,
};

LoginForm.contextTypes = {
  showToast: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  loginInputView: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  passwordInputView: {
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
  forgotPasswordButton: {
    alignSelf: 'center',
    padding: 8,
  },
  forgotPasswordButtonText: {
    fontSize: TextFontSize,
    color: TextColor,
    alignSelf: 'center',
  },
});


export default LoginForm;
