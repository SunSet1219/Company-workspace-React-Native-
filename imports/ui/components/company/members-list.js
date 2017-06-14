
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

import MemberCard from './member-card';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { Canvas3Color, Primary1Color, Secondary1Color, WhiteTextColor } = Theme.Palette;
const { TitleBarFontSize, TextFontSize } = Theme.Font;
const { TitleBarHeight } = UISharedConstants;





const MembersList = (props, context) => {

  let onlineOfflineColor = !context.isOffline() ? Primary1Color : Secondary1Color;

  let titleBar = (
    <View style={[ styles.titleBarView, { backgroundColor: onlineOfflineColor }]}>
      <Text style={styles.titleBarText}>
        MEMBERS
      </Text>
    </View>
  );



  let { company, members } = props;

  let membersList = members && members.map(member => {
    let username = member.username;
    let profile = member.profile || {};
    let emails = member.emails || [];
    let emailAddress = emails[0] && emails[0].address || '';
    let avatarUrl = profile.avatar && profile.avatar.upload;
    let userCompany = company && member.companies && member.companies.find(
      item => item.companyId === company._id
    ) || {};

    return (
      <MemberCard
        key={member._id}
        id={member._id}
        username={username}
        firstName={profile.firstName}
        lastName={profile.lastName}
        email={emailAddress}
        role={userCompany.role}
        avatarUrl={avatarUrl}
        enrolled={member.registrationCompleted}
        company={company}
      />
    );
  });



  return (
    <View style={styles.wrapperView}>
      {titleBar}
      <View style={styles.membersListView}>
        {membersList}
      </View>
    </View>
  );

};

MembersList.propTypes = {
  company: PropTypes.object,
  members: PropTypes.array,
};

MembersList.contextTypes = {
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection:'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingBottom: 15,
    backgroundColor: Canvas3Color,
  },
  titleBarView: {
    height: TitleBarHeight,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBarText: {
    fontSize: TitleBarFontSize,
    fontWeight: 'bold',
    color: WhiteTextColor,
  },
  membersListView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 4,
  },
});


export default MembersList;
