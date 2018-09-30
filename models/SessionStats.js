'use strict';

const keystone = require('keystone');
const findOrCreate = require('mongoose-findorcreate');
const moment = require('moment');

const Types = keystone.Field.Types;
const SessionStats = new keystone.List('SessionStats');

// ************************************************************************************************

SessionStats.add({
  course: { type: Types.Relationship, initial: true, required: true, ref: 'Course' },
  session: { type: Types.Relationship, initial: true, required: true, ref: 'Session' },
  date: { type: Types.Date, required: true, 'default': Date.now },
  queueDuration: { type: Types.NumberArray },
  queueLength: { type: Types.TextArray }
});

// ************************************************************************************************

SessionStats.schema.static('addQueueDuration', function(course, session, duration) {

  const today = moment(new Date()).startOf('day');

  SessionStats.model.findOrCreate({ session: session._id, course: course._id, date: today }, {}, function(err, res) {

    // If this fails, we don't care

    if (res) {
      // Direct push fails in Mongoose ($pushAll removed)
      const newArray = res.queueDuration.slice(0);
      newArray.push(duration);
      res.queueDuration = newArray;
      res.save();
    }
  });

});

// ************************************************************************************************

SessionStats.schema.static('saveQueueLengths', function() {

  const Session = keystone.list('Session');
  Session.model.getCurrentSessions(null, function(err, sessions) {
    if (!err) {
      sessions.forEach(function(session) {
        SessionStats.model.saveQueueLength(session.course, session);
      });
    }
  });

});

// ************************************************************************************************

SessionStats.schema.static('saveQueueLength', function(course, session) {

  session.getQueueLength(course, function(err, length) {

    const today = moment(new Date()).startOf('day');
    const minutes = new Date().getHours() * 60 + new Date().getMinutes();

    SessionStats.model.findOrCreate({ session: session._id, course: session.course._id, date: today }, {}, function(err2, res) {
      if (!err & !err2 && res) {
        // Direct push fails in Mongoose ($pushAll removed)
        const newArray = res.queueLength.slice(0);

        // A new data point only every two minutes but it is the maximum for the period
        if (newArray.length > 0 && +newArray[newArray.length - 1].split('|')[0] > minutes - 2) {
          const parts = newArray[newArray.length - 1].split('|');
          newArray[newArray.length - 1] = parts[0] + '|' + Math.max(+parts[1], length);
        } else {
          newArray.push(minutes + '|' + length);
        }

        res.queueLength = newArray;
        res.save();
      }
    });
  });

});

// ************************************************************************************************

SessionStats.schema.index({ session: 1, date: 1 });

SessionStats.schema.plugin(findOrCreate);
SessionStats.register();
