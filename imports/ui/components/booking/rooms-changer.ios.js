
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ListView,
} from 'react-native';

import HorizontalPaginatedListView from '../horizontal-paginated-list-view';
import RoomCard from './room-card';




class RoomsChanger extends Component {

  constructor(props) {
    super(props);

    this.state = {
      listViewDataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => true }),
    };

    this.getUpdatedListViewDataSource = this.getUpdatedListViewDataSource.bind(this);
    this.rerenderListView = this.rerenderListView.bind(this);
    this.setPage = this.setPage.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);

    this.listView = null;
    this.listViewWidth = 0;
  }




  getUpdatedListViewDataSource(rooms, listViewWidth) {
    if (listViewWidth) { this.listViewWidth = listViewWidth; }
    let roomCardWidth = this.listViewWidth;
    let listViewData = [];

    rooms.forEach(room => {
      listViewData.push({ room, roomCardWidth });
    });

    return this.state.listViewDataSource.cloneWithRows(listViewData);
  }




  componentWillReceiveProps(nextProps) {
    let { rooms } = nextProps;
    let listViewDataSource = this.getUpdatedListViewDataSource(rooms);
    this.setState({ listViewDataSource });
  }




  rerenderListView(listViewWidth) {
    let { rooms } = this.props;
    let listViewDataSource = this.getUpdatedListViewDataSource(rooms, listViewWidth);
    this.setState({ listViewDataSource });
  }




  setPage(nextPage) {
    this.listView && this.listView.setPage(nextPage);
  }




  handlePageChange(nextPage) {
    let { rooms, onChange } = this.props;
    let room = rooms[nextPage];
    let roomId = room && room._id;
    onChange(roomId);
  }




  render() {
    let renderRow = (rowData) => (
      <RoomCard
        room={rowData.room}
        width={rowData.roomCardWidth}
      />
    );


    return (
      <HorizontalPaginatedListView
        ref={ref => this.listView = ref}
        dataSource={this.state.listViewDataSource}
        onPageChange={this.handlePageChange}
        onRerenderRequest={this.rerenderListView}
        renderRow={renderRow}
      />
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


export default RoomsChanger;
