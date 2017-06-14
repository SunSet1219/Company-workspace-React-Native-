
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  ListView,
  PixelRatio,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { Duration } from '../components/snackbar';
import { MKButton } from '../material-ui';
import BookingCard from '../components/profile/booking-card';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import ActionButtonsBar from '../components/action-buttons-bar';
import Card from '../components/profile/card';
import db from '../../api/db/realm-db';
import Icon from 'react-native-vector-icons/MaterialIcons';
import KeyboardAwareScrollView from '../components/keyboard-aware-scroll-view';
import RaisedButton from '../components/raised-button';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import UISharedConstants from '../ui-shared-constants';
import UserProfileCard from '../components/profile/user-profile-card';

const { StatusBarColor, Canvas3Color, TextColor, WhiteTextColor } = Theme.Palette;
const { Primary1Color, Secondary1Color } = Theme.Palette;
const { TitleBarFontSize, TextFontSize } = Theme.Font;
const { StatusBarHeight, TitleBarHeight, ActionFabSize } = UISharedConstants;
const { Scenes, Subscenes } = SharedConstants;

const BookingsListPaddingTop = 9;
const BookingsListPaddingBottom = 3
const BookingsPerPageCount = 10;

const Display = {
  LongSide: Math.max(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};

const AccentColoredFab = MKButton.accentColoredFab()
  .withStyle({
    width: ActionFabSize,
    height: ActionFabSize,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
    elevation: 6,
  })
  .build();




class UserProfile extends Component {

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => true });

    this.state = {
      wallpaperImageSource: null,
      wallpaperImageWidth: 0,
      wallpaperImageHeight: 0,
      landscape: false,
      editingUserProfile: false,
      actionButtonDisabled: false,
      actionConfirmed: false,
      dataSource: ds,
    };

    this.getUserCompanies = this.getUserCompanies.bind(this);
    this.getUserDefaultProperty = this.getUserDefaultProperty.bind(this);
    this.getWallpaperImageSourceAndDimensions =
      this.getWallpaperImageSourceAndDimensions.bind(this);
    this.getResizedImageDimensions = this.getResizedImageDimensions.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleBookingEdit = this.handleBookingEdit.bind(this);
    this.handleBookingCancel = this.handleBookingCancel.bind(this);
    this.cancelBooking = this.cancelBooking.bind(this);
    this.renderBookingCards = this.renderBookingCards.bind(this);
    this.handleEndReached = this.handleEndReached.bind(this);
    this.handleScheduleGuest = this.handleScheduleGuest.bind(this);
    this.registerInKeyboardAwareScrollView = this.registerInKeyboardAwareScrollView.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.keyboardAwareScrollViewTextInputs = [];
    this.publicationDataProcessedAgainstLocalDB = false;
    this.bookingCardsInitiallyRendered = false;
    this.mounted = false;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(Scenes.Profile);
  }




  componentDidMount() {
    this.mounted = true;
  }




  componentWillUnmount() {
    this.mounted = false;
  }




  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded || this.context.isOffline()) {
      this.renderBookingCards(nextProps);
    }

    if (nextProps.dataLoaded) {
      if (!this.publicationDataProcessedAgainstLocalDB) {
        let { bookings, companies, properties, rooms } = nextProps;
        this.publicationDataProcessedAgainstLocalDB = db.sync({ bookings, companies, properties, rooms });
      }
    }
  }




  getUserCompanies() {
    let { user, companies } = this.props;

    let userCompanies = [];

    user && user.companies && user.companies.forEach(userCompany => {
      let company = companies && companies.find(item => item._id === userCompany.companyId);
      if (company) { userCompanies.push(company); }
    });

    return userCompanies;
  }




  getUserDefaultProperty() {
    let { user, properties } = this.props;

    let propertyId;

    user && user.propertyUse && user.propertyUse.some(use => {
      if (!use.endDate) {
        propertyId = use.propertyId;
        return true;
      }
    });

    let userDefaultProperty = properties && properties.find(property => property._id === propertyId);

    return userDefaultProperty;
  }




  getWallpaperImageSourceAndDimensions() {
    let result;
    let property = this.getUserDefaultProperty();

    if (property && property.imgUrls) {
      let imgUrl = property.imgUrls.find(imgUrl => imgUrl.cover === true);

      if (imgUrl && imgUrl.cdnLarge) {
        Image.getSize(imgUrl.cdnLarge, (width, height) => {
          if (this.mounted) {
            this.setState({
              wallpaperImageSource: { uri: imgUrl.cdnLarge },
              wallpaperImageWidth: width,
              wallpaperImageHeight: height,
            });
          }
        }, () => {
          if (this.mounted) {
            let defaultSource = require('../../resources/profile-background.jpg');
            let width = 1440;
            let height = 1024;
            this.setState({
              wallpaperImageSource: defaultSource,
              wallpaperImageWidth: width,
              wallpaperImageHeight: height,
            });
          }
        });
      }
    }
  }




  getResizedImageDimensions(width, height) {
    let longSide = Math.max(
      Dimensions.get('window').height,
      Dimensions.get('window').width
    );

    let shortSide = Math.min(
      Dimensions.get('window').height,
      Dimensions.get('window').width
    );

    let resizedHeight, resizedWidth;

    if (width === 0 || height === 0) {
      if (this.state.landscape) {
        resizedWidth = longSide;
        resizedHeight = shortSide;
      } else {
        resizedHeight = longSide;
        resizedWidth = shortSide;
      }
      return { width: resizedWidth, height: resizedHeight };
    }

    let aspectRatio = width / height;
    let pixelRatio = PixelRatio.get();

    if (this.state.landscape) {
      resizedWidth = longSide;
      resizedHeight = resizedWidth / aspectRatio;
    } else {
      resizedHeight = longSide;
      resizedWidth = resizedHeight * aspectRatio;
    }

    return { width: resizedWidth, height: resizedHeight };
  }




  handleSave() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to save changes while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    this.setState({
      editingUserProfile: false,
      actionConfirmed: true,
    });
  }




  handleCancel() {
    this.setState({
      editingUserProfile: false,
      actionConfirmed: false,
    });
  }




  handleBookingEdit(booking) {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to edit while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    Actions[Subscenes.BookingEditing]({
      booking,
      properties: this.props.properties,
      rooms: this.props.rooms,
    });
  }




  handleBookingCancel(id) {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to cancel while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    Alert.alert(
      'Are you sure you want to cancel this booking?',
      '',
      [
        { text: 'No' },
        { text: 'Yes', onPress: () => this.cancelBooking(id) },
      ]
    );
  }




  cancelBooking(id) {
    Meteor.call('cancelBooking', id, (error) => {
      if (error) {
        console.warn('[Error][UserProfileContainer.cancelBooking]', error);
        this.context.showSnackbar({
          message: error.reason || 'Failed to cancel booking.',
          duration: Duration.Indefinite,
          button: {
            label: 'CLOSE',
          },
        });
      }
    });
  }




  renderBookingCards(nextProps) {
    let { bookings, bookingsToShowCount } = nextProps;
    let listViewData = [];

    let i = 0, k = 0;

    while ((i < bookings.length) && (k < bookingsToShowCount)) {
      let booking = bookings[i];

      if (!booking.cancelled) {
        listViewData.push({ booking });
        k++;
      }

      i++;
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(listViewData),
    });

    this.bookingCardsInitiallyRendered = true;
  }




  handleEndReached() {
    let { bookings, totalBookingsCount, bookingsToShowCount } = this.props;

    if (bookingsToShowCount < totalBookingsCount) {
      let nextBookingsToShowCount = Math.min(bookingsToShowCount + BookingsPerPageCount, totalBookingsCount);
      Actions.refresh({ bookingsToShowCount: nextBookingsToShowCount });
    }
  }




  registerInKeyboardAwareScrollView(item) {
    this.keyboardAwareScrollViewTextInputs.push(item);
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    let landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  handleScheduleGuest() {
    if (this.context.isOffline()) {
      return this.context.showToast(
        'Unable to invite while in Offline mode.\n' +
        'Check Internet connection and try again'
      );
    }

    Actions[Subscenes.ScheduleGuest]();
  }




  render() {
    let { props, context, state } = this;
    let { dataLoaded, totalBookingsCount, bookingsToShowCount, bookings } = props;


    if (!state.wallpaperImageSource) {
      this.getWallpaperImageSourceAndDimensions();
    }


    let statusBar = (
      <StatusBar
        hidden={state.landscape}
        barStyle='light-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );



    let wallpaperView = (
      <View style={styles.wallpaperView}>
        <Image
          resizeMode='cover'
          source={state.wallpaperImageSource}
          style={[
            styles.wallpaperView,
            this.getResizedImageDimensions(
              state.wallpaperImageWidth,
              state.wallpaperImageHeight
            )
          ]}
        />
      </View>
    );


    let userProfileCard = (
      <UserProfileCard
        user={props.user}
        companies={this.getUserCompanies()}
        properties={props.properties}
        editing={state.editingUserProfile}
        onStartEditing={() => this.setState({ editingUserProfile: true })}
        onChange={(fieldsValidated) => {
          this.setState({ actionButtonDisabled: !fieldsValidated });
        }}
        saveOnEndEditing={state.actionConfirmed}
        registerInKeyboardAwareScrollView={this.registerInKeyboardAwareScrollView}
      />
    );


    let onlineOfflineColor = !this.context.isOffline() ? Primary1Color : Secondary1Color;

    let titleBar = (
      <View style={[ styles.bookingsTitleBarView, { backgroundColor: onlineOfflineColor }]}>
        <Text style={styles.bookingsTitleBarText}>
          ROOM BOOKINGS
        </Text>
      </View>
    );


    let noBookingsCard = (
      <Card style={styles.noBookingsCard}>
        <Text style={styles.noBookingsText}>
          You have no bookings
        </Text>
        <RaisedButton
          label="MAKE A BOOKING"
          primary={true}
          onPress={Actions[Scenes.Booking]}
          style={styles.makeBookingButton}
        />
      </Card>
    );


    let nonCancelledBookingsExist = bookings && bookings.some(booking => !booking.cancelled);

    let renderHeader = () => (
      <View style={styles.headerView}>
        {userProfileCard}
        {titleBar}
        {
          (dataLoaded || context.isOffline()) && !nonCancelledBookingsExist ? (
            <View style={styles.noBookingsCardWrapperView}>
              {noBookingsCard}
            </View>
          ) : (
            <View style={styles.bookingsListPaddingTop} />
          )
        }
      </View>
    );


    let renderRow = (rowData) => (
      <View style={styles.bookingCardWrapperView}>
        <BookingCard
          booking={rowData.booking}
          rooms={props.rooms}
          properties={props.properties}
          onBookingEdit={this.handleBookingEdit}
          onBookingCancel={this.handleBookingCancel}
        />
      </View>
    );


    let renderFooter = () => (
      (!dataLoaded && !context.isOffline()) || bookingsToShowCount < totalBookingsCount ? (
        <View style={styles.loadingSpinnerView}>
          <ActivityIndicator
            animating={!dataLoaded}
            color={Primary1Color}
            size='small'
          />
        </View>
      ) : (
        <View style={styles.bookingsListPaddingBottom} />
      )
    );


    let scheduleGuestButton = !this.state.editingUserProfile ? (
      <View style={styles.scheduleGuestButton}>
        <AccentColoredFab onPress={this.handleScheduleGuest}>
          <Icon
            name={'person-add'}
            size={25}
            color='white'
          />
        </AccentColoredFab>
      </View>
    ) : null;


    let actionButtonsBar = state.editingUserProfile ? (
      <ActionButtonsBar
        buttons={[{
          disabled: state.actionButtonDisabled,
          label: 'SAVE',
          onPress: this.handleSave,
        }, {
          label: 'CANCEL',
          onPress: this.handleCancel,
        }]}
      />
    ) : null;


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          this.context.hideSnackbar();
          return false;
        }}
        style={styles.wrapperView}
      >
        {wallpaperView}
        {statusBar}
        <ListView
          bounces={false}
          dataSource={state.dataSource}
          enableEmptySections={true}
          initialListSize={BookingsPerPageCount}
          keyboardShouldPersistTaps='always'
          onEndReached={this.handleEndReached}
          onEndReachedThreshold={BookingsListPaddingBottom}
          renderHeader={renderHeader}
          renderRow={renderRow}
          renderFooter={renderFooter}
          renderScrollComponent={props => <KeyboardAwareScrollView {...props} />}
          textInputs={this.keyboardAwareScrollViewTextInputs}
        />
        {scheduleGuestButton}
        {actionButtonsBar}
      </View>
    );
  }




  componentDidUpdate() {
    if (this.context.isOffline() && !this.bookingCardsInitiallyRendered) {
      this.renderBookingCards(this.props);
    }
  }

}

UserProfile.propTypes = {
  dataLoaded: PropTypes.bool,
  user: PropTypes.object,
  bookings: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  totalBookingsCount: PropTypes.number,
  bookingsToShowCount: PropTypes.number,
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  rooms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
};

UserProfile.defaultProps = {
  bookingsToShowCount: BookingsPerPageCount,
};

UserProfile.contextTypes = {
  showSnackbar: PropTypes.func,
  hideSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
  navigationTracker: PropTypes.object,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  wallpaperView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingSpinnerView: {
    height: 36,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: BookingsListPaddingTop,
    backgroundColor: Canvas3Color,
  },
  headerView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  bookingsTitleBarView: {
    height: TitleBarHeight,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingsTitleBarText: {
    fontSize: TitleBarFontSize,
    fontWeight: 'bold',
    color: WhiteTextColor,
  },
  noBookingsCardWrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingBottom: 15,
    backgroundColor: Canvas3Color,
  },
  noBookingsCard: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noBookingsText: {
    fontSize: TextFontSize,
    color: TextColor,
    marginBottom: 6,
  },
  makeBookingButton: {
    width: 170,
  },
  bookingsListPaddingTop: {
    height: BookingsListPaddingTop,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: Canvas3Color,
  },
  bookingsListPaddingBottom: {
    height: BookingsListPaddingBottom,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: Canvas3Color,
  },
  bookingCardWrapperView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: Canvas3Color,
  },
  scheduleGuestButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});




export default createContainer(props => {
  let user = Meteor.user();

  if (!user) {
    let user = db.getCurrentUser() || {};
    let bookings = db.getBookings()
      .filtered('creatorId == $0', user._id)
      .sorted('startDate', true);

    return {
      user,
      dataLoaded: false,
      bookings,
      totalBookingsCount: bookings.length,
      companies: db.getCompanies(),
      properties: db.getProperties(),
      rooms: db.getRooms(),
    };
  }

  const params = {
    bookings: {
      limit: props.bookingsToShowCount || BookingsPerPageCount,
    }
  };

  const subscriptionHandle = Meteor.subscribe('collectionsForUserProfileV003', params);

  let dataLoaded = subscriptionHandle.ready();

  let bookings = dataLoaded ? (
    Meteor.collection('bookings')
      .find({ 'creatorId': user._id })
      .sort((a, b) => b.startDate - a.startDate)
  ) : (
    db.getBookings()
      .filtered('creatorId == $0', user._id)
      .sorted('startDate', true)
  );

  let totalBookingsCollection = Meteor.collection('counts').findOne({ _id: 'totalBookingsForProfilePage' });
  let totalBookingsCount = dataLoaded ?
    Number(totalBookingsCollection && totalBookingsCollection.count) :
    bookings.length;

  return {
    dataLoaded,
    user,
    bookings,
    totalBookingsCount,
    companies: dataLoaded ? Meteor.collection('companies').find() : db.getCompanies(),
    properties: dataLoaded ? Meteor.collection('properties').find() : db.getProperties(),
    rooms: dataLoaded ? Meteor.collection('rooms').find() : db.getRooms(),
  };
}, UserProfile);
