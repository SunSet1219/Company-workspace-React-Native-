
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




const ModalDialog = (props) => {

  let titleView = props.title ? (
    <View style={styles.titleView}>
      <Text style={styles.titleText}>
        {props.title}
      </Text>
    </View>
  ) : null;


  let actionButtonsView = (
    <View style={styles.actionButtonsView}>
      <FlatButton
        label='CANCEL'
        labelStyle={styles.actionButtonLabel}
        onPress={props.onCancel}
        primary={true}
        style={styles.actionButton}
      />
      <FlatButton
        label='OK'
        labelStyle={styles.actionButtonLabel}
        onPress={props.onSubmit}
        primary={true}
        style={styles.actionButton}
      />
    </View>
  );


  return (
    <ModalView
      visible={props.visible}
      onRequestClose={props.onCancel}
    >
      {titleView}
      {props.children}
      {actionButtonsView}
    </ModalView>
  );

}

ModalDialog.propTypes = {
  title: PropTypes.string,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  visible: PropTypes.bool,
};

ModalDialog.defaultProps = {
  title: '',
  onCancel: () => {},
  onSubmit: () => {},
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
  actionButtonsView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  actionButtonLabel: {
    fontSize: ActionButtonLabelFontSize,
    fontWeight: '500',
    color: FlatActionButtonLabelColor,
  },
  actionButton: {
    height: 36,
    width: 86,
  },
});


export default ModalDialog;
