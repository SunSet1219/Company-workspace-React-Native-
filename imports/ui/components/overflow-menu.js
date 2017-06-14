
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import FlatButton from './flat-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { Border1Color, TextColor } = Theme.Palette;
const { MenuFontSize } = Theme.Font;
const { StatusBarHeight } = UISharedConstants;

const DefaultIconSize = 25;
const DefaultIconColor = 'white';
const DefaultMenuWidth = 56 * 3;
const DefaultMenuItemHeight = 48;




class OverflowMenu extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showMenu: false,
    };

    this.renderMenu = this.renderMenu.bind(this);
    this.renderMenuItem = this.renderMenuItem.bind(this);
    this.onMenuItemPress = this.onMenuItemPress.bind(this);
    this.onWrapperViewPress = this.onWrapperViewPress.bind(this);
    this.onOutsideMenuPress = this.onOutsideMenuPress.bind(this);
  }




  renderMenu() {
    let { menuItems } = this.props;
    let menuItemViews = menuItems && menuItems.map(this.renderMenuItem);

    return menuItemViews && menuItemViews.length ? (
      <View style={styles.menuWrapperView}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollViewContentContainer}
        >
          {menuItemViews}
        </ScrollView>
      </View>
    ) : null;
  }




  renderMenuItem(item, index) {
    let { fontSize } = this.props;

    return (
      <FlatButton
        key={index}
        label={item.label}
        labelStyle={fontSize ? [ styles.text, { fontSize }] : styles.text}
        onPress={() => this.onMenuItemPress(item)}
        style={styles.menuItemView}
      />
    );
  }




  onMenuItemPress(item) {
    let { onSelect } = this.props;
    let callback = onSelect ? () => onSelect(item) : null;
    this.setState({ showMenu: false }, callback);
  }




  onWrapperViewPress() {
    this.setState({ showMenu: true });
  }




  onOutsideMenuPress() {
    this.setState({ showMenu: false });
  }




  render() {
    let { iconColor, iconSize, style, iconType } = this.props;


    let iconView = (
      <View style={styles.iconView}>
        <Icon
          name={iconType || 'more-vert'}
          size={iconSize !== undefined ? iconSize :  DefaultIconSize}
          color={iconColor !== undefined ? iconColor : DefaultIconColor}
        />
      </View>
    );


    let menuModal = (
      <Modal
        animationType='none'
        onRequestClose={() => {}}
        transparent={true}
        visible={this.state.showMenu}
        supportedOrientations={[ 'portrait', 'landscape' ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={this.onOutsideMenuPress}
          style={styles.modalOverlay}
        >
          {this.renderMenu()}
        </TouchableOpacity>
      </Modal>
    );


    return (
      <TouchableOpacity
        hitSlop={{ top: 8, left: 0, bottom: 8, right: 8 }}
        onLayout={this.onWrapperViewLayout}
        onPress={this.onWrapperViewPress}
        style={style ? [ styles.wrapperView, style ] : styles.wrapperView}
      >
        {menuModal}
        {iconView}
      </TouchableOpacity>
    );
  }

}

OverflowMenu.propTypes = {
  menuItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelect: PropTypes.func,
  iconColor: PropTypes.string,
  iconSize: PropTypes.number,
  style: View.propTypes.style,
  iconType: PropTypes.string,
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  iconView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  text: {
    fontSize: MenuFontSize,
    color: TextColor,
  },
  menuWrapperView: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? StatusBarHeight + 4 : 4,
    right: 4,
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
  scrollViewContentContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderRadius: 2,
  },
  menuItemView: {
    height: DefaultMenuItemHeight,
    width: DefaultMenuWidth,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
    paddingTop: 0,
    paddingBottom: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});


export default OverflowMenu;
