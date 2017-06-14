
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import RaisedButton from './raised-button';
import RegexHelper from '../helpers/regex-helper';
import Theme from '../theme';

const { TextInputErrorColor, WhiteTextColor, Border1Color } = Theme.Palette;
const { RaisedDisabledButton2Color, RaisedDisabledButtonLabel2Color } = Theme.Palette;
const EmailValidationError = 'This doesn\'t look like a correct email';




class InviteeEmailAdder extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      emailTextInputHasValue: false,
      showEmailValidationError: false,
    };

    this.resetInviteeEmailAdder = this.resetInviteeEmailAdder.bind(this);
    this.addInviteeEmail = this.addInviteeEmail.bind(this);
    this.registerInKeyboardAwareScrollView =
      this.registerInKeyboardAwareScrollView.bind(this);

    this.emailTextInput = null;
    this.emailTextInputView = null;
  }




  isEmailValid(email) {
    return RegexHelper.isEmail(email);
  }




  resetInviteeEmailAdder() {
    this.emailTextInput.clear();
    this.setState({
      email: '',
      emailTextInputHasValue: false,
      showEmailValidationError: false,
    });
  }




  addInviteeEmail() {
    let email = this.state.email.trim().toLowerCase();

    if (email === '') return;

    if (!this.isEmailValid(email)) {
      this.setState({ showEmailValidationError: true });
      return;
    }

    if (this.props.onAdd) {
      this.props.onAdd(email);
    }

    this.resetInviteeEmailAdder();
  }




  registerInKeyboardAwareScrollView(view, textInput, additionalOffset) {
    if (view && textInput && this.props.registerInKeyboardAwareScrollView) {
      this.props.registerInKeyboardAwareScrollView({ view, textInput, additionalOffset });
    }
  }




  render() {
    let addIcon = (
      <Icon
        name='add'
        size={28}
        color='white'
        style={styles.addIcon}
      />
    );


    return (
      <View style={styles.wrapperView}>

        <View
          ref={ref => this.emailTextInputView = ref}
          onLayout={() => {
            this.registerInKeyboardAwareScrollView(
              this.emailTextInputView,
              this.emailTextInput,
              20
            );
          }}
          style={styles.inviteeEmailAdderVeiw}
        >
          <TextInput
            ref={ref => this.emailTextInput = ref}
            autoCapitalize='none'
            autoCorrect={false}
            editable={!this.props.disabled}
            keyboardType='email-address'
            onChangeText={(text) => {
              this.setState({
                email: text,
                emailTextInputHasValue: !!text.length,
                showEmailValidationError: false,
              });
            }}
            onLayout={this.onEmailTextInputLayout}
            onSubmitEditing={this.addInviteeEmail}
            placeholder='Invitee Email'
            returnKeyType='done'
            style={[
              styles.textInput,
              this.props.disabled ?
                { backgroundColor: '#ebebe4' } :
                { backgroundColor: 'transparent' }
            ]}
            underlineColorAndroid='transparent'
            value={this.state.email}
          />

          <RaisedButton
            disabled={!this.state.emailTextInputHasValue}
            disabledBackgroundColor={RaisedDisabledButton2Color}
            disabledLabelColor={RaisedDisabledButtonLabel2Color}
            icon={addIcon}
            label='Add Invitee'
            labelStyle={styles.buttonText}
            onPress={this.addInviteeEmail}
            primary={true}
            style={styles.button}
          />
        </View>

        <Text style={[
          styles.emailValidationErrorText,
          this.state.showEmailValidationError ?
            { color: TextInputErrorColor } :
            { color: 'transparent' }
        ]}>
          {EmailValidationError}
        </Text>

      </View>
    );
  }

}

InviteeEmailAdder.propTypes = {
  disabled: PropTypes.bool,
  onAdd: PropTypes.func,
  registerInKeyboardAwareScrollView: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  inviteeEmailAdderVeiw: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 18,
    borderRadius: 4,
    borderColor: Border1Color,
    borderWidth: 1,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  button: {
    height: 44,
    width: 136,
  },
  buttonText: {
    fontSize: 16,
    color: WhiteTextColor,
  },
  addIcon: {
    marginRight: -5,
  },
  emailValidationErrorText: {
    fontSize: 12,
    color: 'transparent',
    marginTop: 4,
  },
});


export default InviteeEmailAdder;
