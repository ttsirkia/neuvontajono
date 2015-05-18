var keystone = require('keystone');
var findOrCreate = require('mongoose-findorcreate');
var momentJS = require('moment');

var Types = keystone.Field.Types;
var Session = new keystone.List('Session');

// **********************************************************************************************

Session.add({name: {type: Types.Text, initial: true, required: true},
  course: {type: Types.Relationship, initial: true, required: true, ref: 'Course'},
  startDate: {type: Types.Date, initial: true, required: true, format: 'D.M.YYYY', parseFormat: 'D.M.YYYY'},
  endDate: {type: Types.Date, initial: true, required: true, format: 'D.M.YYYY', parseFormat: 'D.M.YYYY'},
  startTime: {type: Types.Number, initial: true, required: true, min: 0, max: 1439},
  endTime: {type: Types.Number, initial: true, required: true, min: 0, max: 1439},
  queueOpenTime: {type: Types.Number, initial: true, required: true, min: 0, max: 1439},
  weekday: {type: Types.Number, initial: true, required: true, min: 0, max: 6},
  location: {type: Types.Text, initial: true, required: true}, active: {type: Types.Boolean, 'default': true},
  assistants: {type: Types.Text, initial: true, 'default': ''}});

// **********************************************************************************************
// Converts minutes to time string (930 => 15:30) and vice versa

var intToTimeString = function(value) {
  var hour = Math.floor(value / 60);
  var min = '0' + value % 60;
  return hour + ':' + min.slice(-2);
};

var timeStringToInt = function(value) {
  var moment = momentJS(value, 'H:mm');
  if (moment.isValid) {
    return moment.hour() * 60 + moment.minute();
  } else {
    return null;
  }
};

Session.schema.virtual('startTimeString').get(function() {
  return intToTimeString(this.startTime);
});

Session.schema.virtual('queueOpenTimeString').get(function() {
  return intToTimeString(this.queueOpenTime);
});

Session.schema.virtual('endTimeString').get(function() {
  return intToTimeString(this.endTime);
});

Session.schema.virtual('startTimeString').set(function(time) {
  this.startTime = timeStringToInt(time);
});

Session.schema.virtual('queueOpenTimeString').set(function(time) {
  this.queueOpenTime = timeStringToInt(time);
});

Session.schema.virtual('endTimeString').set(function(time) {
  this.endTime = timeStringToInt(time);
});

// ************************************************************************************************

Session.schema.virtual('weekdayString').get(function() {
  var weekdays = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
  return weekdays[this.weekday];
});

// ************************************************************************************************
// Helper methods

Session.schema.method('getDatespan', function() {
  return this._.startDate.format() + ' - ' + this._.endDate.format();
});

Session.schema.method('getTimespan', function() {
  return this.startTimeString + ' - ' + this.endTimeString;
});

Session.schema.method('getQueueLength', function(course, callback) {
  var Queue = keystone.list('Queue');
  Queue.model.getQueueLength(course, this, callback);
});

Session.schema.method('getLocationsAsList', function() {

  var locations = this.location.split(',').map(function(item) {
    return item.trim();
  });

  return locations;

});

// ************************************************************************************************

Session.schema.static('getSessionsToday', function(course, callback) {

  var weekday = new Date().getDay();
  var now = new Date();
  var today = momentJS().startOf('day').toDate();

  Session.model.find(
      {course: course._id, weekday: weekday, active: true, startDate: {$lte: now}, endDate: {$gte: today}}).sort(
      {weekday: 'asc', startTime: 'asc'}).exec(callback);

});

// ************************************************************************************************

Session.schema.static('getCurrentSessions', function(course, callback) {

  var weekday = new Date().getDay();
  var today = new Date();
  var minutes = new Date().getHours() * 60 + new Date().getMinutes();

  Session.model.find(
      {course: course._id, weekday: weekday, active: true, queueOpenTime: {$lte: minutes}, endTime: {$gt: minutes},
        startDate: {$lte: today}, endDate: {$gte: today}}).sort({weekday: 'asc', startTime: 'asc'}).exec(callback);

});

// ************************************************************************************************

Session.schema.pre('save', function(next) {

  // a,b , c => a, b, c
  var tidy = function(value) {
    if (value) {
      var parts = value.split(',');
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

  var result = this.endDate < this.startDate || this.endTime <= this.startTime || this.startTime < this.queueOpenTime;

  if (result) {
    next(new Error('Validation failed'));
  } else {
    next();
  }

});

// ************************************************************************************************

Session.schema.plugin(findOrCreate);
Session.register();
