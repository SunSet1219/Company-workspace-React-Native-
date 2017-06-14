
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Avatar from '../avatar';
import Theme from '../../theme';
import userHelper from '../../helpers/user-helper'

const { HeaderFontSizeNew, BoldFontSettings } = Theme.Font;
const { MainTextColorNew } = Theme.Palette;
const AvatarSize = 60;


const ProfilePreview = (props) => {

  const profileView = () => {

    const fullName = userHelper.getName(props.user);

    return (
      <View style={styles.wrapperView}>
        <Avatar
          showCurrentUserAvatar={true}
          size={AvatarSize}
        />
        <Text style={styles.name}>
          {fullName}
        </Text>
      </View>
    );
  };


  return profileView()

};


ProfilePreview.propTypes = {
  user: PropTypes.object,
};


const styles = StyleSheet.create({
  wrapperView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...BoldFontSettings,
    fontSize: HeaderFontSizeNew,
    color: MainTextColorNew,
    marginTop: 5,
    marginBottom: 25,
  },
});


export default ProfilePreview;
