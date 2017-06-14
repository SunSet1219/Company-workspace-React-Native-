
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ScrollView,
  StyleSheet,
} from 'react-native';

import LocationPicker from '../components/my-knotel/location-picker';
import MarkdownTextWithIcon from '../components/my-knotel/markdown-text-with-icon';
import MyKnotelParser from '../helpers/my-knotel-parser';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import optionsHelper from '../helpers/options-helper';
import SceneWrapperWithOrientationState from './scene-wrapper-with-orientation-state';
import SharedConstants from '../../api/constants/shared';
import Staff from '../components/my-knotel/staff';
import UISharedConstants from '../ui-shared-constants';

const { MyKnotelContainerPaddingHorizontal } = UISharedConstants;

const myKnotelComponents = {
  Staff,
  MarkdownTextWithIcon,
};




class MyKnotel extends Component {

  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(SharedConstants.Scenes.MyKnotel);
  }

  render() {

    const { dataLoaded, properties, myKnotelPage, propertyId, onSelectProperty } = this.props;

    const locationPickerOptions = dataLoaded ?
      optionsHelper.getPropertiesOptionsForMyKnotel(properties) : [];
    const locationPickerSelectedIndex = propertyId ?
      locationPickerOptions.findIndex(item => item.id === propertyId) : 0;
    const locationPicker = (
      <LocationPicker
        menuItems={locationPickerOptions}
        onChange={({ id }) => onSelectProperty(id)}
        selectedIndex={locationPickerSelectedIndex}
      />
    );

    const yamlData = myKnotelPage && myKnotelPage.data || '';
    const parsedYamlComponents = MyKnotelParser.parse(myKnotelComponents, yamlData, false).map(
      ({ Component, props }, index) => (<Component {...props} key={index}/>));

    return (
      <SceneWrapperWithOrientationState>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollViewContentContainer}
        >
          {locationPicker}
          {parsedYamlComponents}
        </ScrollView>
      </SceneWrapperWithOrientationState>
    );
  }
}

MyKnotel.contextTypes = {
  navigationTracker: PropTypes.object,
};


MyKnotel.propTypes = {
  dataLoaded: PropTypes.bool.isRequired,
  propertyId: PropTypes.string.isRequired,
  properties: PropTypes.array.isRequired,
  onSelectProperty: PropTypes.func.isRequired,
  myKnotelPage: PropTypes.object.isRequired,
};


const styles = StyleSheet.create({
  scrollViewContentContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: MyKnotelContainerPaddingHorizontal,
  },
});


const MyKnotelDataContainer = createContainer((params) => {
  const { propertyId, onSelectProperty } = params;

  if (!Meteor.userId()) {
    return {
      onSelectProperty,
      propertyId,

      dataLoaded: false,
      properties: [],
      myKnotelPage: {},
    };
  }

  const subscriptionHandle = Meteor.subscribe('ReadMyKnotelPage', propertyId);
  return {
    onSelectProperty,
    propertyId,

    dataLoaded: subscriptionHandle.ready(),
    properties: Meteor.collection('properties').find() || [],
    myKnotelPage: Meteor.collection('myKnotelPages').findOne() || {},
  };
}, MyKnotel);



class MyKnotelPageContainer extends Component {

  constructor(props){
    super(props);

    this.state = { propertyId: '' };
    this.onSelectProperty = this.onSelectProperty.bind(this);
  }

  onSelectProperty(propertyId){
    this.setState({ propertyId });
  }

  render(){
    return <MyKnotelDataContainer propertyId={this.state.propertyId} onSelectProperty={this.onSelectProperty} />
  }
}

export default MyKnotelPageContainer;
