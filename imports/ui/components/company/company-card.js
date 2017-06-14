
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
} from 'react-native';

import { Duration } from '../snackbar';
import { MKTextField } from '../../material-ui';
import Avatar from '../avatar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor from 'baryshok-react-native-meteor';
import Theme from '../../theme';
import validationHelper from '../../helpers/validationHelper';

const { TextColor, TextInputErrorColor, Accent1Color } = Theme.Palette;
const { TextInputFontSize, TextInputErrorFontSize } = Theme.Font;




class CompanyCard extends Component {

  constructor(props) {
    super(props);

    let { company } = props;
    let name = company && company.name || '';
    let primaryPhone = company && company.primaryPhone || '';
    let website = company && company.website || '';
    let email = company && company.email || '';
    let logo = company && company.logo || '';

    this.state = {
      editing: false,
      editable: false,

      name: name,
      primaryPhone: primaryPhone,
      website: website,
      email: email,
      logo: logo,

      nameTextInput: name,
      primaryPhoneTextInput: primaryPhone,
      websiteTextInput: website,
      emailTextInput: email,

      nameError: 'Transparent text',
      primaryPhoneError: 'Transparent text',
      websiteError: 'Transparent text',
      emailError: 'Transparent text',

      nameValidated: true,
      primaryPhoneValidated: true,
      websiteValidated: true,
      emailValidated: true,
    };

    this.registerInKeyboardAwareScrollView =
        this.registerInKeyboardAwareScrollView.bind(this);
    this.fieldsValidated = this.fieldsValidated.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.updateCompany = this.updateCompany.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUserCompanyAdmin = this.isUserCompanyAdmin.bind(this);

    this.nameTextInput = null;
    this.nameTextInputView = null;
    this.primaryPhoneTextInput = null;
    this.primaryPhoneTextInputView = null;
    this.websiteTextInput = null;
    this.websiteTextInputView = null;
    this.emailTextTextInput = null;
    this.emailTextTextInputView = null;
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.company) {
      let { company } = nextProps;
      let name = company.name || '';
      let primaryPhone = company.primaryPhone || '';
      let website = company.website || '';
      let email = company.email || '';
      let logo = company.logo || '';
      let editable = this.isUserCompanyAdmin(company._id);

      if (
        name !== this.state.name ||
        primaryPhone !== this.state.primaryPhone ||
        website !== this.state.website ||
        email !== this.state.email ||
        logo !== this.state.logo ||
        editable !== this.state.editable
      ) {
        this.setState({
          name,
          primaryPhone,
          website,
          email,
          logo,
          editable,
        });
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
  }




  registerInKeyboardAwareScrollView(view, textInput) {
    if (view && textInput && this.props.registerInKeyboardAwareScrollView) {
      this.props.registerInKeyboardAwareScrollView({ view, textInput });
    }
  }




  fieldsValidated() {
    if (
      !this.state.nameValidated ||
      !this.state.primaryPhoneValidated ||
      !this.state.websiteValidated ||
      !this.state.emailValidated
    ) {
      return false;
    }
    return true;
  }




  handleEdit() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to edit while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    this.setState({
      editing: true,

      nameTextInput: this.state.name,
      primaryPhoneTextInput: this.state.primaryPhone,
      websiteTextInput: this.state.website,
      emailTextInput: this.state.email,

      nameValidated: true,
      primaryPhoneValidated: true,
      websiteValidated: true,
      emailValidated: true,
    }, () => {
      this.props.onStartEditing && this.props.onStartEditing();
    });
  }




  updateCompany() {
    return new Promise((resolve, reject) => {
      if (!this.fieldsValidated()) {
        let error = new Error('At least one of the company profile fields is invalid');
        return reject(error);
      }

      let nameTextInput = this.state.nameTextInput.trim();
      let primaryPhoneTextInput = this.state.primaryPhoneTextInput.trim();
      let websiteTextInput = this.state.websiteTextInput.trim();
      let emailTextInput = this.state.emailTextInput.trim();

      let { name, primaryPhone, website, email } = this.state;

      this.setState({
        editing: false,
        name: nameTextInput,
        primaryPhone: primaryPhoneTextInput,
        website: websiteTextInput,
        email: emailTextInput,
      });

      let nameChanged = nameTextInput !== name;
      let primaryPhoneChanged = primaryPhoneTextInput !== primaryPhone;
      let websiteChanged = websiteTextInput !== website;
      let emailChanged = emailTextInput !== email;
      let companyChanged = nameChanged || primaryPhoneChanged || websiteChanged || emailChanged;

      if (companyChanged) {
        let changedFields = {};
        if (nameChanged) { changedFields.name = nameTextInput; }
        if (primaryPhoneChanged) { changedFields.primaryPhone = primaryPhoneTextInput; }
        if (websiteChanged) { changedFields.website = websiteTextInput; }
        if (emailChanged) { changedFields.email = emailTextInput; }

        let companyId = this.props.company && this.props.company._id;

        Meteor.call('updateCompanyFields', companyId, changedFields, (error) => {
          if (error) { return reject(error); }
          return resolve();
        });
      }
    });
  }




  onSave() {
    this.updateCompany().then(() => {
      this.context.showSnackbar({
        message: 'Company profile was successfully updated!',
        duration: Duration.Short,
      });
    }, (error) => {
      console.log('[Error][CompanyCard.updateCompany]', error);
      this.context.showSnackbar({
        message: error.reason || 'Failed to update company profile.',
        duration: Duration.Indefinite,
        button: {
          label: 'CLOSE',
        },
      });
    }).catch((reason) => {
      console.warn('[Error][CompanyCard.updateCompany]', reason);
    });
  }




  onCancel() {
    this.setState({ editing: false });
  }




  renderReadOnlyView(){
    const renderIconByName = (name) => {
      return (
        <Icon
          name={name}
          size={30}
          color={TextColor}
          style={styles.companyDataIcon}
        />
      );
    };

    const renderField = (iconName, textValue) => {
      return (
        <View style={styles.companyFieldView}>
          {renderIconByName(iconName)}
          <Text style={styles.companyFieldText}>
            {textValue}
          </Text>
        </View>
      );
    };

    let { company, properties } = this.props;
    let { name, primaryPhone, website, email } = this.state;

    let companyPropertiesTitles = '';
    if (properties && company && company.properties) {
      company.properties.forEach(companyProperty => {
        let foundProperty = properties.find(property => {
          return companyProperty.propertyId === property._id;
        });
        let propertyTitle = foundProperty && foundProperty.title;
        companyPropertiesTitles += propertyTitle ? propertyTitle + ' ' : '';
      })
    }

    return (
      <View>
        {renderField('business', name)}
        {renderField('room', companyPropertiesTitles)}
        {renderField('call', primaryPhone)}
        {renderField('public', website)}
        {renderField('email', email)}
      </View>
    );
  }




  isUserCompanyAdmin(companyId) {
    let user = Meteor.user();

    if (!companyId || !user || !user.companies || !user.companies.length) {
      return false;
    }

    let isUserCompanyAdmin = user.companies.some(item => {
      return item.companyId === companyId && item.role === 'admin';
    });

    return isUserCompanyAdmin;
  }




  renderEditView() {
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
          autoCapitalize='words'
          autoCorrect={false}
          editable={this.state.editing}
          keyboardType='default'
          onTextChange={(text) => {
            let validationResult =
              validationHelper.isRequiredFieldNotEmpty(text, 'Company name');
            this.setState({
              nameTextInput: text,
              nameValidated: validationResult.validated,
              nameError: validationResult.error,
            }, () => {
              this.props.onChange &&
              this.props.onChange(this.fieldsValidated());
            });
          }}
          placeholder='Company name'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.nameTextInput}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.nameValidated ? TextInputErrorColor : null}
          tintColor={!this.state.nameValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.nameValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.nameError}
        </Text>
      </View>
    );


    let primaryPhoneInputView = (
      <View
        ref={ref => this.primaryPhoneInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.primaryPhoneInputView,
            this.primaryPhoneInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.primaryPhoneInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={this.state.editing}
          keyboardType='numeric'
          onTextChange={(text) => {
            let validationResult =
              validationHelper.isOptionalFieldUSphoneNumber(text);
            this.setState({
              primaryPhoneTextInput: text,
              primaryPhoneValidated: validationResult.validated,
              primaryPhoneError: validationResult.error,
            }, () => {
              this.props.onChange &&
              this.props.onChange(this.fieldsValidated());
            });
          }}
          placeholder='Phone number'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.primaryPhoneTextInput}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.primaryPhoneValidated ? TextInputErrorColor : null}
          tintColor={!this.state.primaryPhoneValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.primaryPhoneValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.primaryPhoneError}
        </Text>
      </View>
    );


    let websiteInputView = (
      <View
        ref={ref => this.websiteTextInputView = ref}
        onLayout={() => {
          this.registerInKeyboardAwareScrollView(
            this.websiteTextInputView,
            this.websiteTextInput
          );
        }}
        style={styles.inputView}
      >
        <MKTextField
          ref={ref => this.websiteTextInput = ref}
          autoCapitalize='none'
          autoCorrect={false}
          editable={this.state.editing}
          keyboardType='default'
          onTextChange={(text) => {
            let validationResult =
              validationHelper.isRequiredFieldNotEmpty(text, 'Website');
            this.setState({
              websiteTextInput: text,
              websiteValidated: validationResult.validated,
              websiteError: validationResult.error,
            }, () => {
              this.props.onChange &&
              this.props.onChange(this.fieldsValidated());
            });
          }}
          placeholder='Website'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.websiteTextInput}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.websiteValidated ? TextInputErrorColor : null}
          tintColor={!this.state.websiteValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.websiteValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.websiteError}
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
              emailTextInput: text,
              emailValidated: validationResult.validated,
              emailError: validationResult.error,
            }, () => {
              this.props.onChange &&
              this.props.onChange(this.fieldsValidated());
            });
          }}
          placeholder='Email'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.emailTextInput}
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


    return (
      <View>
        {nameInputView}
        {primaryPhoneInputView}
        {websiteInputView}
        {emailInputView}
      </View>
    );
  }




  render() {
    let { company } = this.props;
    let companyHasData = company && Object.keys(company).length;

    let editButton = this.state.editable && !this.state.editing && companyHasData ? (
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


    let logo = (
      <Avatar
        avatarUrl={this.state.logo}
        size={100}
        style={styles.logo}
      />
    );


    return (
      <View
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          return false;
        }}
        style={styles.wrapperView}
      >
        {logo}
        {this.state.editing ? this.renderEditView() : this.renderReadOnlyView()}
        {editButton}
      </View>
    );
  }

}

CompanyCard.propTypes = {
  company: PropTypes.object,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  editing: PropTypes.bool,
  onStartEditing: PropTypes.func,
  onChange: PropTypes.func,
  saveOnEndEditing: PropTypes.bool,
  registerInKeyboardAwareScrollView: PropTypes.func,
};

CompanyCard.contextTypes = {
  showSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 32,
    margin: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  editButton: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  companyFieldView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyDataIcon: {
    marginRight: 10,
    marginTop: -2,
  },
  companyFieldText: {
    flex: 1,
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


export default CompanyCard;
