
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Image,
  Keyboard,
  LayoutAnimation,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { MKProgress } from '../../material-ui';
import KeyboardAwareScrollView from '../keyboard-aware-scroll-view';
import LoginForm from './login-form';
import Logo from '../../../resources/logo-login.png';
import ResetPasswordForm from './reset-password-form';
import SendResetLinkForm from './send-reset-link-form';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { StatusBarColor, Canvas1Color } = Theme.Palette;
const { StatusBarHeight } = UISharedConstants;

const Modes = {
  Login: 'login',
  SendResetLink: 'sendResetLink',
  ResetPassword: 'resetPassword',
};

const DefaultMode = Modes.Login;
const AccentColor = '#ff8864';

const Display = {
  LongSide: Math.max(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  )
};




class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      mode: props.mode || DefaultMode,
      submitting: false,
      landscape: false,
    };

    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
    this.handleStartSubmitting = this.handleStartSubmitting.bind(this);
    this.handleEndSubmitting = this.handleEndSubmitting.bind(this);
    this.renderForm = this.renderForm.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.keyboardAwareScrollViewTextInputs = [];
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(SharedConstants.Scenes.Login);
    this.context.hideNavigationBar();
  }




  componentWillUnmount() {
    this.context.showNavigationBar();
  }




  registerInKeyboardAwareScrollView(item) {
    this.keyboardAwareScrollViewTextInputs.push(item);
  }




  handleModeChange(mode) {
    this.setState({ mode });
  }




  handleStartSubmitting() {
    this.setState({ submitting: true });
  }




  handleEndSubmitting() {
    this.setState({ submitting: false });
  }




  renderForm() {
    let formProps = {
      resetPasswordToken: this.props.resetPasswordToken,
      onModeChange: this.handleModeChange,
      onStartSubmitting: this.handleStartSubmitting,
      onEndSubmitting: this.handleEndSubmitting,
      registerInKeyboardAwareScrollView: this.registerInKeyboardAwareScrollView,
    };

    switch (this.state.mode) {
      case Modes.Login:
        return <LoginForm {...formProps} />;

      case Modes.SendResetLink:
        return <SendResetLinkForm {...formProps} />;

      case Modes.ResetPassword:
        return <ResetPasswordForm {...formProps} />;

      default:
        console.log('[Error][Login.renderForm] - mode case default', this.state.mode);
        return <LoginForm {...formProps} />;
    }
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      const animationConfig = LayoutAnimation.create(
        400,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      );
      LayoutAnimation.configureNext(animationConfig);
      this.setState({ landscape });
    }
  }




  render() {
    let { landscape } = this.state;


    let statusBar = (
      <StatusBar
        hidden={landscape}
        barStyle='dark-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    let progressBar = this.state.submitting ? (
      <MKProgress.Indeterminate
        progressColor='#ff6d6e'
        style={styles.progressBar}
      />
    ) : null;


    let logoImage = !landscape ? (
      <View style={styles.logoImageView}>
        <Image
          resizeMode='contain'
          source={Logo}
          style={styles.logoImage}
        />
      </View>
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
        {progressBar}
        <KeyboardAwareScrollView
          automaticallyAdjustContentInsets={false}
          keyboardShouldPersistTaps='always'
          bounces={false}
          contentContainerStyle={styles.scrollViewContentContainer}
          scrollToTopOnKeyboardDismissal={true}
          textInputs={this.keyboardAwareScrollViewTextInputs}
        >
          <View style={styles.formView}>
            {logoImage}
            {this.renderForm()}
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }

}

Login.propTypes = {
  mode: PropTypes.string,
  resetPasswordToken: PropTypes.string,
};

Login.contextTypes = {
  navigationTracker: PropTypes.object,
  hideNavigationBar: PropTypes.func,
  showNavigationBar: PropTypes.func,
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
  },
  progressBar: {
    position:'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor:'rgba(0,0,0,.2)',
  },
  logoImageView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Math.round(Display.LongSide * 0.075),
    paddingBottom: 36,
  },
  logoImage: {
    height: 149,
    width: 151,
  },
  formView: {
    width: Display.ShortSide,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: Math.round(Display.ShortSide * 0.15),
    paddingTop: 24,
    paddingBottom: 40,
  },
});


export default Login;
export { Modes, AccentColor };
