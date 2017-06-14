
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  View
} from 'react-native';

import RoomDescriptionItem from './room-description-item';




const RoomDescription = (props) => {

  let getAvNoteTextValue = (av) => {
    let avNoteTextValue = av.tv ? 'TV' : '';
    if (av.appleTv) {
      avNoteTextValue += avNoteTextValue ?
        ', Apple TV' :
          'Apple TV' ;
    }
    if (av.videocon) {
      avNoteTextValue += avNoteTextValue ?
        ', Video Conferencing' :
          'Video Conferencing' ;
    }
    if (av.notes) {
      avNoteTextValue += avNoteTextValue ?
        `, Notes: ${av.notes}` :
          `Notes: ${av.notes}` ;
    }
    return avNoteTextValue;
  };




  let getPhoneTextValue = (phone) => {
    let phoneTextValue = '';
    let { number, notes } = phone;
    if (number) { phoneTextValue = number; }
    if (notes) { phoneTextValue += phoneTextValue ? ` (${notes})` : `${notes}`; }
    return phoneTextValue;
  };




  let { room } = props;

  let capacityView = room.capacity ? (
    <RoomDescriptionItem
      icon={{ name: 'people' }}
      iconText={{ value: room.capacity.number }}
      noteText={{ value: room.capacity.notes }}
    />
  ) : (
    <RoomDescriptionItem
      icon={{ name: 'people' }}
    />
  );


  let locationView = room.location ? (
    <RoomDescriptionItem
      icon={{ name: 'directions' }}
      noteText={{ value: room.location.directions }}
    />
  ) : (
    <RoomDescriptionItem
      icon={{ name: 'directions' }}
    />
  );


  let phoneView = room.phone && room.phone.exists ? (
    <RoomDescriptionItem
      icon={{ name: 'phone' }}
      noteText={{ value: getPhoneTextValue(room.phone) }}
    />
  ) : null;


  let whiteboardView = room.whiteboard && room.whiteboard.exists ? (
    <RoomDescriptionItem
      icon={{ name: 'border-color' }}
      noteText={{
        value: room.whiteboard.notes ?
          `Whiteboard, ${room.whiteboard.notes}` :
          'Whiteboard'
      }}
    />
  ) : null;


  let avView = room.av && (room.av.tv || room.av.appleTv || room.av.videocon) ? (
    <RoomDescriptionItem
      icon={{ name: 'desktop-windows' }}
      noteText={{ value: getAvNoteTextValue(room.av) }}
    />
  ) : null;


  let notesView = room.notes ? (
    <RoomDescriptionItem
      noteText={{ value: room.notes }}
    />
  ) : null;


  return (
    <View style={styles.wrapperView}>
      {capacityView}
      {locationView}
      {phoneView}
      {whiteboardView}
      {avView}
      {notesView}
    </View>
  );

};

RoomDescription.propTypes = {
  room: PropTypes.shape({
    capacity: PropTypes.object,
    location: PropTypes.object,
    phone: PropTypes.object,
    whiteboard: PropTypes.object,
    av: PropTypes.object,
    notes: PropTypes.string
  })
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
});


export default RoomDescription;
