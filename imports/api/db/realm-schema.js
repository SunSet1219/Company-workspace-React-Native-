
'use strict';


import Realm from 'realm';



const CurrentUserIdSchema = {
  name: 'CurrentUserId',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
  },
};

const UserSchema = {
  name: 'User',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    username: { type: 'string', optional: true },
    emails: { type: 'list', objectType: 'Email' },
    profile: { type: 'UserProfile', optional: true },
    companies: { type: 'list', objectType: 'UserCompany' },
    propertyUse: { type: 'list', objectType: 'UserProperty' },
    roles: { type: 'list', objectType: 'String' }, // ['admin', 'user']
    forceToUpdatePwd: { type: 'bool', default: false },
    registrationCompleted: { type: 'bool', default: false },
  },
};

const EmailSchema = {
  name: 'Email',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    address: { type: 'string' },
    verified: { type: 'bool' },
  },
};

const UserProfileSchema = {
  name: 'UserProfile',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    firstName: { type: 'string', optional: true },
    lastName: { type: 'string', optional: true },
    phone: { type: 'string', optional: true },
    avatar: { type: 'Avatar', optional: true },
  },
};

const AvatarSchema = {
  name: 'Avatar',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    upload: { type: 'string', optional: true },
    email: { type: 'string', optional: true },
    linkedin: { type: 'string', optional: true },
  },
};

const UserCompanySchema = {
  name: 'UserCompany',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    companyId: { type: 'string', optional: true },
    role: { type: 'string', optional: true }, // ['admin', 'member']
    position: { type: 'string', optional: true },
  },
};

const UserPropertySchema = {
  name: 'UserProperty',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    propertyId: { type: 'string' },
    floor: { type: 'int', optional: true },
    seat: { type: 'int', optional: true },
    startDate: { type: 'date', optional: true },
    endDate: { type: 'date', optional: true },
  },
};

const StringSchema = {
  name: 'String',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    value: { type: 'string' },
  },
};

const BookingSchema = {
  name: 'Booking',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    title: { type: 'string', optional: true },
    // description: {type: 'string', optional: true},
    attendees: { type: 'list', objectType: 'Attendee' },
    creatorId: { type: 'string', optional: true },
    googleCalendarId: { type: 'string', optional: true },
    googleCalendarEventId: { type: 'string', optional: true },
    // created: {type: 'date', optional: true},
    startDate: { type: 'date' },
    endDate: { type: 'date' },
    // updateDate: {type: 'date', optional: true},
    // 'roomId': {optional: true}
    // for Bookings collection from 'roomsAndProperties' publication
    // where this field is not published
    roomId: { type: 'string', optional: true },
    // iCalUID: {type: 'string', optional: true},
    bookedRoomName: { type: 'string' },
    propertyId: { type: 'string' },
    cancelled: { type: 'bool', optional: true },
    companyId: { type: 'string', optional: true },
  },
};

const AttendeeSchema = {
  name: 'Attendee',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    userId: { type: 'string', optional: true },
    email: { type: 'string' },
    displayName: { type: 'string', optional: true },
    responseStatus: { type: 'string' }, // ['needsAction', 'declined', 'tentative', 'accepted']
    // organiser: {optional: true}
    // for backward compatibility
    organiser: { type: 'bool', optional: true },
    // token: {type: 'string', optional: true},
  },
};

const NumberSchema = {
  name: 'Number',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    value: { type: 'int' },
  },
};

const CompanySchema = {
  name: 'Company',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    properties: { type: 'list', objectType: 'CompanyProperty' },
    // 'email': {optional: true}
    // for Companies collection from 'collectionsForUserProfile' publication
    // where this field is not published
    email: { type: 'string', optional: true },
    logo: { type: 'string', optional: true },
    website: { type: 'string', optional: true },
    primaryPhone: { type: 'string', optional: true },
    operationsContact: { type: 'string', optional: true },
    creatorName: { type: 'string', optional: true },
    servicesNeed: { type: 'list', objectType: 'String' },
    enrollmentId: { type: 'string', optional: true },
    createdAt: { type: 'date', optional: true },
    updatedAt: { type: 'date', optional: true },
  },
};

const CompanyPropertySchema = {
  name: 'CompanyProperty',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    propertyId: { type: 'string' },
    floors: { type: 'list', objectType: 'Number' },
  },
};

const PropertySchema = {
  name: 'Property',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    title: { type: 'string' },
    // 'urlName': {optional: true}
    // for Properties collection from 'roomsAndProperties' publication
    // where this field is not published
    urlName: { type: 'string', optional: true },
    // propertyNotes: {type: 'string', optional: true},
    // description: {type: 'string'},
    // addressLine: {type: 'string'},
    // city: {type: 'string'},
    // state: {type: 'string'},
    // country: {type: 'string'},
    // pinCode: {type: 'int'},
    // floors: {type: 'list', objectType: 'Floor'},
    // opsContact: {type: 'string', optional: true},
    // info: {type: 'PropertyInfo', optional: true},
    imgUrls: { type: 'list', objectType: 'ImgUrl' },
    // 'timeZone': {optional: true}
    // for Properties collection from 'collectionsForCompanyProfile' publication
    // where this field is not published
    timeZone: { type: 'string', optional: true },
    // mailchimpListId: {type: 'string', optional: true},
    published: { type: 'bool', optional: true },
    // createdAt: {type: 'date', optional: true},
    // updatedAt: {type: 'date', optional: true},
  },
};

const ImgUrlSchema = {
  name: 'ImgUrl',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    cover: { type: 'bool', optional: true },
    cdnSmall: { type: 'string' },
    cdnRetinaSmall: { type: 'string' },
    cdnMedium: { type: 'string' },
    cdnRetinaMedium: { type: 'string' },
    cdnLarge: { type: 'string' },
    cdnRetinaLarge: { type: 'string' },
    cdnOriginal: { type: 'string' },
    storageOriginal: { type: 'string' },
  },
};

const RoomSchema = {
  name: 'Room',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    imgUrls: { type: 'list', objectType: 'ImgUrl' },
    calendarId: { type: 'string', optional: true },
    propertyId: { type: 'string' },
    // 'location': {optional: true}
    // for Rooms collection from 'collectionsForUserProfile' publication
    // where it's not published
    location: { type: 'Location', optional: true },
    // channel: { type: 'Channel', optional: true},
    // 'capacity': {optional: true}
    // for Rooms collection from 'collectionsForUserProfile' publication
    // where it's not published
    capacity: { type: 'Capacity', optional: true },
    // 'whiteboard': {optional: true}
    // for Rooms collection from 'collectionsForUserProfile' publication
    // where it's not published
    whiteboard: { type: 'Whiteboard', optional: true },
    // 'phone': {optional: true}
    // for Rooms collection from 'collectionsForUserProfile' publication
    // where it's not published
    phone: { type: 'Phone', optional: true },
    // 'av': {optional: true}
    // for Rooms collection from 'collectionsForUserProfile' publication
    // where it's not published
    av: { type: 'AV', optional: true },
    notes: { type: 'string', optional: true },
    published: { type: 'bool', optional: true },
    // createdAt: {type: 'date', optional: true},
    // updatedAt: {type: 'date', optional: true},
  },
};

const LocationSchema = {
  name: 'Location',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    directions: { type: 'string' },
    floor: { type: 'int' },
  },
};

const CapacitySchema = {
  name: 'Capacity',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    number: { type: 'int' },
    notes: { type: 'string', optional: true },
  },
};

const WhiteboardSchema = {
  name: 'Whiteboard',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    exists: { type: 'bool' },
    notes: { type: 'string', optional: true },
  },
};

const PhoneSchema = {
  name: 'Phone',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    exists: { type: 'bool' },
    number: { type: 'string', optional: true },
    notes: { type: 'string', optional: true },
  },
};

const AVSchema = {
  name: 'AV',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string' },
    tv: { type: 'bool', optional: true },
    appleTv: { type: 'bool', optional: true },
    videocon: { type: 'bool', optional: true },
    notes: { type: 'string', optional: true },
  },
};

const SavedDataSchema = {
  name: 'SavedData',
  primaryKey: 'name',
  properties: {
    name: { type: 'string' },
  },
};




const realm = new Realm({
  schema: [
    CurrentUserIdSchema,
    UserSchema,
    EmailSchema,
    UserProfileSchema,
    AvatarSchema,
    UserCompanySchema,
    UserPropertySchema,
    StringSchema,
    BookingSchema,
    AttendeeSchema,
    NumberSchema,
    CompanySchema,
    CompanyPropertySchema,
    PropertySchema,
    ImgUrlSchema,
    RoomSchema,
    LocationSchema,
    CapacitySchema,
    WhiteboardSchema,
    PhoneSchema,
    AVSchema,
    SavedDataSchema,
  ],
  schemaVersion: 4,
  migration: (oldRealm, newRealm) => {
    newRealm.deleteAll();
  },
});


export default realm;
