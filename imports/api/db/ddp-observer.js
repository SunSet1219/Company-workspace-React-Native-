
'use strict';


import Meteor from 'baryshok-react-native-meteor';

const DEBUG = false;




class DdpObserver {

  constructor(db) {
    this.db = db;
    this.subscribing = [];
    this.unsubscribing = [];

    this.registerEventsListeners = this.registerEventsListeners.bind(this);
    this.unregisterEventsListeners = this.unregisterEventsListeners.bind(this);
    this._handleSubscribingEvent = this._handleSubscribingEvent.bind(this);
    this._handleUnsubscribingEvent = this._handleUnsubscribingEvent.bind(this);
    this._handleAddedEvent = this._handleAddedEvent.bind(this);
    this._handleChangedEvent = this._handleChangedEvent.bind(this);
    this._handleRemovedEvent = this._handleRemovedEvent.bind(this);
    this._handleReadyEvent = this._handleReadyEvent.bind(this);
    this._handleNosubEvent = this._handleNosubEvent.bind(this);
    this._isSubscribing = this._isSubscribing.bind(this);
    this._isUnsubscribing = this._isUnsubscribing.bind(this);
    this._shouldUpdateDb = this._shouldUpdateDb.bind(this);
  }




  registerEventsListeners() {
    if (!Meteor.ddp) {
      console.warn('[Error][DdpObserver.registerEventsListeners] Meteor.ddp', Meteor.ddp);
      return;
    }

    Meteor.ddp.on('subscribing', this._handleSubscribingEvent);
    Meteor.ddp.on('unsubscribing', this._handleUnsubscribingEvent);
    Meteor.ddp.on('added', this._handleAddedEvent);
    Meteor.ddp.on('changed', this._handleChangedEvent);
    Meteor.ddp.on('removed', this._handleRemovedEvent);
    Meteor.ddp.on('ready', this._handleReadyEvent);
    Meteor.ddp.on('nosub', this._handleNosubEvent);
  }




  unregisterEventsListeners() {
    if (!Meteor.ddp) {
      console.warn('[Error][DdpObserver.unregisterEventsListeners] Meteor.ddp', Meteor.ddp);
      return;
    }

    Meteor.ddp.off('subscribing', this._handleSubscribingEvent);
    Meteor.ddp.off('unsubscribing', this._handleUnsubscribingEvent);
    Meteor.ddp.off('added', this._handleAddedEvent);
    Meteor.ddp.off('changed', this._handleChangedEvent);
    Meteor.ddp.off('removed', this._handleRemovedEvent);
    Meteor.ddp.off('ready', this._handleReadyEvent);
    Meteor.ddp.off('nosub', this._handleNosubEvent);
  }




  _handleSubscribingEvent(subId) {
    this.subscribing.push(subId);
  }




  _handleUnsubscribingEvent(subId) {
    this.unsubscribing.push(subId);
  }




  _handleAddedEvent(message) {
    let { id, fields, collection } = message;

    DEBUG && console.log(`[ADDED] ${collection} ${id}`);

    if (!this._shouldUpdateDb()) { return; }

    switch (collection) {
      case 'users':
        break;

      case 'bookings':
        if (!this.db.getBookingById(id)) {
          let result = this.db.saveBooking(id, fields);
          DEBUG && console.log('Booking saved', result);
        } else {
          let result = this.db.updateBooking(id, fields);
          DEBUG && console.log('Booking updated', result);
        }
        break;

      case 'companies':
        if (!this.db.getCompanyById(id)) {
          let result = this.db.saveCompany(id, fields);
          DEBUG && console.log('Company saved', result);
        } else {
          let result = this.db.updateCompany(id, fields);
          DEBUG && console.log('Company updated', result);
        }
        break;

      case 'properties':
        if (!this.db.getPropertyById(id)) {
          let result = this.db.saveProperty(id, fields);
          DEBUG && console.log('Property saved', result);
        } else {
          let result = this.db.updateProperty(id, fields);
          DEBUG && console.log('Property updated', result);
        }
        break;

      case 'rooms':
        if (!this.db.getRoomById(id)) {
          let result = this.db.saveRoom(id, fields);
          DEBUG && console.log('Room saved', result);
        } else {
          let result = this.db.updateRoom(id, fields);
          DEBUG && console.log('Room updated', result);
        }
        break;

      default:
        DEBUG && console.log('_handleAddedEvent unhandled collection:', collection);
    }
  }




  _handleChangedEvent(message) {
    let { id, fields, cleared, collection } = message;

    DEBUG && console.log(`[CHANGED] ${collection} ${id}`);

    if (!this._shouldUpdateDb()) { return; }

    switch (collection) {
      case 'users': {
        let result = this.db.updateUser(id, fields, cleared);
        DEBUG && console.log('User data updated', result);
        break;
      }

      case 'bookings': {
        let result = this.db.updateBooking(id, fields, cleared);
        DEBUG && console.log('Booking upadted', result);
        break;
      }

      case 'companies': {
        let result = this.db.updateCompany(id, fields, cleared);
        DEBUG && console.log('Company upadted', result);
        break;
      }

      case 'properties': {
        let result = this.db.updateProperty(id, fields, cleared);
        DEBUG && console.log('Property upadted', result);
        break;
      }

      case 'rooms': {
        let result = this.db.updateRoom(id, fields, cleared);
        DEBUG && console.log('Room upadted', result);
        break;
      }

      default:
        DEBUG && console.log('_handleChangedEvent unhandled collection:', collection);
    }
  }




  _handleRemovedEvent(message) {
    let { id, collection } = message;

    DEBUG && console.log(`[REMOVED] ${collection} ${id}`);

    if (!this._shouldUpdateDb()) { return; }

    switch (collection) {
      case 'users':
        break;

      case 'bookings': {
        let result = this.db.deleteBookingById(id);
        DEBUG && console.log('Booking removed', result);
        break;
      }

      case 'companies': {
        let result = this.db.deleteCompanyById(id);
        DEBUG && console.log('Company removed', result);
        break;
      }

      case 'properties': {
        let result = this.db.deletePropertyById(id);
        DEBUG && console.log('Property removed', result);
        break;
      }

      case 'rooms': {
        let result = this.db.deleteRoomById(id);
        DEBUG && console.log('Room removed', result);
        break;
      }

      default:
        DEBUG && console.log('_handleRemovedEvent unhandled collection:', collection);
    }
  }




  _handleReadyEvent(message) {
    let { subs } = message;

    DEBUG && console.log(`[subscribing] ${this.subscribing}`);
    DEBUG && console.log(`[READY] ${subs}`);

    subs && subs.forEach(subId => {
      let subIndex = this.subscribing.findIndex(item => item === subId);
      if (subIndex !== -1) {
        this.subscribing.splice(subIndex, 1);
      }
    });

    DEBUG && console.log(`[subscribing] ${this.subscribing}`);
  }




  _handleNosubEvent(message) {
    let subId = message.id;

    DEBUG && console.log(`[Unsubscribing] ${this.unsubscribing}`);
    DEBUG && console.log(`[NOSUB] ${subId}`);

    let subIndex = this.unsubscribing.findIndex(item => item === subId);
    if (subIndex !== -1) {
      this.unsubscribing.splice(subIndex, 1);
    }

    DEBUG && console.log(`[Unsubscribing] ${this.unsubscribing}`);
  }




  _isSubscribing() {
    return Boolean(this.subscribing.length);
  }




  _isUnsubscribing() {
    return Boolean(this.unsubscribing.length);
  }




  _shouldUpdateDb() {
    return !(this._isSubscribing() || this._isUnsubscribing());
  }

}


export default DdpObserver;
