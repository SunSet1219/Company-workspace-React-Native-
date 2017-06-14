
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import db from '../../api/db/realm-db';
import PropertyInfo from '../components/profile/property-info-new';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import userHelper from '../helpers/user-helper';
import UserPreview from '../components/profile/user-profile-preview-new';

const { Border1Color, MainTextColorNew, StatusBarColor } = Theme.Palette;
const { SemiBoldFontSettings, TextFontSize } = Theme.Font;
const { Scenes } = SharedConstants;

const AccountItemsNames = {
  TeamMembers: 'Team Members',
  ChangePassword: 'Change Password',
  Terms: 'Terms',
  HelpAndSupport: 'Help & Support',
  Profile: 'Profile [deprecated]',
  Broadcasts: 'Broadcasts [admin feature]',
  Logout: 'Logout',
};

const AccountItems = Object.values(AccountItemsNames).map(value => ({ label: value }));




class Account extends Component {

  constructor(props) {
    super(props);

    this.getUserDefaultCompanyMembersCount = this.getUserDefaultCompanyMembersCount.bind(this);
    this.handleAccountItemPress = this.handleAccountItemPress.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderItems = this.renderItems.bind(this);

    this.publicationDataProcessedAgainstLocalDB = false;
    this.mounted = false;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(Scenes.Account);
  }




  componentDidMount() {
    this.mounted = true;
  }




  componentWillUnmount() {
    this.mounted = false;
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded) {
      if (!this.publicationDataProcessedAgainstLocalDB) {
        const { companies, properties } = nextProps;
        this.publicationDataProcessedAgainstLocalDB = db.sync({ companies, properties });
      }
    }
  }




  getUserDefaultCompanyMembersCount() {
    const { user, users } = this.props;
    const companyId = userHelper.getUserDefaultCompanyId(user);
    if (!companyId) { return 0; }
    return userHelper.getCompanyMembersCount(users, companyId);
  }




  handleAccountItemPress(item, index) {
    switch (item.label) {
      case AccountItemsNames.TeamMembers:
        break;

      case AccountItemsNames.ChangePassword:
        break;

      case AccountItemsNames.Terms:
        Actions[SharedConstants.Scenes.About]();
        break;

      case AccountItemsNames.HelpAndSupport:
        Actions[SharedConstants.Scenes.Contact]();
        break;

      case AccountItemsNames.Profile:
        Actions[SharedConstants.Scenes.Profile]();
        break;

      case AccountItemsNames.Broadcasts:
        Actions[SharedConstants.Scenes.Broadcasts]();
        break;

      case AccountItemsNames.Logout:
        db.deleteCurrentUserId();
        Meteor.logout(error => {
          if (error) { console.warn('[Error][Meteor.logout]', error); }
        });
        Actions[SharedConstants.Scenes.Login]();
        break;
    }
  }




  renderItem(item, index) {
    let label = (
      <Text style={styles.labelItem}>
        {item.label}
      </Text>
    );

    let teamMembersSize = item.label === AccountItemsNames.TeamMembers ? (
      <Text style={styles.teamSize}>
        {this.getUserDefaultCompanyMembersCount()}
      </Text>
    ) : null;


    return (
      <TouchableOpacity
        key={index}
        style={styles.item}
        onPress={() => this.handleAccountItemPress(item, index)}
      >
        {label}
        {teamMembersSize}
      </TouchableOpacity>
    );
  }




  renderItems() {
    return AccountItems.map(this.renderItem);
  }




  render() {
    const { user, properties, companies } = this.props;


    const avatarView = (
      <View style={styles.avatarView}>
        <UserPreview
          user={user}
        />
      </View>
    );


    const statusBar = (
      <StatusBar
        barStyle='dark-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    const propertyInfo = (
      <PropertyInfo
        company={userHelper.getUserDefaultCompany(user, companies)}
        property={userHelper.getUserDefaultProperty(user, properties)}
      />
    );


    return (
      <View  style={styles.wrapperView}>
        {statusBar}
        <ScrollView
          automaticZallyAdjustContentInsets={false}
          bounces={false}

        >
          {avatarView}
          <View style={styles.accountTabsView}>
            {propertyInfo}
            <View style={styles.items}>
              {this.renderItems()}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

}


Account.propTypes = {
  dataLoaded: PropTypes.bool,
  user: PropTypes.object,
  users: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
};

Account.contextTypes = {
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  accountTabsView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 30,
    paddingHorizontal: 30,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 25,
    borderTopColor: Border1Color,
    borderTopWidth: 1,
  },
  items: {
    paddingTop: 25,
  },
  avatarView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 170,
    paddingTop: 50,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          width: 1,
          height: 0.5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: (Platform.Version < 21) ? {
        borderColor: 'black',
        borderWidth: 1,
      } : {
        backgroundColor: 'white',
        elevation: 4,
      },
    }),
  },
  labelItem: {
    ...SemiBoldFontSettings,
    fontSize: TextFontSize,
    color: MainTextColorNew,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  teamSize: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    color: MainTextColorNew,
    fontWeight: '400',
  },
});




export default createContainer(props => {
  let user = Meteor.user();
  if (!user) {
    user = db.getCurrentUser() || {};
    let companyId = props.companyId ||
      user.companies && user.companies[0] && user.companies[0].companyId;

    return {
      companyId,
      dataLoaded: false,
      users: db.getUsers(),
      companies: db.getCompanies(),
      properties: db.getProperties(),
    };
  }

  let companyId = props.companyId ||
    user.companies && user.companies[0] && user.companies[0].companyId;

  if (!companyId) {
    return {
      dataLoaded: true,
      users: [],
      companies: [],
      properties: [],
    };
  }

  const subscriptionHandle = Meteor.subscribe('collectionsForCompanyProfile', companyId);

  let dataLoaded = subscriptionHandle.ready();

  return {
    dataLoaded,
    user,
    users: dataLoaded ? Meteor.collection('users').find() : db.getUsers(),
    companies: dataLoaded ? Meteor.collection('companies').find() : db.getCompanies(),
    properties: dataLoaded ? Meteor.collection('properties').find() : db.getProperties(),
  };
}, Account);
