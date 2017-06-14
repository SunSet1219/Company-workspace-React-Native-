
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import ReactNative, {
  Dimensions,
  Keyboard,
  ScrollView,
} from 'react-native';




class KeyboardAwareScrollView extends Component {

  constructor(props) {
    super(props);

    this.keyboardWillShow = this.keyboardWillShow.bind(this);
    this.keyboardWillHide = this.keyboardWillHide.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this.scrollBy = this.scrollBy.bind(this);
    this.scrollToFocusedTextInputIfKeyboardOverlapsIt =
      this.scrollToFocusedTextInputIfKeyboardOverlapsIt.bind(this);
    this.onLayout = this.onLayout.bind(this);
    this.onContentSizeChange = this.onContentSizeChange.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.scrollToBottomIfOverscrolled = this.scrollToBottomIfOverscrolled.bind(this);

    this.keyboardWillShowEventSubscription = null;
    this.keyboardWillHideEventSubscription = null;
    this.scrollView = null;
    this.scrollViewTopY = 0;
    this.scrollViewHeight = 0;
    this.scrollViewContentHeight = 0;
    this.currentContentOffsetY = 0;
    this.savedContentOffsetY = this.currentContentOffsetY;
  }




  componentWillMount() {
    this.keyboardWillShowEventSubscription =
      Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);

    this.keyboardWillHideEventSubscription =
      Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  }




  componentWillUnmount() {
    this.keyboardWillShowEventSubscription.remove();
    this.keyboardWillHideEventSubscription.remove();
  }




  keyboardWillShow(event) {
    this.savedContentOffsetY = this.currentContentOffsetY;
    this.scrollToFocusedTextInputIfKeyboardOverlapsIt(event);
  }




  keyboardWillHide() {
    let { scrollToTopOnKeyboardDismissal } = this.props;
    let nextContentOffsetY = scrollToTopOnKeyboardDismissal ? 0 : this.savedContentOffsetY;
    this.scrollTo({ y: nextContentOffsetY, animated: false });
  }




  scrollTo(params) {
    this.scrollView.scrollTo &&
    this.scrollView.scrollTo(params);
  }




  scrollBy({ offsetY, animated }) {
    this.scrollTo({ y: this.currentContentOffsetY + offsetY, animated });
  }




  scrollToFocusedTextInputIfKeyboardOverlapsIt(event) {
    this.props.textInputs.map((item, i) => {
      if (item.textInput && item.textInput.isFocused && item.textInput.isFocused()) {
        let inputViewVerticalOffsetInsideScrollView = 0;

        item.view.measureLayout(
          ReactNative.findNodeHandle(this.scrollView),
          (x, y, width, height) => {
            inputViewVerticalOffsetInsideScrollView = y + height;

            let keyboardHeight = event.endCoordinates.height;
            let displayHeight = Dimensions.get('window').height;
            let offsetY = (
              this.scrollViewTopY +
              keyboardHeight +
              inputViewVerticalOffsetInsideScrollView -
              displayHeight
            );
            if (item.additionalOffset) offsetY += item.additionalOffset;

            if (offsetY > this.savedContentOffsetY) {
              this.scrollTo({ y: offsetY });
            }
        });
      }
    });
  }




  onLayout({ nativeEvent: { layout }}) {
    this.scrollViewTopY = layout.y;
    this.scrollViewHeight = layout.height;
    this.scrollToBottomIfOverscrolled();
  }




  onContentSizeChange(contentWidth, contentHeight) {
    this.scrollViewContentHeight = contentHeight;
    this.scrollToBottomIfOverscrolled();
  }




  onScroll(event) {
    let { contentOffset } = event.nativeEvent;
    this.currentContentOffsetY = contentOffset.y;

    let { onScroll } = this.props;
    onScroll && onScroll(event);
  }




  scrollToBottomIfOverscrolled() {
    let maxContentOffsetY = this.scrollViewContentHeight - this.scrollViewHeight;
    if (maxContentOffsetY < 0) { maxContentOffsetY = 0; }

    if (this.currentContentOffsetY > maxContentOffsetY) {
      this.scrollTo({ y: maxContentOffsetY, animated: false });
    }
  }




  render() {
    return (
      <ScrollView
        ref={ref => this.scrollView = ref}
        {...this.props}
        keyboardDismissMode='none'
        onLayout={this.onLayout}
        onContentSizeChange={this.onContentSizeChange}
        onScroll={this.onScroll}
        scrollEventThrottle={16}
      >
        {this.props.children}
      </ScrollView>
    );
  }

}

KeyboardAwareScrollView.propTypes = {
  ...ScrollView.propTypes,
  scrollToTopOnKeyboardDismissal: PropTypes.bool,
  textInputs: PropTypes.array.isRequired,
};


export default KeyboardAwareScrollView;
