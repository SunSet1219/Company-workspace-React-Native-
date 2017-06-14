
'use strict';


import React, {
  Component,
} from 'react';

import {
  Animated,
  Easing,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Theme from '../theme';

const { WhiteTextColor, RedTextColor } = Theme.Palette;
const BackgroundColor = '#323232';
const MessageColor = WhiteTextColor;
const DefaultButtonLabelColor = RedTextColor;
const FontSize = 14;

const SingleLineSnackbarPaddingVertical = 14;
const MultiLineSnackbarPaddingVertical = 20;
const SnackbarPaddingHorizontal = 24;
const MessageLineHeight = Platform.OS === 'android' ? 24 : 20;
const MessageViewPaddingTop = Platform.OS === 'android' ? -8 : 0;

const AniShowMaxDelayMS = 500;
const AniShowDurationMS = 350;
const AniHideDurationMS = 300;

const Duration = {
  Short: 2500,
  Long: 5000,
  Indefinite: -1,
};




class Snackbar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      message: '',
      aniBottom: new Animated.Value(-9999),
      measuringHeight: false,
    };

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.stopAnimation = this.stopAnimation.bind(this);
    this.reset = this.reset.bind(this);
    this.isShown = this.isShown.bind(this);
    this.onMessageViewLayout = this.onMessageViewLayout.bind(this);
    this.onHeightMeasured = this.onHeightMeasured.bind(this);

    this.mounted = false;
    this.height = 0;
    this.paddingVertical = 0;
    this.buttonLabel = '';
    this.buttonOnPress = this.hide;
    this.buttonLabelColor = DefaultButtonLabelColor;
    this.aniHandle = null;
    this.showing = false;
    this.singleLineLayout = false;
    this.multiLineLayout = false;
    this.alternativeLayout = false;
    this.runAnimation = () => {};
    this.animatingShow = false;
    this.animatingHide = false;
    this.aniShowDelayTimeout = null;
    this.bufferedOptions = {};
    this.callStack = [];
  }




  componentDidMount() {
    this.mounted = true;
  }




  componentWillUnmount() {
    this.stopAnimation();
    this.aniShowDelayTimeout && clearTimeout(this.aniShowDelayTimeout);
    this.mounted = false;
  }




  show(options) {
    if (this.showing) {
      if (options.message !== this.bufferedOptions.message) {
        this.callStack.push(options);
      }
      return;
    }

    let { message, duration, button } = options;

    if (!message) { return; }

    if (button && button.label) {
      this.buttonLabel = button.label;
      if (button.onPress) {
        this.buttonOnPress = () => {
          button.onPress();
          this.hide();
        }
      }
      if (button.labelColor) { this.buttonLabelColor = button.labelColor; }
    } else {
      if (duration === Duration.Indefinite) {
        console.warn('Define a button to use an Indefinite duration');
        return;
      }
    }

    this.bufferedOptions = options;
    this.showing = true;

    this.runAnimation = () => {
      if (!this.mounted) { return; }

      this.stopAnimation();
      this.state.aniBottom.setValue(-this.height);

      const setupAniShow = () => {
        this.aniHandle = Animated.timing(
          this.state.aniBottom, {
            toValue: 0,
            easing: Easing.linear,
            duration: AniShowDurationMS,
          },
        );
      };

      const setupAniShowAndHide = (delay) => {
        this.aniHandle = Animated.sequence([
          Animated.timing(
            this.state.aniBottom, {
              toValue: 0,
              easing: Easing.linear,
              duration: AniShowDurationMS,
            },
          ),
          Animated.delay(delay),
          Animated.timing(
            this.state.aniBottom, {
              toValue: -this.height,
              easing: Easing.linear,
              duration: AniHideDurationMS,
            },
          ),
        ]);
      };

      switch (duration) {
        case Duration.Short:
          setupAniShowAndHide(Duration.Short);
          break;

        case Duration.Long:
          setupAniShowAndHide(Duration.Long);
          break;

        case Duration.Indefinite:
          setupAniShow();
          break;

        default:
          setupAniShowAndHide(Duration.Short);
      }

      this.animatingShow = true;
      this.aniHandle.start(() => {
        if (!this.mounted) { return; }
        if (duration !== Duration.Indefinite) {
          this.reset();

          if (this.callStack.length) {
            let options = this.callStack.pop();
            this.show(options);
          }
        }
      });
    };

    this.setState({
      message,
      measuringHeight: true,
    });
  }




  hide() {
    if (!this.isShown() || !this.mounted) { return; }

    if (this.animatingHide) { return; }

    this.aniHandle = Animated.timing(
      this.state.aniBottom, {
        toValue: -this.height,
        easing: Easing.linear,
        duration: AniHideDurationMS,
      }
    );

    this.animatingHide = true;
    this.aniHandle.start(() => {
      if (!this.mounted) { return; }

      this.reset();

      if (this.callStack.length) {
        let options = this.callStack.pop();
        this.show(options);
      }
    });
  }




  stopAnimation() {
    this.aniHandle &&
    this.aniHandle.stopAnimation &&
    this.aniHandle.stopAnimation();
  }




  reset() {
    this.height = 0;
    this.paddingVertical = 0;
    this.buttonLabel = '';
    this.buttonOnPress = this.hide;
    this.buttonLabelColor = DefaultButtonLabelColor;
    this.aniHandle = null;
    this.showing = false;
    this.singleLineLayout = false;
    this.multiLineLayout = false;
    this.alternativeLayout = false;
    this.runAnimation = () => {};
    this.animatingShow = false;
    this.animatingHide = false;
    this.aniShowDelayTimeout = null;
    this.state.aniBottom.setValue(-9999);
    this.setState({
      message: '',
      measuringHeight: false,
    });
  }




  isShown() {
    return this.showing || this.animatingShow;
  }




  onMessageViewLayout({ nativeEvent: { layout }}) {
    if (this.state.measuringHeight) {
      let height = layout.height;

      if (height <= MessageLineHeight) {
        this.singleLineLayout = true;
        this.height = height + SingleLineSnackbarPaddingVertical * 2;
      } else if (height < (MessageLineHeight * 4 + MessageViewPaddingTop * 2)) {
        this.multiLineLayout = true;
        this.height = height + MultiLineSnackbarPaddingVertical * 2;
      } else {
        this.alternativeLayout = true;
        this.height =
          height + MultiLineSnackbarPaddingVertical * 2 +
          MessageLineHeight + SingleLineSnackbarPaddingVertical;
      }

      this.onHeightMeasured();
    }
  }




  onHeightMeasured() {
    let p1 = new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(resolve);
    });

    let p2 = new Promise((resolve, reject) => {
      this.aniShowDelayTimeout = setTimeout(resolve, AniShowMaxDelayMS);
    });

    let callback = () => {
      this.setState({ measuringHeight: false }, this.runAnimation);
    };

    Promise.race([ p1, p2 ]).then(callback).catch(callback);
  }




  shouldComponentUpdate(nextProps, nextState) {
    let animating = this.animatingShow || this.animatingHide;
    return !animating;
  }




  render() {
    let message = (
      <View
        onLayout={this.onMessageViewLayout}
        style={
          this.state.measuringHeight ?
            styles.messageView :
            this.alternativeLayout ?
              styles.alternativeMessageView :
              styles.messageView
        }
      >
        <Text style={styles.messageText}>
          {this.state.message}
        </Text>
      </View>
    );


    let button = this.buttonLabel ? (
      <TouchableOpacity
        onPress={this.buttonOnPress}
        style={
          this.state.measuringHeight ?
            styles.button :
            this.alternativeLayout ?
              styles.alternativeButton :
              styles.button
        }
      >
        <Text style={[ styles.buttonText, { color: this.buttonLabelColor }]}>
          {this.buttonLabel}
        </Text>
      </TouchableOpacity>
    ) : null;


    let wrapperViewStyle = {};
    if (this.alternativeLayout) {
      wrapperViewStyle = this.state.measuringHeight ?
        styles.invisibleWrapperView :
        [ styles.alternativeWrapperView, { bottom: this.state.aniBottom }];
    } else if (this.singleLineLayout) {
      wrapperViewStyle = this.state.measuringHeight ?
        styles.invisibleWrapperView :
        [ styles.singleLineWrapperView, { bottom: this.state.aniBottom }];
    } else {
      wrapperViewStyle = this.state.measuringHeight ?
        styles.invisibleWrapperView :
        [ styles.MultiLineWrapperView, { bottom: this.state.aniBottom }];
    }


    return (
      <Animated.View style={wrapperViewStyle}>
        {message}
        {button}
      </Animated.View>
    );
  }

}




const styles = StyleSheet.create({
  invisibleWrapperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SnackbarPaddingHorizontal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0,
  },
  singleLineWrapperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: SnackbarPaddingHorizontal,
    paddingVertical: SingleLineSnackbarPaddingVertical,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BackgroundColor,
  },
  MultiLineWrapperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: SnackbarPaddingHorizontal,
    paddingVertical: MultiLineSnackbarPaddingVertical,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BackgroundColor,
  },
  alternativeWrapperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: SnackbarPaddingHorizontal,
    paddingTop: MultiLineSnackbarPaddingVertical,
    paddingBottom: SingleLineSnackbarPaddingVertical,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: BackgroundColor,
  },
  messageView: {
    flex: 1,
    paddingTop: MessageViewPaddingTop,
  },
  alternativeMessageView: {
    flex: 1,
    paddingTop: MessageViewPaddingTop,
    marginBottom: MultiLineSnackbarPaddingVertical,
  },
  messageText: {
    fontSize: FontSize,
    lineHeight: MessageLineHeight,
    color: MessageColor,
  },
  button: {
    marginLeft: SnackbarPaddingHorizontal,
  },
  alternativeButton: {
    height: MessageLineHeight,
    alignSelf: 'flex-end',
  },
  buttonText: {
    fontSize: FontSize,
    fontWeight: '500',
  },
});


export default Snackbar;
export { Duration };
