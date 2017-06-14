
'use strict';


import DdpObserver from './ddp-observer';
import realm from './realm-schema';
import UUID from './UUID';

const Collections = [
  'Attendee',
  'AV',
  'Avatar',
  'Booking',
  'Capacity',
  'Company',
  'CompanyProperty',
  'CurrentUserId',
  'Email',
  'ImgUrl',
  'Location',
  'Number',
  'Phone',
  'Property',
  'Room',
  'SavedData',
  'String',
  'User',
  'UserCompany',
  'UserProfile',
  'UserProperty',
  'Whiteboard'
];




class RealmDB {

  constructor() {
    this._getMappedUserFields = this._getMappedUserFields.bind(this);
    this._getMappedBookingFields = this._getMappedBookingFields.bind(this);
    this._getMappedCompanyFields = this._getMappedCompanyFields.bind(this);
    this._getUnmappedCompanyFields = this._getUnmappedCompanyFields.bind(this);
    this._getMappedPropertyFields = this._getMappedPropertyFields.bind(this);
    this._getMappedRoomFields = this._getMappedRoomFields.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.saveBooking = this.saveBooking.bind(this);
    this.saveCompany = this.saveCompany.bind(this);
    this.saveProperty = this.saveProperty.bind(this);
    this.saveRoom = this.saveRoom.bind(this);
    this._fillUndefinedOptionalUserSubfieldsWithNulls =
      this._fillUndefinedOptionalUserSubfieldsWithNulls.bind(this);
    this._fillUndefinedOptionalBookingSubfieldsWithNulls =
      this._fillUndefinedOptionalBookingSubfieldsWithNulls.bind(this);
    this._fillUndefinedOptionalCompanySubfieldsWithNulls =
      this._fillUndefinedOptionalCompanySubfieldsWithNulls.bind(this);
    this._fillUndefinedOptionalPropertySubfieldsWithNulls =
      this._fillUndefinedOptionalPropertySubfieldsWithNulls.bind(this);
    this._fillUndefinedOptionalRoomSubfieldsWithNulls =
      this._fillUndefinedOptionalRoomSubfieldsWithNulls.bind(this);
    this._equalObjects = this._equalObjects.bind(this);
    this._equalArraysOfObjects = this._equalArraysOfObjects.bind(this);
    this._getChangedFields = this._getChangedFields.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateBooking = this.updateBooking.bind(this);
    this.updateCompany = this.updateCompany.bind(this);
    this.updateProperty = this.updateProperty.bind(this);
    this.updateRoom = this.updateRoom.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.deleteCurrentUserId = this.deleteCurrentUserId.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.deleteUsers = this.deleteUsers.bind(this);
    this.getBookings = this.getBookings.bind(this);
    this.getBookingById = this.getBookingById.bind(this);
    this.deleteBookings = this.deleteBookings.bind(this);
    this.getCompanies = this.getCompanies.bind(this);
    this.getCompanyById = this.getCompanyById.bind(this);
    this.deleteCompanies = this.deleteCompanies.bind(this);
    this.getProperties = this.getProperties.bind(this);
    this.getPublishedProperties = this.getPublishedProperties.bind(this);
    this.getPropertyById = this.getPropertyById.bind(this);
    this.deleteProperties = this.deleteProperties.bind(this);
    this.getRooms = this.getRooms.bind(this);
    this.getPublishedRooms = this.getPublishedRooms.bind(this);
    this.getRoomById = this.getRoomById.bind(this);
    this.deleteRooms = this.deleteRooms.bind(this);
    this.markDataAsSaved = this.markDataAsSaved.bind(this);
    this.add = this.add.bind(this);
    this.sync = this.sync.bind(this);
    this.processCurrentUserPublicationData = this.processCurrentUserPublicationData.bind(this);

    this.ddpObserver = new DdpObserver(this);
  }




  UUID() {
    return UUID();
  }




  addListener(callback) {
    realm.addListener('change', callback);
  }




  removeListener(callback) {
    realm.removeListener('change', callback);
  }




  deleteAllData() {
    realm.write(() => {
      realm.deleteAll();
    });
  }




  _cloneObjectField(object, field) {
    if (object && object[field]) {
      object[field] = { ...object[field] };
    }
  }




  _cloneArrayField(object, field) {
    if (object && object[field]) {
      object[field] = [...object[field]];
    }
  }




  _cloneListOfObjectsField(object, field) {
    if (object && object[field] && object[field].length) {
      object[field] = object[field].map(item => ({ ...item }));
    }
  }




  _mapStringOrNumberListField(object, field) {
    if (object && object[field] && object[field].length) {
      object[field] = object[field].map(item => ({ value: item }));
    }
  }




  _unmapStringOrNumberListField(object, field) {
    let unmappedListField = [];
    if (object && object[field] && object[field].length) {
      unmappedListField = object[field].map(item => item.value);
    }
    return unmappedListField;
  }




  _extendListFieldItemsWithIds(id, object, field) {
    if (object && object[field] && object[field].length) {
      object[field].forEach((item, i) => {
        item._id = id + i.toString();
      });
    }
  }




  _extendObjectFieldWithId(id, object, field) {
    if (object && object[field]) {
      object[field]._id = id;
    }
  }




  _getMappedUserFields(id, fields) {
    let mappedFields = { ...fields };

    this._cloneListOfObjectsField(mappedFields, 'emails');
    this._extendListFieldItemsWithIds(id, mappedFields, 'emails');

    this._cloneObjectField(mappedFields, 'profile');
    this._extendObjectFieldWithId(id, mappedFields, 'profile');

    this._cloneObjectField(mappedFields.profile, 'avatar');
    this._extendObjectFieldWithId(id, mappedFields.profile, 'avatar');

    this._cloneListOfObjectsField(mappedFields, 'companies');
    this._extendListFieldItemsWithIds(id, mappedFields, 'companies');

    this._cloneListOfObjectsField(mappedFields, 'propertyUse');
    this._extendListFieldItemsWithIds(id, mappedFields, 'propertyUse');

    this._cloneArrayField(mappedFields, 'roles');
    this._mapStringOrNumberListField(mappedFields, 'roles');
    this._extendListFieldItemsWithIds(id, mappedFields, 'roles');

    return mappedFields;
  }




  _getUnmappedUserFields(fields) {
    let unmappedFields = { ...fields };

    unmappedFields.roles = this._unmapStringOrNumberListField(unmappedFields, 'roles');

    return unmappedFields;
  }




  _getMappedBookingFields(id, fields) {
    let mappedFields = { ...fields };

    this._cloneListOfObjectsField(mappedFields, 'attendees');
    this._extendListFieldItemsWithIds(id, mappedFields, 'attendees');

    return mappedFields;
  }




  _getMappedCompanyFields(id, fields) {
    let mappedFields = { ...fields };

    this._cloneListOfObjectsField(mappedFields, 'properties');
    this._extendListFieldItemsWithIds(id, mappedFields, 'properties');

    mappedFields.properties && mappedFields.properties.forEach(item => {
      this._cloneArrayField(item, 'floors');
      this._mapStringOrNumberListField(item, 'floors');
      this._extendListFieldItemsWithIds(id, item, 'floors');
    });

    this._cloneArrayField(mappedFields, 'servicesNeed');
    this._mapStringOrNumberListField(mappedFields, 'servicesNeed');
    this._extendListFieldItemsWithIds(id, mappedFields, 'servicesNeed');

    return mappedFields;
  }




  _getUnmappedCompanyFields(fields) {
    let unmappedFields = { ...fields };

    this._cloneListOfObjectsField(unmappedFields, 'properties');

    unmappedFields.properties && unmappedFields.properties.forEach(item => {
      item.floors = this._unmapStringOrNumberListField(item, 'floors');
    });

    unmappedFields.servicesNeed = this._unmapStringOrNumberListField(unmappedFields, 'servicesNeed');

    return unmappedFields;
  }




  _getMappedPropertyFields(id, fields) {
    let mappedFields = { ...fields };

    this._cloneListOfObjectsField(mappedFields, 'imgUrls');
    this._extendListFieldItemsWithIds(id, mappedFields, 'imgUrls');

    return mappedFields;
  }




  _getMappedRoomFields(id, fields) {
    let mappedFields = { ...fields };

    this._cloneListOfObjectsField(mappedFields, 'imgUrls');
    this._extendListFieldItemsWithIds(id, mappedFields, 'imgUrls');

    this._cloneObjectField(mappedFields, 'location');
    this._extendObjectFieldWithId(id, mappedFields, 'location');

    this._cloneObjectField(mappedFields, 'capacity');
    this._extendObjectFieldWithId(id, mappedFields, 'capacity');

    this._cloneObjectField(mappedFields, 'whiteboard');
    this._extendObjectFieldWithId(id, mappedFields, 'whiteboard');

    this._cloneObjectField(mappedFields, 'phone');
    this._extendObjectFieldWithId(id, mappedFields, 'phone');

    this._cloneObjectField(mappedFields, 'av');
    this._extendObjectFieldWithId(id, mappedFields, 'av');

    return mappedFields;
  }




  _idOrFieldsUndefined(id, fields, callerMethodName) {
    if (!id || typeof id !== 'string') {
      console.log(`[Error][RealmDB.${callerMethodName}][id not provided]`);
      return true;
    }

    if (!fields || !Object.keys(fields).length) {
      console.log(`[Error][RealmDB.${callerMethodName}][fields not provided]`);
      return true;
    }

    return false;
  }




  saveUser(id, fields) {
    if (this._idOrFieldsUndefined(id, fields, 'saveUser')) {
      return false;
    }

    try {
      let mappedFields = this._getMappedUserFields(id, fields);
      mappedFields._id = id;

      realm.write(() => {
        realm.create('User', mappedFields);
      });
    } catch (error) {
      console.log('[Error][RealmDB.saveUser]', error);
      return false;
    }

    return true;
  }




  saveBooking(id, fields) {
    if (this._idOrFieldsUndefined(id, fields, 'saveBooking')) {
      return false;
    }

    try {
      let mappedFields = this._getMappedBookingFields(id, fields);
      mappedFields._id = id;

      realm.write(() => {
        realm.create('Booking', mappedFields);
      });
    } catch (error) {
      console.log('[Error][RealmDB.saveBooking]', error);
      return false;
    }

    return true;
  }




  saveCompany(id, fields) {
    if (this._idOrFieldsUndefined(id, fields, 'saveCompany')) {
      return false;
    }

    try {
      let mappedFields = this._getMappedCompanyFields(id, fields);
      mappedFields._id = id;

      realm.write(() => {
        realm.create('Company', mappedFields);
      });
    } catch (error) {
      console.log('[Error][RealmDB.saveCompany]', error);
      return false;
    }

    return true;
  }




  saveProperty(id, fields) {
    if (this._idOrFieldsUndefined(id, fields, 'saveProperty')) {
      return false;
    }

    try {
      let mappedFields = this._getMappedPropertyFields(id, fields);
      mappedFields._id = id;

      realm.write(() => {
        realm.create('Property', mappedFields);
      });
    } catch (error) {
      console.log('[Error][RealmDB.saveProperty]', error);
      return false;
    }

    return true;
  }




  saveRoom(id, fields) {
    if (this._idOrFieldsUndefined(id, fields, 'saveRoom')) {
      return false;
    }

    try {
      let mappedFields = this._getMappedRoomFields(id, fields);
      mappedFields._id = id;

      realm.write(() => {
        realm.create('Room', mappedFields);
      });
    } catch (error) {
      console.log('[Error][RealmDB.saveRoom]', error);
      return false;
    }

    return true;
  }




  _fillFieldsWithNulls(object, fields) {
    if (!object || !fields || !fields.length) return;

    fields.forEach(field => object[field] = null);
  }




  _fillUndefinedFieldsWithNulls(object, fields) {
    if (!object || !fields || !fields.length) return;

    fields.forEach(field => {
      if (object[field] === undefined) object[field] = null;
    });
  }




  _fillListUndefinedFieldsWithNulls(list, fields) {
    if (!list || list.length || !fields || !fields.length) return;

    list.forEach(object => {
      fields.forEach(field => {
        if (object[field] === undefined) object[field] = null;
      });
    });
  }




  _fillUndefinedOptionalUserSubfieldsWithNulls(fields) {
    let profileOptionalFields = [ 'firstName', 'lastName', 'phone', 'avatar' ];
    this._fillUndefinedFieldsWithNulls(fields.profile, profileOptionalFields);

    let avatarOptionalFields = [ 'upload', 'email', 'linkedin' ];
    if (fields.profile && fields.profile.avatar) {
      this._fillUndefinedFieldsWithNulls(fields.profile.avatar, avatarOptionalFields);
    }

    let companiesOptionalFields = [ 'companyId', 'role', 'position' ];
    this._fillListUndefinedFieldsWithNulls(fields.companies, companiesOptionalFields);

    let propertyUseOptionalFields = [ 'floor', 'seat', 'startDate', 'endDate' ];
    this._fillListUndefinedFieldsWithNulls(fields.propertyUse, propertyUseOptionalFields);
  }




  _fillUndefinedOptionalBookingSubfieldsWithNulls(fields) {
    let attendeesOptionalFields = [ 'userId', 'displayName', 'organiser' ];
    this._fillListUndefinedFieldsWithNulls(fields.attendees, attendeesOptionalFields);
  }




  _fillUndefinedOptionalCompanySubfieldsWithNulls(fields) {
    let propertyOptionalFields = ['floors'];
    this._fillListUndefinedFieldsWithNulls(fields.properties, propertyOptionalFields);
  }




  _fillUndefinedOptionalPropertySubfieldsWithNulls(fields) {
    let imgUrlsOptionalFields = ['cover'];
    this._fillListUndefinedFieldsWithNulls(fields.imgUrls, imgUrlsOptionalFields);
  }




  _fillUndefinedOptionalRoomSubfieldsWithNulls(fields) {
    let imgUrlsOptionalFields = ['cover'];
    this._fillListUndefinedFieldsWithNulls(fields.imgUrls, imgUrlsOptionalFields);

    let capacityOptionalFields = ['notes'];
    this._fillUndefinedFieldsWithNulls(fields.capacity, capacityOptionalFields);

    let whiteboardOptionalFields = ['notes'];
    this._fillUndefinedFieldsWithNulls(fields.whiteboard, whiteboardOptionalFields);

    let phoneOptionalFields = [ 'number', 'notes' ];
    this._fillUndefinedFieldsWithNulls(fields.phone, phoneOptionalFields);

    let avOptionalFields = ['notes'];
    this._fillUndefinedFieldsWithNulls(fields.av, avOptionalFields);
  }




  _fillClearedRequiredUserFieldsWithDefaults(mappedFields, cleared) {
    if (cleared.indexOf('forceToUpdatePwd') !== -1) {
      mappedFields.forceToUpdatePwd = false;
    }

    if (cleared.indexOf('registrationCompleted') !== -1) {
      mappedFields.registrationCompleted = false;
    }
  }



  _equalArraysOfObjects(arr1, arr2) {
    let arr1Len = +(arr1 && arr1.length);
    let arr2Len = +(arr2 && arr2.length);

    if (arr1Len === 0 && arr2Len === 0) {
      return true;
    }

    if (arr1Len !== arr2Len) {
      return false;
    }

    arr1.sort((a, b) => {
      if (a._id > b._id) return 1;
      if (a._id < b._id) return -1;
      if (a._id === b._id) return 0;
    });
    arr2.sorted('_id', true);

    let result = true;

    arr1.forEach((item, i) => {
      if (!this._equalObjects(item, arr2[i])) {
        result = false;
      }
    });

    return result;
  }




  _equalObjects(obj1, obj2) {
    if (obj2 === undefined) {
      return true;
    }

    if (obj2 === null) {
      if (obj1 === null) {
        return true;
      } else {
        return false;
      }
    }

    if (obj1 === null) {
      return false;
    }

    for (let key in obj1) {
      let val1 = obj1[key];
      let val2 = obj2[key];

      if (val2 === undefined) continue;

      let isObject = (v) => { return (v && typeof v === 'object'); };
      let isDate = (v) => { return (v && typeof v.getTime === 'function'); };

      if (isObject(val1)) {
        if (isDate(val1)) {
          if (isDate(val2)) {
            if (val1.getTime() !== val2.getTime()) {
              return false;
            }
          }
        } else {
          if (!this._equalObjects(val1, val2)) {
            return false;
          }
        }
      } else {
        if (val1 !== val2) {
          return false;
        }
      }
    }

    return true;
  }




  _getChangedFields(serverFields, localFields) {
    let changedFields = {};

    for (let key in serverFields) {
      let localValue = localFields && localFields[key];
      if (localValue !== undefined) {
        let serverValue = serverFields[key];
        let serverValueType = typeof serverValue;

        switch (serverValueType) {
          case ('boolean'):
          case ('number'):
          case ('string'):
          case ('undefined'):
            if (localValue !== serverValue) {
              changedFields[key] = serverValue;
            }
            break;

          case ('object'):
            let isDate = (v) => { return (v && typeof v.getTime === 'function'); };

            if (serverValue === null) {
              if (localValue !== serverValue) {
                changedFields[key] = serverValue;
              }
            } else if (isDate(serverValue)) {
              if (isDate(localValue)) {
                if (localValue.getTime() !== serverValue.getTime()) {
                  changedFields[key] = serverValue;
                }
              } else {
                changedFields[key] = serverValue;
              }
            } else if (Array.isArray(serverValue)) {
              if (!this._equalArraysOfObjects(serverValue, localValue)) {
                changedFields[key] = serverValue;
              }
            } else {
              if (!this._equalObjects(serverValue, localValue)) {
                changedFields[key] = serverValue;
              }
            }
            break;

          default:
            console.log('[Error][_getChangedFields serverValueType - case default]');
        }
      }
    }

    return changedFields;
  }




  updateUser(id, fields, cleared) {
    if (!id || typeof id !== 'string') {
      console.log('[Error][RealmDB.updateUser][id not provided]');
      return false;
    }

    try {
      const collection = 'User';
      let mappedFields = {};

      if (fields && Object.keys(fields).length) {
        mappedFields = this._getMappedUserFields(id, fields);
      }

      if (cleared && cleared.length) {
        this._fillFieldsWithNulls(mappedFields, cleared);
        this._fillClearedRequiredUserFieldsWithDefaults(mappedFields, cleared);
      }

      if (Object.keys(mappedFields).length) {
        this._fillUndefinedOptionalUserSubfieldsWithNulls(mappedFields);
      }

      let localFields = this._getById(id, collection);
      let mappedChangedFields = this._getChangedFields(mappedFields, localFields);

      if (!mappedChangedFields || !Object.keys(mappedChangedFields).length) {
        return true;
      }

      mappedChangedFields._id = id;

      realm.write(() => {
        realm.create(collection, mappedChangedFields, true);
      });
    } catch (error) {
      console.log('[Error][RealmDB.updateUser]', error);
      return false;
    }

    return true;
  }




  updateBooking(id, fields, cleared) {
    if (!id || typeof id !== 'string') {
      console.log('[Error][RealmDB.updateBooking][id not provided]');
      return false;
    }

    try {
      const collection = 'Booking';
      let mappedFields = {};

      if (fields && Object.keys(fields).length) {
        mappedFields = this._getMappedBookingFields(id, fields);
      }

      if (cleared && cleared.length) {
        this._fillFieldsWithNulls(mappedFields, cleared);
      }

      if (Object.keys(mappedFields).length) {
        this._fillUndefinedOptionalBookingSubfieldsWithNulls(mappedFields);
      }

      let localFields = this._getById(id, collection);
      let mappedChangedFields = this._getChangedFields(mappedFields, localFields);

      if (!mappedChangedFields || !Object.keys(mappedChangedFields).length) {
        return true;
      }

      mappedChangedFields._id = id;

      realm.write(() => {
        realm.create(collection, mappedChangedFields, true);
      });
    } catch (error) {
      console.log('[Error][RealmDB.updateBooking]', error);
      return false;
    }

    return true;
  }




  updateCompany(id, fields, cleared) {
    if (!id || typeof id !== 'string') {
      console.log('[Error][RealmDB.updateCompany][id not provided]');
      return false;
    }

    try {
      const collection = 'Company';
      let mappedFields = {};

      if (fields && Object.keys(fields).length) {
        mappedFields = this._getMappedCompanyFields(id, fields);
      }

      if (cleared && cleared.length) {
        this._fillFieldsWithNulls(mappedFields, cleared);
      }

      if (Object.keys(mappedFields).length) {
        this._fillUndefinedOptionalCompanySubfieldsWithNulls(mappedFields);
      }

      let localFields = this._getById(id, collection);
      let mappedChangedFields = this._getChangedFields(mappedFields, localFields);

      if (!mappedChangedFields || !Object.keys(mappedChangedFields).length) {
        return true;
      }

      mappedChangedFields._id = id;

      realm.write(() => {
        realm.create(collection, mappedChangedFields, true);
      });
    } catch (error) {
      console.log('[Error][RealmDB.updateCompany]', error);
      return false;
    }

    return true;
  }




  updateProperty(id, fields, cleared) {
    if (!id || typeof id !== 'string') {
      console.log('[Error][RealmDB.updateProperty][id not provided]');
      return false;
    }

    try {
      const collection = 'Property';
      let mappedFields = {};

      if (fields && Object.keys(fields).length) {
        mappedFields = this._getMappedPropertyFields(id, fields);
      }

      if (cleared && cleared.length) {
        this._fillFieldsWithNulls(mappedFields, cleared);
      }

      if (Object.keys(mappedFields).length) {
        this._fillUndefinedOptionalPropertySubfieldsWithNulls(mappedFields);
      }

      let localFields = this._getById(id, collection);
      let mappedChangedFields = this._getChangedFields(mappedFields, localFields);

      if (!mappedChangedFields || !Object.keys(mappedChangedFields).length) {
        return true;
      }

      mappedChangedFields._id = id;

      realm.write(() => {
        realm.create(collection, mappedChangedFields, true);
      });
    } catch (error) {
      console.log('[Error][RealmDB.updateProperty]', error);
      return false;
    }

    return true;
  }




  updateRoom(id, fields, cleared) {
    if (!id || typeof id !== 'string') {
      console.log('[Error][RealmDB.updateRoom][id not provided]');
      return false;
    }

    try {
      const collection = 'Room';
      let mappedFields = {};

      if (fields && Object.keys(fields).length) {
        mappedFields = this._getMappedRoomFields(id, fields);
      }

      if (cleared && cleared.length) {
        this._fillFieldsWithNulls(mappedFields, cleared);
      }

      if (Object.keys(mappedFields).length) {
        this._fillUndefinedOptionalRoomSubfieldsWithNulls(mappedFields);
      }

      let localFields = this._getById(id, collection);
      let mappedChangedFields = this._getChangedFields(mappedFields, localFields);

      if (!mappedChangedFields || !Object.keys(mappedChangedFields).length) {
        return true;
      }

      mappedChangedFields._id = id;

      realm.write(() => {
        realm.create(collection, mappedChangedFields, true);
      });
    } catch (error) {
      console.log('[Error][RealmDB.updateRoom]', error);
      return false;
    }

    return true;
  }




  _get(collection) {
    if (!collection || Collections.indexOf(collection) === -1) {
      console.log(`[Error][RealmDB._get.${collection}][Collection not provided or invalid]`);
      return;
    }

    try {
      return realm.objects(collection);
    } catch (error) {
      console.log(`[Error][RealmDB._get.${collection}]`, error);
    }
  }




  _getById(id, collection) {
    if (id === undefined) {
      console.log(`[Error][RealmDB._getById.${collection}][id not provided]`);
      return;
    }

    if (!collection || Collections.indexOf(collection) === -1) {
      console.log(`[Error][RealmDB._getById.${collection}][Collection not provided or invalid]`);
      return;
    }

    try {
      return realm.objects(collection).find(object => object._id === id);
    } catch (error) {
      console.log(`[Error][RealmDB._getById.${collection}]`, error);
    }
  }




  _delete(collection) {
    if (!collection || Collections.indexOf(collection) === -1) {
      console.log(`[Error][RealmDB._delete.${collection}][Collection not provided or invalid]`);
      return false;
    }

    try {
      let items = realm.objects(collection);

      if (!items || !items.length) {
        console.log(`[Error][RealmDB._delete.${collection}][No items to delete]`, id);
        return;
      }

      realm.write(() => {
        realm.delete(items);
      });
    } catch (error) {
      console.log(`[Error][RealmDB._delete.${collection}]`, error);
      return false;
    }

    return true;
  }




  _deleteById(id, collection) {
    if (id === undefined) {
      console.log(`[Error][RealmDB._deleteById.${collection}][id not provided]`);
      return false;
    }

    if (!collection || Collections.indexOf(collection) === -1) {
      console.log(
        `[Error][RealmDB._deleteById.${collection}][Collection not provided or invalid]`
      );
      return false;
    }

    try {
      let item = realm.objects(collection).find(object => object._id === id);

      if (!item) {
        console.log(`[Error][RealmDB._deleteById.${collection}][Item not found]`, id);
        return false;
      }

      realm.write(() => {
        realm.delete(item);
      });
    } catch (error) {
      console.log(`[Error][RealmDB._deleteById.${collection}]`, error);
      return false;
    }

    return true;
  }




  deleteUserById(id) {
    if (id === undefined) {
      console.log('[Error][RealmDB.deleteUserById][id not provided]');
      return false;
    }

    try {
      let item = realm.objects('User').find(object => object._id === id);

      if (!item) {
        console.log('[Error][RealmDB.deleteUserById][Item not found]', id);
        return false;
      }

      realm.write(() => {
        if (item.profile && item.profile.avatar) {
          realm.delete(item.profile.avatar);
        }

        let listOrObjectTypeFields = [
          'emails', 'profile', 'companies', 'propertyUse', 'roles'
        ];

        listOrObjectTypeFields.forEach(field => {
          if (item[field]) { realm.delete(item[field]); };
        });

        realm.delete(item);
      });
    } catch (error) {
      console.log('[Error][RealmDB.deleteUserById]', error);
      return false;
    }

    return true;
  }




  deleteBookingById(id) {
    if (id === undefined) {
      console.log('[Error][RealmDB.deleteBookingById][id not provided]');
      return false;
    }

    try {
      let item = realm.objects('Booking').find(object => object._id === id);

      if (!item) {
        console.log('[Error][RealmDB.deleteBookingById][Item not found]', id);
        return false;
      }

      realm.write(() => {
        if (item.attendees) {
          realm.delete(item.attendees);
        }

        realm.delete(item);
      });
    } catch (error) {
      console.log('[Error][RealmDB.deleteBookingById]', error);
      return false;
    }

    return true;
  }




  deleteCompanyById(id) {
    if (id === undefined) {
      console.log('[Error][RealmDB.deleteCompanyById][id not provided]');
      return false;
    }

    try {
      let item = realm.objects('Company').find(object => object._id === id);

      if (!item) {
        console.log('[Error][RealmDB.deleteCompanyById][Item not found]', id);
        return false;
      }

      realm.write(() => {
        let listOrObjectTypeFields = [ 'properties', 'servicesNeed' ];

        listOrObjectTypeFields.forEach(field => {
          if (item[field]) { realm.delete(item[field]); };
        });

        realm.delete(item);
      });
    } catch (error) {
      console.log('[Error][RealmDB.deleteCompanyById]', error);
      return false;
    }

    return true;
  }




  deletePropertyById(id) {
    if (id === undefined) {
      console.log('[Error][RealmDB.deletePropertyById][id not provided]');
      return false;
    }

    try {
      let item = realm.objects('Property').find(object => object._id === id);

      if (!item) {
        console.log('[Error][RealmDB.deletePropertyById][Item not found]', id);
        return false;
      }

      realm.write(() => {
        if (item.imgUrls) {
          realm.delete(item.imgUrls);
        }

        realm.delete(item);
      });
    } catch (error) {
      console.log('[Error][RealmDB.deletePropertyById]', error);
      return false;
    }

    return true;
  }




  deleteRoomById(id) {
    if (id === undefined) {
      console.log('[Error][RealmDB.deleteRoomById][id not provided]');
      return false;
    }

    try {
      let item = realm.objects('Room').find(object => object._id === id);

      if (!item) {
        console.log('[Error][RealmDB.deleteRoomById][Item not found]', id);
        return false;
      }

      realm.write(() => {
        let listOrObjectTypeFields = [
          'imgUrls', 'location', 'capacity', 'whiteboard', 'phone', 'av'
        ];

        listOrObjectTypeFields.forEach(field => {
          if (item[field]) { realm.delete(item[field]); };
        });

        realm.delete(item);
      });
    } catch (error) {
      console.log('[Error][RealmDB.deleteRoomById]', error);
      return false;
    }

    return true;
  }




  getCurrentUser() {
    let currentUserId = this._get('CurrentUserId')[0];

    if (currentUserId && currentUserId._id) {
      let fields = this._getById(currentUserId._id, 'User');
      let unmappedFields = fields ? this._getUnmappedUserFields(fields) : fields;
      return unmappedFields;
    }

    return null;
  }


  getCurrentUserId() {
    let currentUserId = this._get('CurrentUserId')[0];
    return currentUserId && currentUserId._id || null;
  }


  saveCurrentUserId(id) {
    if (id === undefined) {
      console.log('[Error][RealmDB.saveCurrentUserId][id not provided]');
      return;
    }

    try {
      realm.write(() => {
        realm.create('CurrentUserId', { _id: id });
      });
    } catch (error) {
      console.log('[Error][RealmDB.saveCurrentUserId]', error);
      return false;
    }

    return true;
  }


  deleteCurrentUserId() {
    let currentUserId = this._get('CurrentUserId')[0];

    try {
      realm.write(() => {
        realm.delete(currentUserId);
      });
    } catch (error) {
      console.log('[Error][RealmDB.deleteCurrentUserId]', error);
      return false;
    }

    return true;
  }




  getUsers() {
    return this._get('User').map(fields => ({ ...this._getUnmappedUserFields(fields) }));
  }

  getUserById(id) {
    let fields = this._getById(id, 'User');
    let unmappedFields = fields ? this._getUnmappedUserFields(fields) : fields;
    return unmappedFields;
  }

  deleteUsers() {
    return this._delete('User');
  }




  getBookings() {
    return this._get('Booking');
  }

  getBookingById(id) {
    return this._getById(id, 'Booking');
  }

  deleteBookings() {
    return this._delete('Booking');
  }




  isCompanyExists(id) {
    return Boolean(this._getById(id, 'Company'));
  }

  getCompanies() {
    return this._get('Company').map(fields => ({ ...this._getUnmappedCompanyFields(fields) }));
  }

  getCompanyById(id) {
    let fields = this._getById(id, 'Company');
    let unmappedFields = fields ? this._getUnmappedCompanyFields(fields) : fields;
    return unmappedFields;
  }

  deleteCompanies() {
    return this._delete('Company');
  }




  getProperties() {
    return this._get('Property');
  }

  getPublishedProperties() {
    let properties = this._get('Property');
    return properties.filtered('published == true');
  }

  getPropertyById(id) {
    return this._getById(id, 'Property');
  }

  deleteProperties() {
    return this._delete('Property');
  }




  getRooms() {
    return this._get('Room');
  }

  getPublishedRooms() {
    let rooms = this._get('Room');
    return rooms.filtered('published == true');
  }

  getRoomById(id) {
    return this._getById(id, 'Room');
  }

  deleteRooms() {
    return this._delete('Room');
  }




  isDataSaved(name) {
    if (name === undefined) {
      console.log('[Error][RealmDB.isDataSaved][name not provided]');
      return;
    }

    try {
      let dataSaved = realm.objects('SavedData').find(object => object.name === name);
      return dataSaved ? true : false;
    } catch (error) {
      console.log('[Error][RealmDB.isDataSaved]', error);
      return false;
    }
  }

  markDataAsSaved(name) {
    if (name === undefined) {
      console.log('[Error][RealmDB.markDataAsSaved][name not provided]');
      return;
    }

    if (this.isDataSaved(name)) { return true; }

    try {
      realm.write(() => {
        realm.create('SavedData', { name });
      });
    } catch (error) {
      console.log('[Error][RealmDB.markDataAsSaved]', error);
      return false;
    }

    return true;
  }




  getLocalCollectionName(serverCollectionName) {
    let localCollectionNamesByServerOnes = {
      bookings: 'Booking',
      companies: 'Company',
      properties: 'Property',
      rooms: 'Room',
      users: 'User',
    };

    return localCollectionNamesByServerOnes[serverCollectionName];
  }




  add(serverCollections) {
    if (!serverCollections || typeof serverCollections !== 'object') {
      console.warn('[Error][RealmDB.save] - serverCollections not provided', serverCollections);
      return false;
    }

    let added = true;

    Object.keys(serverCollections).forEach(serverCollectionName => {
      let localCollectionName = this.getLocalCollectionName(serverCollectionName);
      let serverCollection = serverCollections[serverCollectionName];

      serverCollection.forEach(item => {
        let itemExistsInLocalDB = Boolean(this._getById(item._id, localCollectionName));
        let methodAction = itemExistsInLocalDB ? 'update' : 'save';
        let updateOrSaveMethod = this[`${methodAction}${localCollectionName}`];
        let result = updateOrSaveMethod(item._id, item);
        if (!result) { added = false; }
      });
    });

    return added;
  }




  sync(serverCollections) {
    if (!serverCollections || typeof serverCollections !== 'object') {
      console.warn('[Error][RealmDB.sync] - serverCollections not provided', serverCollections);
      return false;
    }

    let added = this.add(serverCollections);
    let deleted = true;

    Object.keys(serverCollections).forEach(serverCollectionName => {
      let serverCollection = serverCollections[serverCollectionName];
      let serverCollectionIds = serverCollection.map(item => item._id);

      let localCollectionIdsToDelete = [];
      let localCollectionName = this.getLocalCollectionName(serverCollectionName);
      let localCollection = this._get(localCollectionName);

      localCollection.forEach(item => {
        if (serverCollectionIds.indexOf(item._id) === -1) {
          localCollectionIdsToDelete.push(item._id);
        }
      });

      let deleteMethod = this[`delete${localCollectionName}ById`];

      localCollectionIdsToDelete.forEach(id => {
        let result = deleteMethod(id);
        if (!result) { deleted = false; }
      });
    });

    return added && deleted;
  }




  processCurrentUserPublicationData(currentUser) {
    let storedCurrentUserId = this.getCurrentUserId();
    let currentUserIdSaved = Boolean(storedCurrentUserId);
    if (!storedCurrentUserId) {
      currentUserIdSaved = this.saveCurrentUserId(currentUser._id);
    } else if (storedCurrentUserId !== currentUser._id) {
      this.deleteAllData();
      currentUserIdSaved = this.saveCurrentUserId(currentUser._id);
    }

    let storedCurrentUser = this.getUserById(currentUser._id);
    let currentUserDataSaved = !storedCurrentUser ?
      this.saveUser(currentUser._id, currentUser) :
      this.updateUser(currentUser._id, currentUser);

    return currentUserIdSaved && currentUserDataSaved;
  }

};


const db = new RealmDB();
export default db;
