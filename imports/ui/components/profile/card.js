
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

import Theme from '../../theme';

const { Canvas1Color, Border1Color } = Theme.Palette;




const Card = (props) => {

  return (
    <View style={
      !props.style ?
        styles.cardView :
        [ styles.cardView, props.style ]
    }>
      {props.children}
    </View>
  );

}

Card.propTypes = {
  style: View.propTypes.style,
};




const styles = StyleSheet.create({
  cardView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: Canvas1Color,
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: (Platform.Version < 21) ? {
        borderColor: Border1Color,
        borderWidth: StyleSheet.hairlineWidth,
      } : {
        elevation: 3,
      },
    }),
  },
});


export default Card;
