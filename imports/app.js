'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Alert,
  BackHandler,
  Dimensions,
  View,
  Keyboard,
  Linking,
} from 'react-native';

import {
  Actions,
  ActionConst,
  Router,
  Scene,
} from 'react-native-router-flux';



class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Router
          hideNavBar={true}
          hideTabBar={true}
          scenes={this.scenes}
        />
        <Snackbar ref={ref => { this.snackbar = ref; }} />
        <NavigationBar
          ref={ref => { this.navigationBar = ref; }}
          initialScene={Scenes.Booking}
        />
      </View>
    );
  }
}
