
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';

import { Duration } from '../snackbar';
import Avatar from '../avatar';
import FlatButton from '../flat-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor from 'baryshok-react-native-meteor';
import Theme from '../../theme';

const { Canvas1Color, Border1Color, TextColor, GreyTextColor, GreenTextColor } = Theme.Palette;




const MemberCard = (props, context) => {

  let isCurrentUser = (memberId) => {
    let user = Meteor.user();
    if (!user) { return; }

    return user._id === memberId;
  };




  let isAdminOrOperationsContact = () => {
    let company = props.company;
    let user = Meteor.user();
    if (!user || !company) { return false; }

    let userIsAdmin = user.roles.some(item => item === 'admin');
    if (userIsAdmin) { return true; }

    let userIsOperationsContact = company && company.operationsContact === user._id;
    if (userIsOperationsContact) { return true; }

    let userCompanies = user.companies || [];
    let userIsCompanyAdmin = userCompanies.some(item => item.role === 'admin' && item.companyId === company._id);
    if (userIsCompanyAdmin) { return true; }

    return false;
  };




  let deactivateUser = () => {
    if (context.isOffline()) {
      return context.showToast(
        'Unable to deactivate while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    Meteor.call('deactivateUser', props.id, (error) => {
      if (error) {
        return context.showSnackbar({
          message: error.reason || 'Failed to deactivate user.',
          duration: Duration.Indefinite,
          button: {
            label: 'CLOSE',
          },
        });
      }

      context.showSnackbar({
        message: 'User deactivated successfully.',
        duration: Duration.Short,
      });
    });
  };



  let { id, username, firstName, lastName, email, role, avatarUrl, enrolled } = props;
  let name = (firstName || lastName) ?
    `${firstName} ${lastName}` :
    email && email.substr(0, email.indexOf('@'));


  let alertTitle = 'Deactivate\n' + email;
  let alertMessage = 'Are you sure you want to remove\n' + email + '\nfrom your company?';

  let deactivateButton = !isCurrentUser(id) && isAdminOrOperationsContact() ? (
    <TouchableOpacity
      hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
      onPress={() => Alert.alert(
        alertTitle,
        alertMessage,
        [
          { text: 'OK', onPress: deactivateUser },
          { text: 'Cancel' }
        ]
      )}
      style={styles.deactivateButton}
    >
      <Icon
        name='delete-sweep'
        size={24}
        color='black'
      />
    </TouchableOpacity>
  ) : null;


  return (
    <View style={styles.wrapperView}>
      <Avatar
        username={username}
        email={email}
        avatarUrl={avatarUrl}
        size={60}
      />

      <View style={styles.memberDataView}>
        <View style={styles.memberDataItemView}>
          <Text style={styles.nameText}>
            {name}
          </Text>
        </View>

        <View style={styles.memberDataItemView}>
          <Text style={styles.roleText}>
            {role}
          </Text>
        </View>

        <View style={styles.memberDataItemView}>
          <Text style={styles.emailText}>
            {email}
          </Text>
        </View>
      </View>

      <View style={styles.enrollmentStatusView}>
        <Text style={enrolled ? styles.enrolledText : styles.enrollmentPendingText}>
          {enrolled ? 'Enrolled' : 'Pending'}
        </Text>
      </View>

      {deactivateButton}
    </View>
  );

};

MemberCard.propTypes = {
  id: PropTypes.string,
  username: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  email: PropTypes.string,
  role: PropTypes.string,
  avatarUrl: PropTypes.string,
  enrolled: PropTypes.bool,
  company: PropTypes.object,
};

MemberCard.contextTypes = {
  showSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
    padding: 12,
    backgroundColor: Canvas1Color,
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: (Platform.Version < 21) ? {
        borderColor: Border1Color,
        borderWidth: StyleSheet.hairlineWidth,
      } : {
        elevation: 3,
      }
    }),
  },
  memberDataView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginHorizontal: 14,
  },
  memberDataItemView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TextColor,
  },
  roleText: {
    fontSize: 14,
    color: GreyTextColor,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '100',
    color: TextColor,
  },
  enrollmentStatusView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  enrolledText: {
    fontSize: 13,
    color: GreenTextColor,
  },
  enrollmentPendingText: {
    fontSize: 13,
    color: GreyTextColor,
  },
  deactivateButton: {
    position: 'absolute',
    top: 10,
    right: 12,
  },
});


export default MemberCard;
