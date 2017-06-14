
'use strict';


import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

const ActiveItemSize = 6;
const InactiveItemSize = 3;
const SpaceBetweenItems = 5;




const ScrollIndicator = (props) => {

  let items = [];

  for (let i = 0; i < props.itemsCount; i++) {
    items.push(
      <View
        key={i}
        style={i === props.activeItemIndex ? styles.activeItem : styles.inactiveItem}
      />
    );
  };

  return (
    <View style={styles.wrapperView}>
      {items}
    </View>
  );

};

ScrollIndicator.propTypes = {
  itemsCount: PropTypes.number,
  activeItemIndex: PropTypes.number,
};

ScrollIndicator.defaultProps = {
  itemsCount: 0,
  activeItemIndex: 0,
};


const styles = StyleSheet.create({
  wrapperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 22,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  activeItem: {
    height: ActiveItemSize,
    width: ActiveItemSize,
    borderRadius: ActiveItemSize / 2,
    backgroundColor: 'white',
    marginLeft: SpaceBetweenItems,
  },
  inactiveItem: {
    height: InactiveItemSize,
    width: InactiveItemSize,
    borderRadius: InactiveItemSize / 2,
    backgroundColor: 'white',
    marginLeft: SpaceBetweenItems,
  },
});


export default ScrollIndicator;
