
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import Theme from '../../theme';
import ProgressiveImage from '../progressive-image';
import SharedConstants from '../../../api/constants/shared';

const { BoldFontSettings, RegularFontSettings, TextFontSize } = Theme.Font;
const { MainTextColorNew } = Theme.Palette;
const { Scenes } = SharedConstants;

const ImageURISize = 64;




const PropertyInfo = (props) => {

  const { property = {}} = props;
  const propertyName = property.title;
  const propertyAddress = property.addressLine;
  const imageUri = property.imgUrls && property.imgUrls[0] && property.imgUrls[0].cdnSmall;
  const companyName = props.company && props.company.name;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => Actions[SharedConstants.Scenes.Company]()}
    >
      <View style={styles.wrapperView}>
        <ProgressiveImage
          resizeMode='cover'
          source={{ uri: imageUri }}
          style={styles.image}
        />
        <View style={styles.textInfo}>
          <Text style={styles.boldFont}> {companyName} </Text>
          <Text style={styles.standardFont}> {propertyName} </Text>
          <Text style={styles.standardFont}> {propertyAddress} </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

};


PropertyInfo.propTypes = {
  company: PropTypes.object,
  property: PropTypes.object,
};


const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  image: {
    height: ImageURISize,
    width: ImageURISize,
  },
  textInfo: {
    height: ImageURISize,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  standardFont: {
    ...RegularFontSettings,
    fontSize: TextFontSize,
    color: MainTextColorNew,
  },
  boldFont: {
    ...BoldFontSettings,
    fontSize: TextFontSize,
    color: MainTextColorNew,
  },
});


export default PropertyInfo;
