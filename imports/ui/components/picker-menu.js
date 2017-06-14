
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  InteractionManager,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MKButton } from '../material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { Border1Color, TextColor, MenuHighlightColor, MKButtonMaskColor, MKButtonRippleColor } = Theme.Palette;
const StatusBarHeight = Platform.OS === 'android' ? UISharedConstants.StatusBarHeight : 0;

const DefaultTextFontSize = 16;
const MenuMinMarginTop = 16;
const MenuDefaultWidth = 100;




class PickerMenu extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showMenu: false,
    };

    this.renderMenuItem = this.renderMenuItem.bind(this);
    this.onMenuItemPress = this.onMenuItemPress.bind(this);
    this.onWrapperViewPress = this.onWrapperViewPress.bind(this);
    this.onOutsideMenuPress = this.onOutsideMenuPress.bind(this);
    this.onLayout = this.onLayout.bind(this);
    this.getMenuWrapperViewTopAndHeight = this.getMenuWrapperViewTopAndHeight.bind(this);

    this.wrapperView = null;
    this.top = MenuMinMarginTop;
    this.left = MenuMinMarginTop;
    this.right = MenuMinMarginTop;
    this.textFontSize = props.fontSize ||
      (props.textStyle && props.textStyle.fontSize) || DefaultTextFontSize;
    this.menuItemHeight = this.textFontSize * 2.25;
    this.menuPaddingVertical = this.textFontSize / 2;
    this.wrapperViewWidth = props.menuWidth || MenuDefaultWidth;
  }




  getBoundedIndex(menuItems, index) {
    let menuItemsCount = 0;
    if (menuItems && menuItems.length) { menuItemsCount = menuItems.length; }
    let indexInBounds = (index >= 0) && (index < menuItemsCount);
    return indexInBounds ? index : menuItemsCount - 1;
  }




  renderMenuItem(item, index) {
    let { selectedIndex } = this.props;
    let { fontSize, textStyle, highlightedTextStyle } = this.props;

    let labelTextStyle = (
      index === selectedIndex ?
        [ styles.highlightedText, { fontSize }, highlightedTextStyle ] :
        [ styles.text, { fontSize }, textStyle ]
    );

    return (
      <MKButton
        key={index}
        maskColor={MKButtonMaskColor}
        rippleColor={MKButtonRippleColor}
        onPress={() => this.onMenuItemPress(item, index)}
        style={[ styles.menuItemView, {
          width: this.wrapperViewWidth,
          height: this.menuItemHeight,
        }]}
      >
        <View style={styles.labelView}>
          <Text style={labelTextStyle}>
            {item.label}
          </Text>
        </View>
      </MKButton>
    );
  }




  onMenuItemPress(item, index) {
    this.setState({ showMenu: false });

    let { onChange } = this.props;
    onChange && onChange(item, index);
  }




  onWrapperViewPress() {
    if (this.props.disabled) { return; }
    this.setState({ showMenu: true });
  }




  onOutsideMenuPress() {
    this.setState({ showMenu: false });
  }




  onLayout(event) {
    InteractionManager.runAfterInteractions(() => {
      if (!this.wrapperView) return;

      this.wrapperView.measureInWindow((x, y, width) => {
        this.left = x;
        let displayWidth = Dimensions.get('window').width;
        this.right = displayWidth - x - width;
      });
    });
  }




  getMenuWrapperViewTopAndHeight() {
    let { menuItems } = this.props;
    let menuItemsCount = menuItems && menuItems.length ? menuItems.length : 0;
    let menuHeight = this.menuItemHeight * menuItemsCount + this.menuPaddingVertical * 2;
    let displayHeight = Dimensions.get('window').height;
    let y = this.top;

    if (menuHeight > displayHeight) {
      return {
        top: MenuMinMarginTop,
        height: displayHeight - MenuMinMarginTop * 2,
      };
    }


    if ((menuHeight > y) && (menuHeight > (displayHeight - y))) {
      if (y > displayHeight / 2) {
        return {
          top: MenuMinMarginTop,
          height: y - MenuMinMarginTop + this.menuItemHeight + this.menuPaddingVertical,
        };
      } else {
        return {
          top: y - this.menuPaddingVertical,
          height: displayHeight - MenuMinMarginTop - y + this.menuPaddingVertical,
        };
      }
    }


    if ((y + menuHeight) > displayHeight) {
      return {
        top: y + this.menuPaddingVertical + this.menuItemHeight - menuHeight,
        height: menuHeight,
      };
    }


    return {
      top: y - this.menuPaddingVertical,
      height: menuHeight,
    };
  }




  render() {
    let { onScreenView, menuItems, selectedIndex, disabled } = this.props;
    let { hitSlop, fontSize, textStyle, style, alignLeft } = this.props;
    let { showMenu } = this.state;


    let { top, height } = this.getMenuWrapperViewTopAndHeight();
    let menuItemViews = menuItems.map(this.renderMenuItem);

    let menuView = showMenu ? (
      <View
        style={[
          styles.menuWrapperView,
          {
            position: 'absolute',
            top,
            height,
            width: this.wrapperViewWidth,
          },
          alignLeft ? { left: this.left } : { right: this.right }
        ]}
      >
        <ScrollView
          automaticallyAdjustContentInsets={false}
          bounces={false}
        >
          <View style={[ styles.menuView, { paddingVertical: this.menuPaddingVertical }]}>
            {menuItemViews}
          </View>
        </ScrollView>
      </View>
    ) : null;


    let menuModal = (
      <Modal
        animationType='none'
        onRequestClose={() => {}}
        transparent={true}
        visible={showMenu}
        supportedOrientations={[ 'portrait', 'landscape' ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={this.onOutsideMenuPress}
          style={styles.modalOverlay}
        >
          {menuView}
        </TouchableOpacity>
      </Modal>
    );


    return (
      <TouchableOpacity
        ref={ref => this.wrapperView = ref}
        activeOpacity={disabled ? 1 : 0.5}
        hitSlop={hitSlop}
        onLayout={this.onLayout}
        onPress={this.onWrapperViewPress}
        style={[ styles.wrapperView, style ]}
      >
        {menuModal}
        <View
          onStartShouldSetResponder={(event) => {
            let { locationY, pageY } = event.nativeEvent;
            this.top = pageY - locationY - StatusBarHeight;
            return false;
          }}
          style={styles.buttonView}
        >
          {onScreenView}
        </View>
      </TouchableOpacity>
    );
  }

}

PickerMenu.propTypes = {
  onScreenView: PropTypes.element,
  hitSlop: PropTypes.object,
  selectedIndex: PropTypes.number,
  menuItems: PropTypes.arrayOf(PropTypes.object),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  menuWidth: PropTypes.number,
  style: View.propTypes.style,
  fontSize: PropTypes.number,
  textStyle: Text.propTypes.style,
  highlightedTextStyle: Text.propTypes.style,
  alignLeft: PropTypes.bool,
};

PickerMenu.defaultProps = {
  initialSelectedIndex: 0,
  menuItems: [],
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  buttonView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  labelView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  text: {
    fontSize: DefaultTextFontSize,
    color: TextColor,
  },
  highlightedText: {
    fontSize: DefaultTextFontSize,
    fontWeight: '500',
    color: MenuHighlightColor,
  },
  menuWrapperView: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          width: 1,
          height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: (Platform.Version < 21) ? {
        borderColor: Border1Color,
        borderWidth: StyleSheet.hairlineWidth,
      } : {
        elevation: 8,
      },
    }),
    backgroundColor: 'white',
  },
  menuView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  menuItemView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});


export default PickerMenu;
