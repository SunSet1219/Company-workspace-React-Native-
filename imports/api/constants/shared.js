const SharedConstants = {

  propertiesTimeZone: 'America/New_York',

  Periods: [{
    label: '30 Minutes',
    value: 30,
  }, {
    label: '1 Hour',
    value: 60,
  }, {
    label: '1.5 Hours',
    value: 90,
  }, {
    label: '2 Hours',
    value: 120,
  }, {
    label: '2.5 Hours',
    value: 150,
  }, {
    label: '3 Hours',
    value: 180,
  }, {
    label: 'Longer',
  }],

  Scenes: {
    Root: 'root',
    Initial: 'initial',
    Login: 'login',
    Profile: 'profile',
    Company: 'company',
    Booking: 'booking',
    Contact: 'contact',
    About: 'about',
    Account: 'account',
    MyKnotel: 'myKnotel',
    AccessSignUp: 'accessSignUp',
    Broadcasts: 'broadcasts',
    Location:'location',
  },

  Subscenes: {
    BookingDialog: 'bookingDialog',
    InviteMembers: 'inviteMembers',
    BookingEditing: 'bookingEditing',
    BookingCalendar: 'bookingCalendar',
    BroadcastsAddEditForm: 'broadcastsAddEditForm',
    ScheduleGuest: 'scheduleGuest',
  },

  DeepLinks: {
    Login: 'login',
    ResetPassword: 'reset-password',
  },

};


export default SharedConstants;
