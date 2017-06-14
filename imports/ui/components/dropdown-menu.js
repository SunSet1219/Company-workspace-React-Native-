
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

const { TextColor, Border1Color, Canvas1Color, MenuHighlightColor } = Theme.Palette;
const { MKButtonMaskColor, MKButtonRippleColor } = Theme.Palette;
const { MenuFontSize } = Theme.Font;

const DefaultTextFontSize = MenuFontSize;
const MenuMinMarginTop = 16;
const MenuDefaultWidth = 100;




class DropdownMenu extends Component {

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
    this.topLeftXY = { x: MenuMinMarginTop, y: MenuMinMarginTop };
    this.textFontSize = props.fontSize ||
      (props.textStyle && props.textStyle.fontSize) || DefaultTextFontSize;
    this.menuItemHeight = this.textFontSize * 2;
    this.menuPaddingVertical = this.textFontSize / 2;
    this.wrapperViewWidth = MenuDefaultWidth;
  }




  getBoundedIndex(menuItems, index) {
    let menuItemsCount = 0;
    if (menuItems && menuItems.length) { menuItemsCount = menuItems.length; }
    let indexInBounds = (index >= 0) && (index < menuItemsCount);
    return indexInBounds ? index : menuItemsCount - 1;
  }




  renderMenuItem(item, index) {
    let { selectedIndex, showPlaceholderInsteadOfSelectedValue } = this.props;
    let { fontSize, textStyle, highlightedTextStyle } = this.props;

    let labelTextStyle = (
      (index === selectedIndex) && !showPlaceholderInsteadOfSelectedValue ?
        [ styles.highlightedText, { fontSize }, highlightedTextStyle ] :
        [ styles.text, { fontSize }, textStyle ]
    );

    return (
      <MKButton
        key={index}
        maskColor={MKButtonMaskColor}
        rippleColor={MKButtonRippleColor}
        onPress={() => this.onMenuItemPress(item, index)}
        style={[ styles.munuItemView, {
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

      this.wrapperView.measureInWindow((x, y) => {
        this.topLeftXY = { x, y };
      });
    });

    this.wrapperViewWidth = event.nativeEvent.layout.width;
  }




  getMenuWrapperViewTopAndHeight() {
    let { menuItems } = this.props;
    let menuItemsCount = menuItems && menuItems.length ? menuItems.length : 0;
    let menuHeight = this.menuItemHeight * menuItemsCount + this.menuPaddingVertical * 2;
    let displayHeight = Dimensions.get('window').height;
    let y = this.topLeftXY.y;

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
    let { menuItems, selectedIndex, disabled } = this.props;
    let { placeholder, showPlaceholderInsteadOfSelectedValue } = this.props;
    let { fontSize, textStyle, style } = this.props;
    let { showMenu } = this.state;

    let menuItemViews = menuItems.map(this.renderMenuItem);
    let menuView = showMenu ? (
      <View
        style={[ styles.menuWrapperView, {
          position: 'absolute',
          top: this.getMenuWrapperViewTopAndHeight().top,
          left: this.topLeftXY.x,
          height: this.getMenuWrapperViewTopAndHeight().height,
        }]}
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
        onLayout={this.onLayout}
        onPress={this.onWrapperViewPress}
        style={[ styles.wrapperView, style ]}
      >
        {menuModal}
        <View
          onStartShouldSetResponder={(event) => {
            let { locationY, pageY } = event.nativeEvent;
            this.topLeftXY.y = pageY - locationY;
            return false;
          }}
          style={[
            styles.selectedTextView,
            { height: this.menuItemHeight }
          ]}
        >
          <Text style={[ styles.text, { fontSize }, textStyle, disabled && { color: Border1Color } ]}>
            {
              showPlaceholderInsteadOfSelectedValue || selectedIndex === undefined ?
                placeholder :
              menuItems && menuItems[selectedIndex] && menuItems[selectedIndex].label
            }
          </Text>
          <Icon
            name='arrow-drop-down'
            size={Math.floor(this.textFontSize * 1.5)}
            color={Border1Color}
            style={{ marginTop: Math.floor(this.textFontSize / 3) }}
          />
        </View>
      </TouchableOpacity>
    );
  }

}

DropdownMenu.propTypes = {
  selectedIndex: PropTypes.number,
  menuItems: PropTypes.arrayOf(PropTypes.object),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  style: View.propTypes.style,
  fontSize: PropTypes.number,
  textStyle: Text.propTypes.style,
  highlightedTextStyle: Text.propTypes.style,
  placeholder: PropTypes.string,
  showPlaceholderInsteadOfSelectedValue: PropTypes.bool,
};

DropdownMenu.defaultProps = {
  initialSelectedIndex: 0,
  menuItems: [],
  placeholder: '-- Select --',
  showPlaceholderInsteadOfSelectedValue: false,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: Border1Color,
  },
  selectedTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: Canvas1Color,
  },
  menuView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderRadius: 2,
  },
  munuItemView: {
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


export default DropdownMenu;
