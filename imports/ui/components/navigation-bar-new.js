
'use strict';


import React, {
  PureComponent,
  PropTypes,
} from 'react';

import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icoMoonConfig from '../../resources/font/selection.json';
const Icon = createIconSetFromIcoMoon(icoMoonConfig);

const { ActiveColor, InactiveColor } = Theme.Palette;
const { SemiBoldFontSettings } = Theme.Font;
const { Scenes } = SharedConstants;
const Height = 48;

const BarItemsNames = {
  MyKnotel: 'MY KNOTEL',
  Booking: 'BOOK',
  Notifications: 'NOTIFICATIONS',
  Account: 'ACCOUNT',
  Location:'LOCATION'
};

const BarItems = [{
  label: BarItemsNames.MyKnotel,
  icon: 'my-knotel',
}, {
  label: BarItemsNames.Booking,
  icon: 'book',
}, {
  label: BarItemsNames.Notifications,
  icon: 'notifications',
}, {
  label: BarItemsNames.Account,
  icon: 'account',
}, {
  label: BarItemsNames.Location,
  icon: 'my-knotel-fill',
}
];




class NavigationBar extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      selectedItemName: this.getBarItemNameBySceneName(props.initialScene),
      visible: false,
    };

    this.renderItem = this.renderItem.bind(this);
    this.handleItemPress = this.handleItemPress.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }




  getBarItemNameBySceneName(sceneName) {
    switch (sceneName) {
      case Scenes.MyKnotel:
        return BarItemsNames.MyKnotel;

      case Scenes.Booking:
        return BarItemsNames.Booking;

       case Scenes.Notifications:
        return BarItemsNames.Location;

      case Scenes.Account:
        return BarItemsNames.Account;

      default:
        console.warn('[Error][NavigationBar.getBarItemNameBySceneName] - case default', sceneName);
    }
  }




  handleItemPress(item) {
    const selectedItemName = item.label;
    this.setState({ selectedItemName });
    const nextScene = this.getSceneNameByBarItemName(selectedItemName);
    nextScene && Actions[nextScene] && Actions[nextScene]();
  };




  getSceneNameByBarItemName(barItemName) {
    switch (barItemName) {
      case BarItemsNames.MyKnotel:
        return Scenes.MyKnotel;

      case BarItemsNames.Booking:
        return Scenes.Booking;

      case BarItemsNames.Notifications:
        return Scenes.Booking; //Scenes.Notifications;

      case BarItemsNames.Account:
        return Scenes.Account;

      case BarItemsNames.Location:
        return Scenes.Location;

      default:
        console.warn('[Error][NavigationBar.getSceneNameByBarItemName] - case default', barItemName);
    }
  }




  renderItem(item, index) {
    const isSelected = this.state.selectedItemName === item.label;
    const color = isSelected ? ActiveColor : InactiveColor;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.handleItemPress(item, index)}
        style={styles.item}
      >
        <Icon
          name={item.icon}
          size={24}
          color={color}
        />
        <Text style={[ styles.label, { color }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };




  renderItems() {
    return BarItems.map(this.renderItem);
  }




  show() {
    this.setState({ visible: true });
  }




  hide() {
    this.setState({ visible: false });
  }




  render() {
    const height = this.state.visible ? Height : 0;

    return (
      <View style={[ styles.wrapperView, { height }]}>
        {this.renderItems()}
      </View>
    );
  }

}

NavigationBar.propTypes = {
  initialScene: PropTypes.string.isRequired,
  visible: PropTypes.bool,
};




const styles = StyleSheet.create({
  wrapperView: {
    height: Height,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dedede',
  },
  item: {
    height: Height,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
  },
  label: {
    ...SemiBoldFontSettings,
    fontSize: 7,
    paddingTop: Platform.OS === 'ios' ? 3 : 5,
  },
});


export default NavigationBar;
