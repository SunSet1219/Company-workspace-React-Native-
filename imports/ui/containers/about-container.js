
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  InteractionManager,
  Text,
  View,
  WebView,
} from 'react-native';

import SceneWrapperWithOrientationState from './scene-wrapper-with-orientation-state';
import SharedConstants from '../../api/constants/shared';

const SceneTransitionMaxDelayMS = 400;




class AboutContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showPlaceholder: true,
    };

    this.sceneTransitionTimeout = null;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(SharedConstants.Scenes.About);
  }




  componentDidMount() {
    let p1 = new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(resolve);
    });

    let p2 = new Promise((resolve, reject) => {
      this.sceneTransitionTimeout = setTimeout(resolve, SceneTransitionMaxDelayMS);
    });

    let callback = () => {
      this.setState({ showPlaceholder: false });
    };

    Promise.race([ p1, p2 ]).then(callback).catch(callback);
  }




  componentWillUnmount() {
    this.sceneTransitionTimeout && clearTimeout(this.sceneTransitionTimeout);
  }




  render() {
    let webView = !this.state.showPlaceholder ? (
      <WebView
        source={{ uri: 'https://knotel.com/terms#mobileApp' }}
        startInLoadingState={true}
        decelerationRate={2}
      />
    ) : null;


    return (
      <SceneWrapperWithOrientationState title='About'>
        {webView}
      </SceneWrapperWithOrientationState>
    );
  }

}

AboutContainer.contextTypes = {
  navigationTracker: PropTypes.object,
};


export default AboutContainer;
