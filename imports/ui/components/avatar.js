
'use strict';


import React, {
  PropTypes,
} from 'react';

import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Logo from '../../resources/logo.png';
import userHelper from '../helpers/user-helper';

const AvatarSize = 50;
const LetterFontSizeMultiplier = 0.55;
const AlphabetColors = [
  '#1abc9c', '#16a085', '#f1c40f', '#f39c12', '#2ecc71', '#27ae60', '#d35400',
  '#d35400', '#3498db', '#2980b9', '#e74c3c', '#c0392b', '#9b59b6', '#8e44ad',
  '#bdc3c7', '#34495e', '#2c3e50', '#95a5a6', '#7f8c8d', '#ec87bf', '#d870ad',
  '#f69785', '#9ba37e', '#b49255', '#b49255', '#a94136'
];




const Avatar = (props) => {

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';

    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  };



  const getLetterColor = (letter) => {
    const charCode = letter.charCodeAt(0);
    let color;

    if (charCode < 65) {
      color = getRandomColor();
    } else {
      let colorIndex = Math.floor((charCode - 65) % AlphabetColors.length);
      color = AlphabetColors[colorIndex];
    }

    return color;
  };



  const avatarDimensions = props.size ? {
    height: props.size,
    width: props.size,
    borderRadius: props.size / 2,
  } : styles.avatarDimensions;


  const { username, email, avatarUrl } = props.showCurrentUserAvatar ?
    userHelper.getUserDataForAvatar() :
    props;


  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={!props.style ? avatarDimensions : [ avatarDimensions, props.style ]}
      />
    );
  }


  if (username || email) {
    const letter = (username || email).charAt(0).toUpperCase();
    const backgroundColor = getLetterColor(letter);

    return (
      <View style={
        !props.style ?
          [ avatarDimensions, styles.avatarView, { backgroundColor }] :
          [ avatarDimensions, styles.avatarView, props.style, { backgroundColor }]
      }>
        <Text style={
          !props.size ?
            styles.letter :
            [ styles.letter, { fontSize: props.size * LetterFontSizeMultiplier }]
        }>
          {letter}
        </Text>
      </View>
    );
  }


  return (
    <Image
      source={Logo}
      style={!props.style ? avatarDimensions : [ avatarDimensions, props.style ]}
    />
  );

};

Avatar.propTypes = {
  username: PropTypes.string,
  email: PropTypes.string,
  avatarUrl: PropTypes.string,
  showCurrentUserAvatar: PropTypes.bool,
  size: PropTypes.number,
  style: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object
  ]),
};




const styles = StyleSheet.create({
  avatarDimensions: {
    height: AvatarSize,
    width: AvatarSize,
    borderRadius: AvatarSize / 2,
  },
  avatarView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontSize: AvatarSize * LetterFontSizeMultiplier,
    fontWeight: '600',
    color: 'white',
  },
});


export default Avatar;
