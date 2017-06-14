
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Alert,
  Dimensions,
  InteractionManager,
  ListView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { Duration } from '../components/snackbar';
import { MKButton, MKSpinner } from '../material-ui';
import BroadcastCard from '../components/broadcasts/broadcast-card';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import NoDataPlaceholder from '../components/no-data-placeholder';
import SceneWrapperWithOrientationState from './scene-wrapper-with-orientation-state';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';
import userHelper from '../helpers/user-helper';

const { Border1Color } = Theme.Palette;
const { LoadingSpinnerSize, ActionFabSize } = UISharedConstants;
const { Subscenes } = SharedConstants;

const Display = {
  LongSide: Math.max(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class BroadcastsEditor extends Component {

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => true });

    this.state = {
      dataSource: ds,
      showPlaceholder: true,
    };

    this.renderBroadcasts = this.renderBroadcasts.bind(this);
    this.handleAddBroadcast = this.handleAddBroadcast.bind(this);
    this.handleEditBroadcast = this.handleEditBroadcast.bind(this);
    this.handleDeleteBroadcast = this.handleDeleteBroadcast.bind(this);
    this.deleteBroadcast = this.deleteBroadcast.bind(this);
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded) {
      this.renderBroadcasts(nextProps);
    }
  }




  renderBroadcasts(nextProps) {
    let { broadcasts, users, properties, smsMessages } = nextProps;
    let listViewData = [];

    broadcasts.forEach(broadcast => {
      listViewData.push({
        broadcast,
        users,
        properties,
        smsMessages,
      });
    });

    InteractionManager.runAfterInteractions(() => {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(listViewData),
        showPlaceholder: false,
      });
    });
  }




  handleAddBroadcast() {
    Actions[Subscenes.BroadcastsAddEditForm]({
      editing: false,
      properties: this.props.properties,
    });
  }




  handleEditBroadcast(broadcast) {
    Actions[Subscenes.BroadcastsAddEditForm]({
      editing: true,
      broadcast: broadcast,
      properties: this.props.properties,
    });
  }




  handleDeleteBroadcast(broadcast) {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to delete while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    Alert.alert(
      `Are you sure you want to remove ${broadcast.title}?`,
      '',
      [
        { text: 'Cancel' },
        { text: 'Confirm', onPress: () => this.deleteBroadcast(broadcast._id) },
      ]
    );
  }




  deleteBroadcast(broadcastId) {
    Meteor.call('deleteBroadcast', broadcastId, (error) => {
      if (error) {
        return this.context.showSnackbar({
          message: error.reason || 'Failed to delete broadcast.',
          duration: Duration.Indefinite,
          button: {
            label: 'CLOSE',
          },
        });
      }

      this.context.showSnackbar({
        message: 'Broadcast removed successfully.',
        duration: Duration.Short,
      });
    });
  }




  render() {
    let { users, broadcasts, properties, smsMessages } = this.props;


    let placeholderView = (
      <View style={styles.placeholderView}>
        <SingleColorSpinner />
      </View>
    );


    let renderHeader = () => (
      !broadcasts.length ? (
        <NoDataPlaceholder label='No broadcasts' />
      ) : null
    );


    let renderRow = (rowData) => (
      <View style={styles.broadcastCardWrapperView}>
        <BroadcastCard
          broadcast={rowData.broadcast}
          users={rowData.users}
          properties={rowData.properties}
          smsMessages={rowData.smsMessages}
          onEdit={this.handleEditBroadcast}
          onDelete={this.handleDeleteBroadcast}
        />
      </View>
    );


    let broadcastsList = (
      <ListView
        contentContainerStyle={styles.listViewContentContainer}
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        initialListSize={4}
        renderHeader={renderHeader}
        renderRow={renderRow}
        scrollRenderAheadDistance={Display.LongSide}
      />
    );


    let addBroadcastButton = (
      <View style={styles.addBroadcastButton}>
        <AccentColoredFab onPress={this.handleAddBroadcast}>
          <Icon
            name={'add'}
            size={24}
            color='white'
          />
        </AccentColoredFab>
      </View>
    );


    return (
      <SceneWrapperWithOrientationState title='Broadcasts'>
        {this.state.showPlaceholder ? placeholderView : broadcastsList}
        {addBroadcastButton}
      </SceneWrapperWithOrientationState>
    );
  }

}

BroadcastsEditor.propTypes = {
  dataLoaded: PropTypes.bool,
  users: PropTypes.array,
  broadcasts: PropTypes.array,
  properties: PropTypes.array,
  smsMessages: PropTypes.array,
};

BroadcastsEditor.contextTypes = {
  showSnackbar: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  placeholderView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: LoadingSpinnerSize,
    height: LoadingSpinnerSize,
  },
  listViewContentContainer: {
    paddingVertical: 8,
  },
  broadcastCardWrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
  },
  addBroadcastButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  actionFab: {
    width: ActionFabSize,
    height: ActionFabSize,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
    elevation: 6,
  },
});




const SingleColorSpinner = MKSpinner.singleColorSpinner()
  .withStyle(styles.loadingSpinner)
  .build();

const AccentColoredFab = MKButton.accentColoredFab()
  .withStyle(styles.actionFab)
  .build();




export default createContainer(() => {
  if (!Meteor.userId()) {
    return {
      dataLoaded: false,
      users: [],
      broadcasts: [],
      properties: [],
      smsMessages: [],
    };
  }

  const subscriptionHandle = Meteor.subscribe('collectionsForBroadcastsEditor');

  return {
    dataLoaded: subscriptionHandle.ready(),
    users: Meteor.collection('users').find(),
    broadcasts: Meteor.collection('broadcasts').find({}, { sort: { createdAt: -1 }}),
    properties: Meteor.collection('properties').find(),
    smsMessages: Meteor.collection('smsMessages').find(),
  };
}, BroadcastsEditor);
