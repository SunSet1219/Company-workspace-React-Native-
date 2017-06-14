
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ListView,
  StyleSheet,
  View,
} from 'react-native';

import ScrollIndicator from './scroll-indicator';




class HorizontalPaginatedListView extends Component {

  constructor(props) {
    super(props);

    this.scrollHorizontallyTo = this.scrollHorizontallyTo.bind(this);
    this.setPage = this.setPage.bind(this);
    this.handleListViewLayout = this.handleListViewLayout.bind(this);
    this.handleListViewMomentumScrollEnd = this.handleListViewMomentumScrollEnd.bind(this);

    this.listView = null;
    this.listViewWidth = 0;
    this.currentPage = 0;
  }




  scrollHorizontallyTo(nextContentOffsetX) {
    this.listView &&
    this.listView.scrollTo({ x: nextContentOffsetX, y: 0, animated: false });
  }




  setPage(nextPage) {
    this.currentPage = nextPage;
    let nextContentOffsetX = nextPage * this.listViewWidth;
    this.scrollHorizontallyTo(nextContentOffsetX);
  }




  handleListViewLayout({ nativeEvent: { layout }}) {
    let newlistViewWidth = layout.width;
    this.listViewWidth = newlistViewWidth;

    let nextContentOffsetX = this.currentPage * newlistViewWidth;
    this.scrollHorizontallyTo(nextContentOffsetX);

    this.props.onRerenderRequest(newlistViewWidth);
  }




  handleListViewMomentumScrollEnd(event) {
    let { contentOffset, layoutMeasurement } = event.nativeEvent;
    let listViewWidth = layoutMeasurement.width;

    let nextPage = Math.round(contentOffset.x / listViewWidth);
    if (nextPage !== this.currentPage) {
      this.currentPage = nextPage;
      this.props.onPageChange(nextPage);
    }
  }




  render() {
    return (
      <View style={styles.wrapperView}>
        <ListView
          ref={ref => this.listView = ref}
          bounces={false}
          dataSource={this.props.dataSource}
          enableEmptySections={true}
          horizontal={true}
          initialListSize={1}
          onLayout={this.handleListViewLayout}
          onMomentumScrollEnd={this.handleListViewMomentumScrollEnd}
          pagingEnabled={true}
          renderRow={this.props.renderRow}
          showsHorizontalScrollIndicator={false}
        />
        <ScrollIndicator
          itemsCount={this.props.dataSource.getRowCount()}
          activeItemIndex={this.currentPage}
        />
      </View>
    );
  }

};

HorizontalPaginatedListView.propTypes = {
  dataSource: PropTypes.object.isRequired,
  onPageChange: PropTypes.func,
  onRerenderRequest: PropTypes.func,
  renderRow: PropTypes.func.isRequired,
};

HorizontalPaginatedListView.defaultProps = {
  onPageChange: () => {},
  onRerenderRequest: () => {},
};




const styles = StyleSheet.create({
  wrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});


export default HorizontalPaginatedListView;
