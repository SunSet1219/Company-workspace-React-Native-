
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
import { Duration } from '../snackbar';
import { MKProgress, MKTextField } from '../../material-ui';
import DropdownMenu from '../dropdown-menu';
import FlatButton from '../flat-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InviteeView from '../invitee-view';
import Meteor from 'baryshok-react-native-meteor';
import RaisedButton from '../raised-button';
import SubsceneWrapper from '../subscene-wrapper';
import Theme from '../../theme';
import validationHelper from '../../helpers/validationHelper';

const { TextColor, TextInputErrorColor, SuccessIconColor, ErrorIconColor } = Theme.Palette;
const { FlatActionButtonLabelColor, WhiteTextColor } = Theme.Palette;
const { RaisedDisabledButton2Color, RaisedDisabledButtonLabel2Color } = Theme.Palette;
const { HeaderFontSize, MenuFontSize, ActionButtonLabelFontSize } = Theme.Font;
const { TextInputFontSize, TextInputErrorFontSize } = Theme.Font;

const Roles = [{ label: 'member' }, { label: 'admin' }];
const DefaultRoleIndex = 0;

const SubmissionAniDurationMS = 2000;
const SubmissionTimeoutMS = 10000;




class InviteMembers extends Component {

  constructor(props) {
    super(props);

    this.state = {
      members: [],
      currentName: '',
      currentEmail: '',
      currentNameValidated: true,
      currentEmailValidated: true,
      currentNameError: 'Transparent text',
      currentEmailError: 'Transparent text',
      role: Roles[DefaultRoleIndex].label,
      submitting: false,
      submissionSucceeded: false,
      invitationResults: null,
    };

    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderMembers = this.renderMembers.bind(this);
    this.renderInvitationResults = this.renderInvitationResults.bind(this);

    this.roleSelectedIndex = DefaultRoleIndex;
    this.nameTextInputView = null;
    this.nameTextInput = null;
    this.emailTextInputView = null;
    this.emailTextInput = null;
    this.submissionAniTimeout = null;
    this.submissionTimeout = null;
    this.keyboardAwareScrollViewTextInputs = [];
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




  addMember() {
    let name = this.state.currentName.trim();
    let email = this.state.currentEmail.trim().toLowerCase();
    let role = this.state.role;

    let members = this.state.members.slice();
    let memberAlreadyAdded = members.some(member => member.email === email);
    if (memberAlreadyAdded) {
      return this.context.showSnackbar({
        message: 'Member with this email has already been added',
        duration: Duration.Short,
      });
    }
    members.push({ name, email, role });

    this.setState({
      members,
      currentEmail: '',
      currentName: '',
    });
  }




  removeMember(index) {
    let members = this.state.members.slice();
    members.splice(index, 1);
    this.setState({ members });
  }




  handleRoleChange(item, index) {
    this.roleSelectedIndex = index;
    this.setState({ role: item.label });
  }




  handleSubmit() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to invite while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    this.context.hideSnackbar();
    this.setState({
      submitting: true,
      submissionSucceeded: false,
    });

    let submit = new Promise((resolve, reject) => {
      let { companyId } = this.props;
      let { members } = this.state;

      Meteor.call('inviteMembersToCompany', companyId, members, (error, response) => {
        if (error) { return resolve([ error, response ]); }
        return resolve([ null, response ]);
      });
    });

    let submissionAnimation = new Promise((resolve, reject) => {
      this.submissionAniTimeout = setTimeout(resolve, SubmissionAniDurationMS);
    });

    let submission = new Promise(async (resolve, reject) => {
      try {
        let results = await Promise.all([ submit, submissionAnimation ]);
        let [ submissionError, submissionResponse ] = results[0];
        if (submissionError) { return reject(submissionError); }
        return resolve(submissionResponse);
      } catch (error) {
        return reject(error);
      }
    });

    let submissionTimeout = new Promise((resolve, reject) => {
      this.submissionTimeout = setTimeout(() => {
        return reject(new Error('Submission timed out'));
      }, SubmissionTimeoutMS);
    });

    let onSuccess = (response) => {
      if (!this.mounted) { return; }
      this.setState({
        submitting: false,
        submissionSucceeded: true,
        invitationResults: response.members,
      });
    };

    let onFailure = (error) => {
      if (!this.mounted) { return; }
      this.setState({
        submitting: false,
      });
      this.context.showSnackbar({
        message: error.reason || 'Failed to invite members.',
        duration: Duration.Indefinite,
        button: {
          label: 'CLOSE',
        },
      });
    };

    Promise.race([ submission, submissionTimeout ]).then(onSuccess, onFailure).catch(onFailure);
  }



  renderMembers() {
    let memberViews = this.state.members.map((item, i) => {
      return (
        <InviteeView
          key={i}
          index={i}
          label={`${item.name} | ${item.email} | ${item.role}`}
          onRemove={this.removeMember}
        />
      );
    });

    return (
      <View style={styles.membersView}>
        {memberViews}
      </View>
    );
  }




  renderInvitationResults() {
    let invitationResultViews = this.state.invitationResults.map((member, i) => {
      return (
        <View
          key={i}
          style={styles.invitationResultView}
        >
          <Icon
            name={member.enrolled ? 'clear' : 'done'}
            size={24}
            color={member.enrolled ? ErrorIconColor : SuccessIconColor}
            style={styles.invitationResultIcon}
          />
          <Text style={styles.invitationResultText}>
            {
              member.enrolled ?
                ('User ' + member.email + ' already enrolled.') :
                ('Invitation for user ' + member.email + ' sent successfully.')
            }
          </Text>
        </View>
      );
    });

    return (
      <View style={styles.invitationResultsView}>
        {invitationResultViews}
      </View>
    );
  }




  render() {
    let headerText = (
      <Text style={styles.headerText}>
        Invite members
      </Text>
    );


    let editable = !this.state.submitting && !this.state.submissionSucceeded;

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
            this.emailTextInput && this.emailTextInput.focus();
          }}
          onTextChange={(text) => {
            let validationResult =
              validationHelper.isRequiredFieldNotEmpty(text, 'Name');
            this.setState({
              currentName: text,
              currentNameValidated: validationResult.validated,
              currentNameError: validationResult.error,
            });
          }}
          placeholder='Name'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.currentName}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.currentNameValidated ? TextInputErrorColor : null}
          tintColor={!this.state.currentNameValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.currentNameValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.currentNameError}
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
              currentEmail: text,
              currentEmailValidated: validationResult.validated,
              currentEmailError: validationResult.error,
            });
          }}
          placeholder='Email'
          returnKeyType='done'
          style={styles.textInputView}
          value={this.state.currentEmail}
          floatingLabelEnabled={true}
          underlineEnabled={true}
          highlightColor={!this.state.currentEmailValidated ? TextInputErrorColor : null}
          tintColor={!this.state.currentEmailValidated ? TextInputErrorColor : null}
          textInputStyle={styles.textInput}
        />
        <Text style={
          !this.state.currentEmailValidated ?
            styles.inputErrorText :
            styles.inputValidatedText
        }>
          {this.state.currentEmailError}
        </Text>
      </View>
    );


    let roleDropdownMenu = (
      <DropdownMenu
        menuItems={Roles}
        selectedIndex={this.roleSelectedIndex}
        onChange={this.handleRoleChange}
        style={styles.roleDropdownMenu}
        fontSize={MenuFontSize}
      />
    );


    let canAddMember = !!(
      this.state.currentName &&
      this.state.currentEmail &&
      this.state.currentEmailValidated &&
      this.state.currentNameValidated
    );


    let addIcon = (
      <Icon
        name='add'
        size={28}
        color='white'
        style={styles.addIcon}
      />
    );


    let addMemberButton = (
      <RaisedButton
        disabled={!canAddMember}
        disabledBackgroundColor={RaisedDisabledButton2Color}
        disabledLabelColor={RaisedDisabledButtonLabel2Color}
        icon={addIcon}
        label='Add Member'
        labelStyle={styles.addMemberButtonText}
        onPress={this.addMember}
        primary={true}
        style={styles.addMemberButton}
      />
    );


    let actionButtonsView = this.state.submissionSucceeded ? (
      <View style={styles.actionButtonsView}>
        <FlatButton
          label='OK'
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
          disabled={this.state.submitting || !this.state.members.length}
          label='INVITE'
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
        {emailInputView}
        <View style={styles.rowView}>
          {roleDropdownMenu}
          {addMemberButton}
        </View>
        {this.state.submissionSucceeded ? this.renderInvitationResults() : this.renderMembers()}
        {actionButtonsView}
        {progressBarView}
      </SubsceneWrapper>
    );
  }

}


InviteMembers.propTypes = {
  companyId: PropTypes.string,
};


InviteMembers.contextTypes = {
  showSnackbar: PropTypes.func,
  hideSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};


const styles = StyleSheet.create({
  headerText: {
    fontSize: HeaderFontSize,
    lineHeight: 36,
    color: TextColor,
    marginBottom: 8,
  },
  membersView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingVertical: 24,
  },
  textInputView: {
    height: 48,
  },
  textInput: {
    fontSize: TextInputFontSize,
    color: TextColor,
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
  rowView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginVertical: 16,
  },
  roleDropdownMenu: {
    flex: 1,
  },
  addMemberButton: {
    height: 36,
    width: 146,
    marginLeft: 16,
  },
  addMemberButtonText: {
    fontSize: 16,
    color: WhiteTextColor,
  },
  addIcon: {
    marginLeft: -5,
    marginRight: -5,
  },
  invitationResultsView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 24,
    paddingBottom: 6,
  },
  invitationResultView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  invitationResultIcon: {
    marginRight: 5,
  },
  invitationResultText: {
    flex: 1,
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


export default InviteMembers;
