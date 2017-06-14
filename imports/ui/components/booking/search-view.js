
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import _ from 'underscore';
import { MKTextField } from '../../material-ui';
import CheckboxWithLabel from '../checkbox-with-label';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from '../../../api/unpackaged-improvements/moment';
import NoDataPlaceholder from '../no-data-placeholder';
import RoomsContainer from '../../containers/rooms-container';
import Theme from '../../theme';
import UISharedConstants from '../../ui-shared-constants';

const { TextColor } = Theme.Palette;
const { TextInputFontSize } = Theme.Font;
const { RoomsContainerPaddingHorizontal } = UISharedConstants;

const SearchFilters = {
  Whiteboard: 'Whiteboard',
  Phone: 'Phone',
  TV: 'TV',
  VideoconTV: 'Videocon TV',
  AppleTV: 'Apple TV',
};

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class SearchView extends Component {

  constructor(props) {
    super(props);

    let searchFilters = {};
    Object.keys(SearchFilters).forEach(key => searchFilters[key] = false);

    this.state = {
      searchFilters,
      searchText: '',
      landscape: false,
    };

    this.getFilteredRooms = this.getFilteredRooms.bind(this);
    this.matchesSearchFilters = this.matchesSearchFilters.bind(this);
    this.matchesSearchText = this.matchesSearchText.bind(this);
    this.handleCheckboxPress = this.handleCheckboxPress.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);
  }




  convertBookingIntervalToUTC(bookingInterval) {
    return {
      startDateTimeUTC: bookingInterval.startDateTime.clone().tz('UTC'),
      endDateTimeUTC: bookingInterval.endDateTime.clone().tz('UTC'),
      period: bookingInterval.period,
    };
  }




  getFilteredRooms() {
    let { propertyId, floor, rooms } = this.props;

    let matchesAllFilters = (room) => {
      let matchesPropertyIfDefined = !propertyId || room.propertyId === propertyId;
      let matchesFloorIfDefined = (
        !floor ||
        !room.location ||
        !room.location.floor ||
        room.location.floor === floor
      );
      let matchesSearchFilters = this.matchesSearchFilters(room);
      let matchesSearchText = this.matchesSearchText(room);
      return matchesPropertyIfDefined && matchesFloorIfDefined && matchesSearchFilters && matchesSearchText;
    };

    let filteredRooms = [];
    rooms && rooms.forEach(room => {
      if (matchesAllFilters(room)) { filteredRooms.push(room); }
    });

    filteredRooms = _.chain(filteredRooms).sortBy('_id').sortBy('location.floor').value();
    return filteredRooms;
  }




  matchesSearchFilters(room) {
    let { searchFilters } = this.state;

    let checkedSearchFilters = [];
    Object.keys(searchFilters).forEach(key => {
      if (searchFilters[key]) { checkedSearchFilters.push(key); }
    });

    let matchesSearchFilters = checkedSearchFilters.every(key => {
      switch (key) {
        case 'Whiteboard':
          return room.whiteboard && room.whiteboard.exists;

        case 'Phone':
          return room.phone && room.phone.exists;

        case 'TV':
          return room.av && room.av.tv;

        case 'AppleTV':
          return room.av && room.av.appleTv;

        case 'VideoconTV':
          return room.av && room.av.videocon;

        default:
          console.warn('[SearchView.matchesSearchFilters] - case default', key);
          return false;
      }
    });

    return matchesSearchFilters;
  }




  matchesSearchText(room) {
    let searchText = this.state.searchText.toLowerCase();

    let name = room.name;
    let location = room.location;
    let directions = location && location.directions;
    let floor = location && location.floor;
    let capacity = room.capacity;
    let number = capacity && capacity.number;
    let capacityNotes = capacity && capacity.notes;
    let whiteboardNotes = room.whiteboard && room.whiteboard.notes;
    let phoneNotes = room.phone && room.phone.notes;
    let avNotes = room.av && room.av.notes;
    let notes = room.notes;

    let matchesName = name && name.toLowerCase().includes(searchText);
    let matchesDirections = directions && directions.toLowerCase().includes(searchText);
    let matchesFloor = floor && floor === searchText;
    let matchesCapacity = number && number === searchText;
    let matchesCapacityNotes = capacityNotes && capacityNotes.toLowerCase().includes(searchText);
    let matchesWhiteboardNotes = whiteboardNotes && whiteboardNotes.toLowerCase().includes(searchText);
    let matchesPhoneNotes = phoneNotes && phoneNotes.toLowerCase().includes(searchText);
    let matchesAvNotes = avNotes && avNotes.toLowerCase().includes(searchText);
    let matchesNotes = notes && notes.toLowerCase().includes(searchText);

    return (
      matchesName || matchesDirections || matchesFloor || matchesCapacity ||
      matchesCapacityNotes || matchesWhiteboardNotes || matchesPhoneNotes ||
      matchesAvNotes || matchesNotes
    );
  }




  handleCheckboxPress(key) {
    let searchFilters = { ...this.state.searchFilters };
    searchFilters[key] = !searchFilters[key];
    this.setState({ searchFilters });
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    let context = this.context;
    let props = this.props;
    let state = this.state;


    let filteredRooms = this.getFilteredRooms();


    let searchInput = (
      <MKTextField
        ref={ref => this.searchTextInput = ref}
        autoCapitalize='none'
        autoCorrect={false}
        onFocus={() => this.setState({ searchText: '' })}
        onTextChange={text => {
          this.setState({ searchText: text });
        }}
        placeholder='Search text'
        returnKeyType='done'
        style={styles.textInputView}
        value={state.searchText}
        floatingLabelEnabled={false}
        underlineEnabled={true}
        textInputStyle={styles.textInput}
      />
    );


    let menuBar = (
      <View style={styles.menuBar}>
        {searchInput}
        {props.periodAndDatePickersView}
      </View>
    );


    let searchFilters = Object.keys(SearchFilters).map((key, i) => {
      let checked = state.searchFilters[key];
      let label = SearchFilters[key];
      let width = 75;
      if (label.length > 8) {
        width = 140;
      } else if (label.length > 3) {
        width = 115;
      }

      return (
        <CheckboxWithLabel
          key={i}
          checked={checked}
          label={label}
          onPress={() => this.handleCheckboxPress(key)}
          style={
            Display.ShortSide < 370 ?
              styles.searchFilterView :
              [ styles.searchFilterView, { width }]
          }
        />
      );
    });


    let searchFiltersView = (
      <View style={styles.searchFiltersView}>
        {searchFilters}
      </View>
    );


    let noRoomsView = (props.dataLoaded || context.isOffline()) && !filteredRooms.length ? (
      <NoDataPlaceholder
        label={
          state.landscape ?
            'No rooms suit your filter criteria' :
            'No rooms suit\nyour filter criteria'
        }
      />
    ) : null;


    let renderHeader = () => (
      <View style={styles.headerView}>
        {menuBar}
        {searchFiltersView}
        {noRoomsView}
      </View>
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        style={styles.wrapperView}
      >
        <RoomsContainer
          roomsDataLoaded={props.dataLoaded}
          rooms={filteredRooms}
          properties={props.properties}
          companies={props.companies}
          bookingIntervalUTC={this.convertBookingIntervalToUTC(props.bookingInterval)}
          renderHeader={renderHeader}
        />
      </View>
    );
  }

}

SearchView.propTypes = {
  dataLoaded: PropTypes.bool,
  propertyId: PropTypes.string,
  floor: PropTypes.number,
  bookingInterval: PropTypes.object,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  rooms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  periodAndDatePickersView: PropTypes.element,
};

SearchView.contextTypes = {
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  inputView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  textInputView: {
    height: 32,
    flex: 1,
  },
  textInput: {
    fontSize: TextInputFontSize,
    color: TextColor,
  },
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  searchFiltersView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    paddingHorizontal: RoomsContainerPaddingHorizontal,
    paddingBottom: RoomsContainerPaddingHorizontal / 2,
  },
  searchFilterView: {
    height: 32,
    width: Display.ShortSide / 2 - RoomsContainerPaddingHorizontal,
  },
});


export default SearchView;
