
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { Duration } from '../snackbar';
import { MKTextField } from '../../material-ui';
import Avatar from '../avatar';
import db from '../../../api/db/realm-db';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor from 'baryshok-react-native-meteor';
import SharedConstants from '../../../api/constants/shared';
import Theme from '../../theme';
import validationHelper from '../../helpers/validationHelper';

const { Canvas5Color, TextColor, TextInputErrorColor, Accent1Color } = Theme.Palette;
const { TextInputFontSize, TextInputErrorFontSize } = Theme.Font;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class UserProfileCard extends Component {

  constructor(props) {
    super(props);

    let { user } = props;
    let profile = user && user.profile;
    let emails = user && user.emails;

    let firstName = profile && profile.firstName || '';
    let lastName = profile && profile.lastName || '';
    let primaryEmail = emails && emails[0] && emails[0].address || '';
    let phone = profile && profile.phone || '';

    this.state = {
      editing: false,

      firstName: firstName,
      lastName: lastName,
      primaryEmail: primaryEmail,
      phone: phone,

      firstNameTextInput: firstName,
      lastNameTextInput: lastName,
      primaryEmailTextInput: primaryEmail,
      phoneTextInput: phone,

      firstNameError: 'Transparent text',
      lastNameError: 'Transparent text',
      primaryEmailError: 'Transparent text',
      phoneError: 'Transparent text',

      firstNameValidated: true,
      lastNameValidated: true,
      emailValidated: true,
      phoneValidated: true,

      landscape: false,
    }

    this.registerInKeyboardAwareScrollView =
      this.registerInKeyboardAwareScrollView.bind(this);
    this.fieldsValidated = this.fieldsValidated.bind(this);
    this.handleCompanyPress = this.handleCompanyPress.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.firstNameTextInput = null;
    this.firstNameTextInputView = null;
    this.lastNameTextInput = null;
    this.lastNameTextInputView = null;
    this.emailTextInput = null;
    this.emailTextInputView = null;
    this.phoneTextInput = null;
    this.phoneTextInputView = null;
    this.targetEmail = '';
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.user) {
      let { user } = nextProps;
      let profile = user && user.profile;
      let emails = user && user.emails;

      let firstName = profile && profile.firstName || '';
      let lastName = profile && profile.lastName || '';
      let primaryEmail = emails && emails[0] && emails[0].address || '';
      let phone = profile && profile.phone || '';

      if (
        firstName !== this.state.firstName ||
        lastName !== this.state.lastName ||
        primaryEmail !== this.state.primaryEmail ||
        phone !== this.state.phone
      ) {
        this.setState({
          firstName,
          lastName,
          primaryEmail,
          phone,
        });
      }
    }

    if (nextProps.editing !== this.state.editing) {
      if (!nextProps.editing) {
        if (nextProps.saveOnEndEditing) {
          this.onSave();
        } else {
          this.onCancel();
        }
      }
    }
  }




  registerInKeyboardAwareScrollView(view, textInput) {
    if (view && textInput && this.props.registerInKeyboardAwareScrollView) {
      this.props.registerInKeyboardAwareScrollView({ view, textInput });
    }
  }




  handleCompanyPress(companyId) {
    if (this.context.isOffline() && !db.isDataSaved('company')) {
      return this.context.showToast(
        'Unable to show while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    Actions[SharedConstants.Scenes.Company]({ companyId });
  }




  fieldsValidated() {
    if (
      !this.state.firstNameValidated ||
      !this.state.lastNameValidated ||
      !this.state.emailValidated ||
      !this.state.phoneValidated
    ) {
      return false;
    }
    return true;
  }




  handleEdit() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to edit profile while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    this.setState({
      editing: true,

      firstNameTextInput: this.state.firstName,
      lastNameTextInput: this.state.lastName,
      primaryEmailTextInput: this.state.primaryEmail,
      phoneTextInput: this.state.phone,

      firstNameValidated: true,
      lastNameValidated: true,
      emailValidated: true,
      phoneValidated: true,
    }, () => {
      this.props.onStartEditing && this.props.onStartEditing();
    });
  }




  updateUserProfile() {
    return new Promise((resolve, reject) => {
      if (!this.fieldsValidated()) {
        let error = new Error('At least one of the user profile fields is invalid');
        return reject(error);
      }

      let firstNameTextInput = this.state.firstNameTextInput.trim();
      let lastNameTextInput = this.state.lastNameTextInput.trim();
      let primaryEmailTextInput = this.state.primaryEmailTextInput.trim();
      let phoneTextInput = this.state.phoneTextInput.trim();

      let { firstName, lastName, primaryEmail, phone } = this.state;

      this.setState({
        editing: false,
        firstName: firstNameTextInput,
        lastName: lastNameTextInput,
        phone: phoneTextInput,
      });

      let firstNameChanged = firstNameTextInput !== firstName;
      let lastNameChanged = lastNameTextInput !== lastName;
      let phoneChanged = phoneTextInput !== phone;
      let profileChanged = firstNameChanged || lastNameChanged || phoneChanged;
      let emailChanged = primaryEmailTextInput !== primaryEmail;

      if (profileChanged) {
        let changedFields = {};
        if (firstNameChanged) { changedFields.firstName = firstNameTextInput; }
        if (lastNameChanged) { changedFields.lastName = lastNameTextInput; }
        if (phoneChanged) { changedFields.phone = phoneTextInput; }

        Meteor.call('updateUserProfileFields', changedFields, (error) => {
          if (error) { return reject(error); }
          if (!emailChanged) { return resolve(); }
        });
      }

      if (emailChanged) {
        Meteor.call('updateUserEmail', primaryEmailTextInput, (error) => {
          if (error) { return reject(error); }
          let message = (
            'Your email will be updated to ' + primaryEmailTextInput +
            ' when you confirm it via the confirmation email that we sent to you'
          );
          return resolve(message);
        });
      }
    });
  }




  onSave() {
    this.updateUserProfile().then((message) => {
      if (message) {
        this.context.showSnackbar({
          message,
          duration: Duration.Long,
        });
      } else {
        this.context.showSnackbar({
          message: 'Profile was successfully updated!',
          duration: Duration.Short,
        });
      }
    }, (error) => {
      console.log('[Error][UserProfileCard.updateUserProfile]', error);
      this.context.showSnackbar({
        message: error.reason || 'Failed to update profile.',
        duration: Duration.Indefinite,
        button: {
          label: 'CLOSE',
        },
      });
    }).catch((reason) => {
      console.warn('[Error][UserProfileCard.updateUserProfile]', reason);
    });
  }




  onCancel() {
    this.setState({ editing: false });
  }




  renderEditView() {
    if (!this.props.user) return;

    let firstNameInputView = (
      <View
        ref={ref => this.firstNameTextInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.firstNameTextInputView,
            this.firstNameTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.firstNameTextInput = ref}
          autoCapitalize='words'
          autoCorrect={false}
          editable={this.state.editing}
          keyboardType='default'
          onTextChange={(text) => {
            let validationResult =
              validationHelper.isRequiredFieldNotEmpty(text, 'First name');
            this.setState({
              firstNameTextInput: text,
              firstNameValidated: validationResult.validated,
              firstNameError: validationResult.error,
            }, () => {
              this.props.onChange &&
              this.props.onChange(this.fieldsValidated());
            });
          }}
          placeholder='First name'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.firstNameTextInput}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.firstNameValidated ? TextInputErrorColor : null}
          tintColor={!this.state.firstNameValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.firstNameValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.firstNameError}
        </Text>
      </View>
    );


    let lastNameInputView = (
      <View
        ref={ref => this.lastNameTextInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.lastNameTextInputView,
            this.lastNameTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.lastNameTextInput = ref}
          autoCapitalize='words'
          autoCorrect={false}
          editable={this.state.editing}
          keyboardType='default'
          onTextChange={(text) => {
            let validationResult =
              validationHelper.isRequiredFieldNotEmpty(text, 'Last name');
            this.setState({
              lastNameTextInput: text,
              lastNameValidated: validationResult.validated,
              lastNameError: validationResult.error,
            }, () => {
              this.props.onChange &&
              this.props.onChange(this.fieldsValidated());
            });
          }}
          placeholder='Last name'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.lastNameTextInput}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.lastNameValidated ? TextInputErrorColor : null}
          tintColor={!this.state.lastNameValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.lastNameValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.lastNameError}
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
          editable={this.state.editing}
          keyboardType='email-address'
          onTextChange={(text) => {
            let validationResult = validationHelper.isRequiredFieldEmail(text);
            this.setState({
              primaryEmailTextInput: text,
              emailValidated: validationResult.validated,
              emailError: validationResult.error,
            }, () => {
              this.props.onChange &&
              this.props.onChange(this.fieldsValidated());
            });
          }}
          placeholder='Primary email'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.primaryEmailTextInput}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.emailValidated ? TextInputErrorColor : null}
          tintColor={!this.state.emailValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.emailValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.emailError}
        </Text>
      </View>
    );


    let phoneInputView = (
      <View
        ref={ref => this.phoneTextInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.phoneTextInputView,
            this.phoneTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.phoneTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={this.state.editing}
          keyboardType='numeric'
          onTextChange={(text) => {
            let validationResult =
              validationHelper.isOptionalFieldUSphoneNumber(text);
            this.setState({
              phoneTextInput: text,
              phoneValidated: validationResult.validated,
              phoneError: validationResult.error,
            }, () => {
              this.props.onChange &&
              this.props.onChange(this.fieldsValidated());
            });
          }}
          placeholder='Phone number'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.phoneTextInput}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.phoneValidated ? TextInputErrorColor : null}
          tintColor={!this.state.phoneValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.phoneValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.phoneError}
        </Text>
      </View>
    );


    return (
      <View style={styles.fieldsWrapperView}>
        {firstNameInputView}
        {lastNameInputView}
        {emailInputView}
        {phoneInputView}
      </View>
    );
  }




  renderReadOnlyView() {
    let { user, companies } = this.props;
    if (!user) { return; }

    const renderIconByName = (name) => (
      <Icon
        name={name}
        size={30}
        color={TextColor}
        style={styles.userDataIcon}
      />
    );

    const renderField = (iconName, textValue) => (
      <View style={styles.profileFieldView}>
        {renderIconByName(iconName)}
        <Text style={styles.profileFieldText}>
          {textValue}
        </Text>
      </View>
    );

    let { firstName, lastName, primaryEmail, phone } = this.state;
    let name = firstName + ' ' + lastName;

    return (
      <View style={styles.fieldsWrapperView}>
        {renderField('person', name)}

        <View style={styles.profileFieldView}>
          {renderIconByName('business')}
          <View style={styles.companyView}>
            {
              companies && companies.map((company, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => this.handleCompanyPress(company._id)}
                >
                  <Text style={styles.companyText}>
                    {company.name}{i < companies.length - 1 ? ', ' : ''}
                  </Text>
                </TouchableOpacity>
              ))
            }
          </View>
        </View>

        {renderField('email', primaryEmail)}
        {renderField('call', phone)}
      </View>
    );
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let landscape = this.state.landscape;
    let orientationStyles = landscape ? landscapeStyles : portraitStyles;


    let editButton = !this.state.editing ? (
      <TouchableOpacity
        hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
        onPress={this.handleEdit}
        style={styles.editButton}
      >
        <Icon
          name='edit'
          size={25}
          color={Accent1Color}
        />
      </TouchableOpacity>
    ) : null;


    let user = this.props.user;

    let avatarAndUserNameView = (
      <View style={orientationStyles.avatarAndUserNameView}>
        <Avatar
          showCurrentUserAvatar={true}
          size={100}
        />
        <Text style={styles.username}>
          {user && user.username}
        </Text>
      </View>
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          return false;
        }}
        style={orientationStyles.wrapperView}
      >
        {avatarAndUserNameView}
        {this.state.editing ? this.renderEditView() : this.renderReadOnlyView()}
        {editButton}
      </View>
    );
  }

}

UserProfileCard.propTypes = {
  user: PropTypes.object,
  companies: PropTypes.array,
  editing: PropTypes.bool,
  onStartEditing: PropTypes.func,
  onChange: PropTypes.func,
  saveOnEndEditing: PropTypes.bool,
  registerInKeyboardAwareScrollView: PropTypes.func,
};

UserProfileCard.contextTypes = {
  showSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const portraitStyles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: Math.floor(Display.ShortSide * 0.1),
    margin: Math.floor(Display.ShortSide * 0.1),
    backgroundColor: Canvas5Color,
  },
  avatarAndUserNameView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
});

const landscapeStyles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 32,
    margin: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  avatarAndUserNameView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: 40,
  },
});

const styles = StyleSheet.create({
  fieldsWrapperView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  editButton: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  username: {
    color: 'rgb(95, 95, 95)',
    fontSize: TextInputFontSize,
    marginTop: 15,
    marginBottom: 10,
  },
  profileFieldView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userDataIcon: {
    marginRight: 10,
    marginTop: -2,
  },
  profileFieldText: {
    flex: 1,
    color: TextColor,
    fontSize: TextInputFontSize,
    marginTop: 2,
  },
  companyView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  companyText: {
    color: TextColor,
    fontSize: TextInputFontSize,
    marginTop: 2,
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
});


export default UserProfileCard;
