
'use strict';


import React from 'react';

import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import UISharedConstants from '../../ui-shared-constants';

const { StatusBarHeight } = UISharedConstants;




const BookingAppBar = (props) => (
  <View style={styles.wrapperView}>
    {props.children}
  </View>
);




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: StatusBarHeight,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        zIndex: 999,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});


export default BookingAppBar;
