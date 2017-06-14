
'use strict';


import React, {
  PureComponent,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Modal,
  StyleSheet,
  View,
} from 'react-native';

import Theme from '../theme';

const { Canvas1Color, ModalOverlayColor } = Theme.Palette;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};

const styles = StyleSheet.create({
  modalOuterView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ModalOverlayColor,
  },
  modalInnerView: {
    width: Display.ShortSide * 0.85,
    maxHeight: Display.ShortSide * 0.9,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 20,
    paddingBottom: 15,
    borderRadius: 15,
    backgroundColor: Canvas1Color,
  },
});




class ModalView extends PureComponent {

   constructor(props) {
     super(props);

     this.handleModalOuterViewTouch = this.handleModalOuterViewTouch.bind(this);
     this.handleModalInnerViewTouch = this.handleModalInnerViewTouch.bind(this);

     this.innerViewTouched = false;
   }



   handleModalOuterViewTouch() {
     if (this.innerViewTouched) this.innerViewTouched = false;
     else this.props.onRequestClose();
     return false;
   }




   handleModalInnerViewTouch() {
     this.innerViewTouched = true;
     return false;
   }




   render() {
     const { props } = this;

     return (
       <Modal
         animationType='fade'
         onRequestClose={props.onRequestClose}
         supportedOrientations={[ 'portrait', 'landscape' ]}
         transparent={true}
         visible={props.visible}
       >
         <View
           onStartShouldSetResponder={this.handleModalOuterViewTouch}
           style={styles.modalOuterView}
         >
           <View
             onStartShouldSetResponder={this.handleModalInnerViewTouch}
             style={props.style}
           >
             {props.children}
           </View>
         </View>
       </Modal>
     );
   }
}

ModalView.propTypes = {
  onRequestClose: PropTypes.func,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number
  ]),
  visible: PropTypes.bool,
};

ModalView.defaultProps = {
  onRequestClose: () => {},
  style: styles.modalInnerView,
  visible: false,
};


export default ModalView;
