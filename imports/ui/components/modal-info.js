
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

import FlatButton from './flat-button';
import ModalView from './modal-view';
import Theme from '../theme';

const { TextColor, FlatActionButtonLabelColor } = Theme.Palette;
const { ModalTitleFontSize, ActionButtonLabelFontSize } = Theme.Font;




const ModalInfo = (props) => {

  let titleView = props.title ? (
    <View style={styles.titleView}>
      <Text style={styles.titleText}>
        {props.title}
      </Text>
    </View>
  ) : null;


  let actionButton = (
    <FlatButton
      label='OK'
      labelStyle={styles.actionButtonLabel}
      onPress={props.onRequestClose}
      primary={true}
      style={styles.actionButton}
    />
  );


  return (
    <ModalView
      visible={props.visible}
      onRequestClose={props.onRequestClose}
    >
      {titleView}
      {props.children}
      {actionButton}
    </ModalView>
  );

}

ModalInfo.propTypes = {
  title: PropTypes.string,
  onRequestClose: PropTypes.func,
  visible: PropTypes.bool,
};

ModalInfo.defaultProps = {
  title: '',
  onRequestClose: () => {},
  visible: false,
};




const styles = StyleSheet.create({
  titleView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleText: {
    fontSize: ModalTitleFontSize,
    fontWeight: '500',
    textAlign: 'center',
    color: TextColor,
  },
  actionButtonLabel: {
    fontSize: ActionButtonLabelFontSize,
    fontWeight: '500',
    color: FlatActionButtonLabelColor,
  },
  actionButton: {
    height: 36,
    width: 86,
    alignSelf: 'center',
    marginTop: 20,
  },
});


export default ModalInfo;
