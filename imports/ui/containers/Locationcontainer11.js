import React,{Component} from 'react';
import {
  AppRegistry,
  Text,
  View,
  Navigator,
  Button
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Location from './Locationcontainer'



const App = StackNavigator({
  Home: { screen: Location },

});
AppRegistry.registerComponent('App',()=>App);
