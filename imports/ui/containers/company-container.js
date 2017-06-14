
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Image,
  Keyboard,
  PixelRatio,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { MKButton } from '../material-ui';
import ActionButtonsBar from '../components/action-buttons-bar';
import CompanyCard from '../components/company/company-card';
import db from '../../api/db/realm-db';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MembersList from '../components/company/members-list';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import KeyboardAwareScrollView from '../components/keyboard-aware-scroll-view';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';
import userHelper from '../helpers/user-helper';

const { StatusBarColor } = Theme.Palette;
const { StatusBarHeight, ActionFabSize } = UISharedConstants;

const WallpaperImageSource = require('../../resources/company-background.jpg');
const WallpaperImageWidth = 2500;
const WallpaperImageHeight = 1179;

const Display = {
  LongSide: Math.max(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};

const AccentColoredFab = MKButton.accentColoredFab()
  .withStyle({
    width: ActionFabSize,
    height: ActionFabSize,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
    elevation: 6,
  })
  .build();




class CompanyContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      landscape: false,
      editingCompany: false,
      actionButtonDisabled: false,
      actionConfirmed: false,
    };

    this.getResizedImageDimensions = this.getResizedImageDimensions.bind(this);
    this.handleInviteMembers = this.handleInviteMembers.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.registerInKeyboardAwareScrollView =
      this.registerInKeyboardAwareScrollView.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.keyboardAwareScrollViewTextInputs = [];
    this.publicationDataProcessedAgainstLocalDB = false;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(SharedConstants.Scenes.Company);
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded) {
      if (!this.publicationDataProcessedAgainstLocalDB) {
        let { users, companies, properties } = nextProps;
        let added = db.add({ users, companies });
        let synced = db.sync({ properties });
        if (added && synced) {
          this.publicationDataProcessedAgainstLocalDB = true;
          db.markDataAsSaved('company');
        }
      }
    }
  }




  getResizedImageDimensions(width, height) {
    let resizedHeight, resizedWidth;
    let aspectRatio = width / height;
    let pixelRatio = PixelRatio.get();

    if (this.state.landscape) {
      resizedHeight = Display.ShortSide;
      resizedWidth = resizedHeight * aspectRatio;
    } else {
      resizedHeight = Display.LongSide;
      resizedWidth = resizedHeight * aspectRatio;
    }

    return { width: resizedWidth, height: resizedHeight };
  }




  handleInviteMembers() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to invite while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    Actions[SharedConstants.Subscenes.InviteMembers]({ companyId: this.props.companyId });
  }




  handleSave() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to save changes while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    this.setState({
      editingCompany: false,
      actionConfirmed: true,
    });
  }




  handleCancel() {
    this.setState({
      editingCompany: false,
      actionConfirmed: false,
    });
  }




  registerInKeyboardAwareScrollView(item) {
    this.keyboardAwareScrollViewTextInputs.push(item);
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let { companyId, companies, users } = this.props;


    let statusBar = (
      <StatusBar
        hidden={this.state.landscape}
        barStyle='light-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    let wallpaperView = (
      <View style={styles.wallpaperView}>
        <Image
          resizeMode='cover'
          source={WallpaperImageSource}
          style={[
            styles.wallpaperView,
            this.getResizedImageDimensions(
              WallpaperImageWidth,
              WallpaperImageHeight
            )
          ]}
        />
      </View>
    );


    let company = companies.find(company => company._id === companyId) || {};

    let companyCard = (
      <CompanyCard
        company={company}
        properties={this.props.properties}
        editing={this.state.editingCompany}
        onStartEditing={() => this.setState({ editingCompany: true })}
        onChange={(fieldsValidated) => {
          this.setState({ actionButtonDisabled: !fieldsValidated });
        }}
        saveOnEndEditing={this.state.actionConfirmed}
        registerInKeyboardAwareScrollView={this.registerInKeyboardAwareScrollView}
      />
    );


    let companyMembers = [];
    users.forEach && users.forEach(user => {
      let userIsCompanyMember = (
        user.companies &&
        user.companies.some &&
        user.companies.some(userCompany => userCompany.companyId === companyId)
      );
      if (userIsCompanyMember) { companyMembers.push(user); }
    });

    let companyMembersList = companyMembers.length ? (
      <MembersList
        company={company}
        members={companyMembers}
      />
    ) : null;


    let addIcon = (
      <Icon
        name='add'
        size={28}
        color='white'
        style={styles.addIcon}
      />
    );


    let inviteMembersButton = !this.state.editingCompany && userHelper.isCompanyAdmin(this.props.companyId) ? (
      <View style={styles.inviteMembersButton}>
        <AccentColoredFab onPress={this.handleInviteMembers}>
          <Icon
            name={'person-add'}
            size={25}
            color='white'
          />
        </AccentColoredFab>
      </View>
    ) : null;


    let actionButtonsBar = this.state.editingCompany ? (
      <ActionButtonsBar
        buttons={[{
          disabled: this.state.actionButtonDisabled,
          label: 'SAVE',
          onPress: this.handleSave,
        }, {
          label: 'CANCEL',
          onPress: this.handleCancel,
        }]}
      />
    ) : null;


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          this.context.hideSnackbar();
          return false;
        }}
        style={styles.wrapperView}
      >
        {wallpaperView}
        {statusBar}
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps='always'
          textInputs={this.keyboardAwareScrollViewTextInputs}
          bounces={false}
        >
          {companyCard}
          {companyMembersList}
        </KeyboardAwareScrollView>
        {inviteMembersButton}
        {actionButtonsBar}
      </View>
    );
  }

}

CompanyContainer.propTypes = {
  companyId: PropTypes.string,
  dataLoaded: PropTypes.bool,
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

CompanyContainer.contextTypes = {
  hideSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  wallpaperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  addIcon: {
    marginRight: -5,
  },
  inviteMembersButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
      companyId,
      dataLoaded: true,
      users: [],
      companies: [],
      properties: [],
    };
  }

  const subscriptionHandle = Meteor.subscribe('collectionsForCompanyProfile', companyId);

  let dataLoaded = subscriptionHandle.ready();

  return {
    companyId,
    dataLoaded,
    users: dataLoaded ? Meteor.collection('users').find() : db.getUsers(),
    companies: dataLoaded ? Meteor.collection('companies').find() : db.getCompanies(),
    properties: dataLoaded ? Meteor.collection('properties').find() : db.getProperties(),
  };
}, CompanyContainer);
