
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

import InviteeEmailAdder from './invitee-email-adder';
import InviteeView from './invitee-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Theme from '../theme';

const { Primary1Color, WhiteTextColor } = Theme.Palette;




class AddInvitees extends Component {

  constructor(props) {
    super(props);

    this.state = {
      inviteeEmails: [],
    };

    this.addInviteeEmail = this.addInviteeEmail.bind(this);
    this.removeInviteeEmail = this.removeInviteeEmail.bind(this);
  }




  addInviteeEmail(email) {
    let inviteeEmails = this.state.inviteeEmails.slice();
    let emailAlreadyAdded = inviteeEmails.some(item => item.email === email);
    let existingEmail = (
      this.props.existingEmail &&
      this.props.existingEmail.trim().toLowerCase()
    );

    if (!emailAlreadyAdded && email !== existingEmail) {
      inviteeEmails.push({ email });
    }

    this.setState({ inviteeEmails });
    this.props.onChange && this.props.onChange(inviteeEmails);
  }




  removeInviteeEmail(index) {
    let inviteeEmails = this.state.inviteeEmails.slice();
    inviteeEmails.splice(index, 1);
    this.setState({ inviteeEmails });
    this.props.onChange && this.props.onChange(inviteeEmails);
  }




  renderInviteeEmails() {
    let inviteeEmailViews = this.state.inviteeEmails.map((item, i) => {
      return (
        <InviteeView
          key={i}
          index={i}
          label={item.email}
          onRemove={this.removeInviteeEmail}
        />
      );
    });

    return (
      <View style={styles.inviteeEmailsView}>
        {inviteeEmailViews}
      </View>
    );
  }




  render() {
    let headerView = (
      <View style={styles.headerView}>
        <Text style={styles.headerText}>
          INVITE MEMBERS
        </Text>
      </View>
    );


    let inviteeEmailAdder = (
      <InviteeEmailAdder
        disabled={!this.props.existingEmail || this.props.disabled}
        onAdd={this.addInviteeEmail}
        registerInKeyboardAwareScrollView={this.props.registerInKeyboardAwareScrollView}
      />
    );


    let inviteeEmailsView = this.renderInviteeEmails();


    return (
      <View style={styles.wrapperView}>
        {headerView}
        {inviteeEmailAdder}
        {inviteeEmailsView}
      </View>
    );
  }

}

AddInvitees.propTypes = {
  existingEmail: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  registerInKeyboardAwareScrollView: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingBottom: 18,
  },
  headerView: {
    height: 40,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    backgroundColor: Primary1Color,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    color: WhiteTextColor,
  },
  inviteeEmailsView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: 12,
  },
});


export default AddInvitees;
