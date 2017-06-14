
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import FlatButton from './flat-button';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { Primary1Color, Canvas1Color, WhiteTextColor } = Theme.Palette;
const { ActionButtonLabelFontSize2 } = Theme.Font;
const { ActionButtonsBarHeight } = UISharedConstants;




const ActionButtonsBar = (props) => {

  let { buttons } = props;
  let buttonViews = [];


  buttons && buttons.forEach((item, i) => {
    if (i > 0) {
      buttonViews.push(
        <View key={i+'_'} style={styles.buttonsSeparator} />
      );
    }

    buttonViews.push(
      <FlatButton
        key={i}
        disabled={item.disabled}
        label={item.label}
        labelStyle={styles.buttonLabel}
        onPress={item.onPress}
        primary={true}
        style={!item.style ? styles.button : [ styles.button, item.style ]}
      />
    );
  });


  return (
    <View style={styles.barView}>
      {buttonViews}
    </View>
  );

};

ActionButtonsBar.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      disabled: PropTypes.bool,
      label: PropTypes.string,
      onPress: PropTypes.func,
      style: PropTypes.object,
    })
  ),
};




const styles = StyleSheet.create({
  barView: {
    height: ActionButtonsBarHeight,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: Primary1Color,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  button: {
    flex: 1,
    height: ActionButtonsBarHeight,
  },
  buttonLabel: {
    fontSize: ActionButtonLabelFontSize2,
    fontWeight: '500',
    color: WhiteTextColor,
  },
  buttonsSeparator: {
    height: ActionButtonsBarHeight,
    width: StyleSheet.hairlineWidth,
    backgroundColor: Canvas1Color,
  },
});


export default ActionButtonsBar;
