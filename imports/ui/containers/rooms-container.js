
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  ListView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { MKSpinner } from '../material-ui';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import Room from '../components/room';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';

const { Canvas1Color, Border1Color } = Theme.Palette;
const LoadingSpinnerViewSize = 40;

const Display = {
  LongSide: Math.max(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  )
};




class Rooms extends Component {

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => true });

    this.state = {
      showLoadingSpinner: true,
      landscape: false,
      dataSource: ds,
    };

    this.rerenderRooms = this.rerenderRooms.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.bookingsDataLoaded || this.context.isOffline()) {
      this.rerenderRooms(nextProps);
    }
  }




  rerenderRooms(nextProps) {
    let { rooms, properties, companies, bookings, bookingIntervalUTC } = nextProps ? nextProps : this.props;
    let listViewData = [];

    rooms.forEach(room => {
      let roomBookings = bookings.filter(booking => booking.roomId === room._id);

      listViewData.push({
        room,
        roomBookings,
        bookingIntervalUTC,
        properties,
        companies,
      });
    });

    this.setState({
      showLoadingSpinner: false,
      dataSource: this.state.dataSource.cloneWithRows(listViewData),
    });
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let loadingSpinnerView = this.state.showLoadingSpinner ? (
      <View style={[
        styles.loadingSpinnerView,
        this.state.landscape ? {
          left: (Display.LongSide - LoadingSpinnerViewSize) / 2,
          top: (Display.ShortSide - LoadingSpinnerViewSize) / 2,
        } : {
          left: (Display.ShortSide - LoadingSpinnerViewSize) / 2,
          top: (Display.LongSide - LoadingSpinnerViewSize) / 2,
        }
      ]}>
        <SingleColorSpinner />
      </View>
    ) : null;


    let renderRow = (rowData) => {
      return (
        <View style={styles.roomWrapperView}>
          <Room
            room={rowData.room}
            roomBookings={rowData.roomBookings}
            bookingIntervalUTC={rowData.bookingIntervalUTC}
            properties={rowData.properties}
            companies={rowData.companies}
          />
        </View>
      );
    };


    let roomsListView = (
      <ListView
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        initialListSize={2}
        renderHeader={this.props.renderHeader}
        renderRow={renderRow}
        scrollRenderAheadDistance={Display.LongSide * 2}
      />
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        style={styles.wrapperView}
      >
        {roomsListView}
        {loadingSpinnerView}
      </View>
    );
  }

}

Rooms.propTypes = {
  roomsDataLoaded: PropTypes.bool,
  bookingsDataLoaded: PropTypes.bool,
  rooms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  bookings: PropTypes.array,
  bookingIntervalUTC: PropTypes.object,
  renderHeader: PropTypes.func,
};

Rooms.contextTypes = {
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  loadingSpinnerView: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    left: -LoadingSpinnerViewSize,
    top: -LoadingSpinnerViewSize,
    width: LoadingSpinnerViewSize,
    height: LoadingSpinnerViewSize,
    backgroundColor: Canvas1Color,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0, },
        shadowOpacity: 0.25,
        shadowRadius: 1.5,
      },
      android: (Platform.Version < 21) ? {
        borderColor: Border1Color,
        borderWidth: StyleSheet.hairlineWidth,
      } : {
        elevation: 4,
      },
    }),
  },
  loadingSpinner: {
    width: 27,
    height: 27,
  },
  wrapperView: {
    flex: 1,
  },
  roomWrapperView: {
    paddingHorizontal: UISharedConstants.RoomsContainerPaddingHorizontal,
    paddingTop: 5,
    paddingBottom: 20,
    backgroundColor: Canvas1Color,
  },
});

const SingleColorSpinner = MKSpinner.singleColorSpinner()
  .withStyle(styles.loadingSpinner)
  .build();




export default createContainer(props => {
  if (!props.roomsDataLoaded) {
    return {
      bookingsDataLoaded: false,
      bookings: [],
    };
  }

  if (!Meteor.userId()) {
    return {
      bookingsDataLoaded: true,
      bookings: [],
    };
  }

  let roomsIds = props.rooms.map(room => room._id);
  if (!roomsIds.length) {
    return {
      bookingsDataLoaded: true,
      bookings: [],
    };
  }

  let utcTimeStart = props.bookingIntervalUTC.startDateTimeUTC.clone().hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
  let utcTimeEnd = props.bookingIntervalUTC.startDateTimeUTC.clone().hours(23).minutes(59).seconds(59).milliseconds(999).toDate();
  let options = { roomsIds, utcTimeStart, utcTimeEnd };

  const subscriptionHandle = Meteor.subscribe('bookings', options);

  return {
    bookingsDataLoaded: subscriptionHandle.ready(),
    bookings: Meteor.collection('bookings').find(),
  };
}, Rooms);
