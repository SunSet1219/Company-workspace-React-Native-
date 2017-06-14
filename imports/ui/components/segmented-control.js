
'use strict';

import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SegmentedControlUnderline from './segmented-control-underline';
import Theme from '../theme';

const { ActiveColor, InactiveColor } = Theme.Palette;
const { BoldFontSettings } = Theme.Font;
const Height = 48;
const LabelFontSize = 11.5;
const DisplayWidth = Dimensions.get('window').width;




class SegmentedControl extends Component {

  constructor(props) {
    super(props);

    this.renderItem = this.renderItem.bind(this);
    this.handleItemPress = this.handleItemPress.bind(this);
    this.getItemLeftByIndex = this.getItemLeftByIndex.bind(this);
    this.getItemWidth = this.getItemWidth.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.renderUnderline = this.renderUnderline.bind(this);

    this.underline = null;
  }




  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.selectedIndex !== this.props.selectedIndex) { return true; }

    const itemLabelChanged = nextProps.items && nextProps.items.some((nextItem, index) => {
      if (!this.props.items) { return true; }
      const currentItem = this.props.items[index];
      if (!currentItem) { return true; }
      return nextItem.label !== currentItem.label;
    });
    if (itemLabelChanged) { return true; }

    return false;
  }




  renderItem(item, index) {
    const { props } = this;
    const isSelected = index === props.selectedIndex;
    const color = isSelected ? ActiveColor : InactiveColor;

    let label = item.label ? (
      <Text style={[ styles.label, { color }]}>
        {item.label}
      </Text>
    ) : null;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.handleItemPress(item, index)}
        style={styles.item}
      >
        {label}
      </TouchableOpacity>
    );
  }




  handleItemPress(item, index) {
    const handleItemSelect = () => {
      const { onSelect } = this.props;
      onSelect && onSelect(item, index);
    };

    if (this.underline) {
      this.underline.stopAnimation();
      const nextUnderlineLeft = this.getItemLeftByIndex(index);
      this.underline.setupAnimation(nextUnderlineLeft);
      const animationEndCallback = handleItemSelect;
      this.underline.startAnimation(animationEndCallback);
    } else {
      handleItemSelect();
    }
  }




  getItemLeftByIndex(index) {
    const itemWidth = this.getItemWidth();
    return index * itemWidth;
  }




  getItemWidth() {
    const { items } = this.props;
    const itemsCount = items && items.length || 0;
    return itemsCount ? DisplayWidth / itemsCount : 0;
  }




  renderItems() {
    const { items } = this.props;
    return items ? items.map(this.renderItem) : null;
  }




  renderUnderline() {
    return (
      <SegmentedControlUnderline
        ref={ref => { this.underline = ref; }}
        width={this.getItemWidth()}
      />
    );
  }




  render() {
    return (
      <View style={styles.wrapperView}>
        {this.renderItems()}
        {this.renderUnderline()}
      </View>
    );
  }

}

SegmentedControl.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onSelect: PropTypes.func,
  selectedIndex: PropTypes.number.isRequired,
};




const styles = StyleSheet.create({
  wrapperView: {
    height: Height,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  item: {
    height: Height,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...BoldFontSettings,
    fontSize: LabelFontSize,
  },
});


export default SegmentedControl;
