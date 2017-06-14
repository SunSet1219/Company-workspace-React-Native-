
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Image,
  Platform,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import ProgressiveImage from '../progressive-image';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { TextColor, WhiteTextColor } = Theme.Palette;
const { BoldFontSettings } = Theme.Font;
const { RoomCardHeight } = UISharedConstants;
const FooterOverlayHeight = 100;
const FooterOverlayImage = require('../../../resources/room-card-overlay-gradient.png');




const RoomCard = (props) => {

  const room = props.room || {};
  const { imgUrls, name, location, capacity, av, phone, whiteboard } = room;
  const imageUri = imgUrls && imgUrls[0] && imgUrls[0].cdnRetinaMedium;
  const roomNameText = name || '';
  const floor = location && location.floor;
  const floorText = floor !== undefined ? `${floor}fl.` : '';
  const seatsNumber = capacity && capacity.number;
  const capacityText = seatsNumber !== undefined ? `${seatsNumber} SEAT` : '';
  const tvText = (av && av.tv) ? 'TV' : '';
  const appleTvText = (av && av.appleTv) ? 'APPLE TV' : '';
  const videoconText = (av && av.videocon) ? 'VIDEO CONFERENCING' : '';
  const phoneText = phone && phone.exists ? 'PHONE' : '';
  const whiteboardText = whiteboard && whiteboard.exists ? 'WHITEBOARD' : '';

  let amenitiesText = '';
  [ capacityText, phoneText, tvText, appleTvText, whiteboardText, videoconText ].forEach(item => {
    if (item) { amenitiesText += amenitiesText ? `  ·  ${item}` : `${item}`; }
  });


  const backgroundImage = (
    <ProgressiveImage
      resizeMode='cover'
      source={{ uri: imageUri }}
      style={styles.backgroundImage}
    />
  );


  const floorLabel = floorText ? (
    <Text style={styles.floorLabel}>
      {floorText}
    </Text>
  ) : null;


  const roomNameLabel = roomNameText ? (
    <Text style={styles.roomNameLabel}>
      {roomNameText}
    </Text>
  ) : null;


  const amenitiesLabel = amenitiesText ? (
    <Text style={styles.amenitiesLabel}>
      {amenitiesText}
    </Text>
  ) : null;


  const footerOverlay = (
    <Image
      resizeMode='stretch'
      source={FooterOverlayImage}
      style={styles.footerOverlay}
    >
      <View style={styles.rowView}>
        {floorLabel}
        {roomNameLabel}
      </View>
      {amenitiesLabel}
    </Image>
  );


  return (
    <View style={styles.wrapperView}>
      {backgroundImage}
      {footerOverlay}
    </View>
  );

};

RoomCard.propTypes = {
  room: PropTypes.object,
};




const styles = StyleSheet.create({
  wrapperView: {
    height: RoomCardHeight,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  footerOverlay: {
    flex: 1,
    bottom: 0,
    maxHeight: FooterOverlayHeight,
    width: null,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 30,
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  floorLabel: {
    ...BoldFontSettings,
    fontSize: 14.5,
    color: TextColor,
    paddingHorizontal: 6,
    marginTop: 5,
    backgroundColor: 'white',
    opacity: 0.9,
  },
  roomNameLabel: {
    ...BoldFontSettings,
    fontSize: 23,
    color: WhiteTextColor,
    marginLeft: 10,
  },
  amenitiesLabel: {
    ...BoldFontSettings,
    fontSize: 10.5,
    lineHeight: 18,
    color: WhiteTextColor,
    marginTop: Platform.OS === 'ios' ? 7 : 5,
  },
});


export default RoomCard;
