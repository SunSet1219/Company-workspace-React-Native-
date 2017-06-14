
'use strict';


import {
  Platform,
  StatusBar,
} from 'react-native';

const StatusBarHeight = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const NavigationBarHeight = Math.round(StatusBarHeight * 2.33);

const UISharedConstants = {
  StatusBarHeight,
  NavigationBarHeight,
  ActionButtonsBarHeight: 48,
  ActionFabSize: 54,
  LoadingSpinnerSize: 27,
  MyKnotelContainerPaddingHorizontal: 10,
  RoomCardHeight: 200,
  RoomsContainerPaddingHorizontal: 18,
  TitleBarHeight: 48,
};


export default UISharedConstants;
