
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  StyleSheet,
  View,
  ViewPagerAndroid,
} from 'react-native';

import RoomCard from './room-card';
import ScrollIndicator from '../scroll-indicator';
import UISharedConstants from '../../ui-shared-constants';

const { RoomCardHeight } = UISharedConstants;




class RoomsChanger extends Component {

  constructor(props) {
    super(props);

    this.setPage = this.setPage.bind(this);
    this.handlePageSelected = this.handlePageSelected.bind(this);

    this.currentPage = 0;
  }




  setPage(nextPage) {
    this.currentPage = nextPage;

    this.viewPager && this.viewPager.setPage(nextPage);
  }




  handlePageSelected({ nativeEvent: { position }}) {
    this.currentPage = position;

    let { rooms, onChange } = this.props;
    let room = rooms[position];
    let roomId = room && room._id;
    onChange(roomId);
  }




  render() {
    let { rooms } = this.props;
    let roomCards = [];

    rooms.forEach((room, i) => {
      roomCards.push(
        <RoomCard
          key={i}
          room={room}
        />
      );
    });


    return (
      <View style={styles.wrapperView}>
        <ViewPagerAndroid
          ref={ref => this.viewPager = ref}
          initialPage={this.currentPage}
          onPageSelected={this.handlePageSelected}
        >
          {roomCards}
        </ViewPagerAndroid>
        <ScrollIndicator
          itemsCount={rooms.length}
          activeItemIndex={this.currentPage}
        />
      </View>
    );
  }

};

RoomsChanger.propTypes = {
  rooms: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

RoomsChanger.defaultProps = {
  rooms: [],
  onChange: () => {},
};




const styles = StyleSheet.create({
  wrapperView: {
    height: RoomCardHeight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});


export default RoomsChanger;
