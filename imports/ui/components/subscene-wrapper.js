
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  Keyboard,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import KeyboardAwareScrollView from './keyboard-aware-scroll-view';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { StatusBarColor, Canvas1Color } = Theme.Palette;
const { StatusBarHeight } = UISharedConstants;

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class SubsceneWrapper extends Component {

  constructor(props) {
    super(props);

    this.state = {
      landscape: false,
    };

    this.scrollBy = this.scrollBy.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.scrollView = null;
  }




  componentWillMount() {
    this.context.navigationTracker.setSubscene();
  }




  componentWillUnmount() {
    this.context.navigationTracker.unsetSubscene();
  }




  scrollBy({ offsetY, animated }) {
    this.scrollView &&
    this.scrollView.scrollBy &&
    this.scrollView.scrollBy({ offsetY, animated });
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let statusBar = (
      <StatusBar
        hidden={this.state.landscape}
        barStyle='dark-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    let statusBarUnderlayView = !this.state.landscape ? (
      <View style={styles.statusBarUnderlayView} />
    ) : null;


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          this.context.hideSnackbar();
          return false;
        }}
        style={styles.wrapperView}
      >
        {statusBar}
        {statusBarUnderlayView}
        <KeyboardAwareScrollView
          ref={ref => this.scrollView = ref}
          bounces={false}
          contentContainerStyle={styles.scrollViewContentContainer}
          keyboardShouldPersistTaps='always'
          textInputs={this.props.keyboardAwareScrollViewTextInputs}
        >
          {this.props.children}
        </KeyboardAwareScrollView>
        {this.props.actionButtonsBar}
      </View>
    );
  }

}

SubsceneWrapper.propTypes = {
  keyboardAwareScrollViewTextInputs: PropTypes.array,
  actionButtonsBar: PropTypes.element,
};

SubsceneWrapper.contextTypes = {
  hideSnackbar: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: Canvas1Color,
  },
  statusBarUnderlayView: {
    height: StatusBarHeight,
    backgroundColor: Canvas1Color,
  },
  scrollViewContentContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 14,
    paddingBottom: 28,
    paddingHorizontal: 28,
  },
});


export default SubsceneWrapper;
