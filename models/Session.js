'use strict';

const keystone = require('keystone');
const findOrCreate = require('mongoose-findorcreate');
const momentJS = require('moment');

const Types = keystone.Field.Types;
const Session = new keystone.List('Session');

// **********************************************************************************************

Session.add({
  name: { type: Types.Text, initial: true, required: true },
  course: { type: Types.Relationship, initial: true, required: true, ref: 'Course' },
  startDate: { type: Types.Date, initial: true, required: true, format: 'D.M.YYYY', parseFormat: 'D.M.YYYY' },
  endDate: { type: Types.Date, initial: true, required: true, format: 'D.M.YYYY', parseFormat: 'D.M.YYYY' },
  startTime: { type: Types.Number, initial: true, required: true, min: 0, max: 1439 },
  endTime: { type: Types.Number, initial: true, required: true, min: 0, max: 1439 },
  queueOpenTime: { type: Types.Number, initial: true, required: true, min: 0, max: 1439 },
  weekday: { type: Types.Number, initial: true, required: true, min: 0, max: 6 },
  location: { type: Types.Text, initial: true, required: true },
  active: { type: Types.Boolean, 'default': true },
  assistants: { type: Types.Text, initial: true, 'default': '' }
});


// ************************************************************************************************
// Helper methods


Session.schema.method('getQueueLength', function(course, callback) {
  const Queue = keystone.list('Queue');
  Queue.model.getQueueLength(course, this, callback);
});

Session.schema.method('getLocationsAsList', function() {

  const locations = this.location.split(',').map(function(item) {
    return item.trim();
  });

  return locations;

});

Session.schema.method('isOpen', function() {

  return new Date().getDay() === this.weekday && this.active &&
    momentJS().isAfter(momentJS(this.startDate).startOf('day')) &&
    momentJS().isBefore(momentJS(this.endDate).add(1, 'd').startOf('day')) &&
    momentJS().isAfter(momentJS().startOf('day').add(this.queueOpenTime, 'm')) &&
    momentJS().isBefore(momentJS().startOf('day').add(this.endTime, 'm'));

});

Session.schema.method('isOpening', function() {

  return new Date().getDay() === this.weekday && this.active &&
    momentJS().isAfter(momentJS(this.startDate).startOf('day')) &&
    momentJS().isBefore(momentJS(this.endDate).add(1, 'd').startOf('day')) &&
    momentJS().isAfter(momentJS().startOf('day').add(this.queueOpenTime - 15, 'm')) &&
    momentJS().isBefore(momentJS().startOf('day').add(this.endTime, 'm'));

});

// ************************************************************************************************

Session.schema.static('getSessionsToday', function(course, callback) {

  const weekday = new Date().getDay();
  const now = new Date();
  const today = momentJS().startOf('day').toDate();

  Session.model.find({
    course: course._id,
    weekday: weekday,
    active: true,
    startDate: { $lte: now },
    endDate: { $gte: today }
  }).sort({ weekday: 'asc', startTime: 'asc' }).exec(callback);

});

// ************************************************************************************************

Session.schema.static('getCurrentSessions', function(course, callback) {

  const weekday = new Date().getDay();
  const now = new Date();
  const minutes = new Date().getHours() * 60 + new Date().getMinutes();
  const today = momentJS().startOf('day').toDate();

  Session.model.find({
    course: course._id,
    weekday: weekday,
    active: true,
    queueOpenTime: { $lte: minutes },
    endTime: { $gt: minutes },
    startDate: { $lte: now },
    endDate: { $gte: today }
  }).sort({ weekday: 'asc', startTime: 'asc' }).exec(callback);

});

// ************************************************************************************************

Session.schema.pre('save', function(next) {

  // a,b , c => a, b, c
  const tidy = function(value) {
    if (value) {
      let parts = value.split(',');
      parts = parts.map(function(part) {
        return part.trim();
      });
      return parts.join(', ');
    } else {
      return value;
    }
  };

  this.assistants = tidy(this.assistants);
  this.location = tidy(this.location);

  next();

});

// ************************************************************************************************

Session.schema.pre('validate', function(next) {

  const result = this.endDate < this.startDate || this.endTime <= this.startTime || this.startTime < this.queueOpenTime;

  if (result) {
    next(new Error('Validation failed'));
  } else {
    next();
  }

});

// ************************************************************************************************

Session.schema.plugin(findOrCreate);
Session.register();
