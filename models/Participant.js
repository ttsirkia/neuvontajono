'use strict';

const keystone = require('keystone');
const findOrCreate = require('mongoose-findorcreate');
const moment = require('moment');

const Types = keystone.Field.Types;
const Participant = new keystone.List('Participant');

// ************************************************************************************************

Participant.add({
  user: { type: Types.Relationship, initial: true, required: true, ref: 'User' },
  course: { type: Types.Relationship, initial: true, required: true, ref: 'Course' },
  session: { type: Types.Relationship, initial: true, required: true, ref: 'Session' },
  date: { type: Types.Date, required: true, 'default': Date.now },
  locations: { type: Types.TextArray },
  enteredAt: { type: Types.NumberArray }
});

// ************************************************************************************************

Participant.schema.static('addParticipant', function(course, session, userId, location, signUp, cb) {
  const minutes = new Date().getHours() * 60 + new Date().getMinutes();
  const today = moment(new Date()).startOf('day');

  if (course.statisticsLevel < 0) {
    return;
  }

  Participant.model.findOrCreate({ user: userId, session: session._id, course: course._id, date: today }, {}, function(err, res) {

    // If this fails, we don't care

    if (res) {
      // Direct push fails in Mongoose ($pushAll removed)
      if (!signUp) {
        const newEnteredAt = res.enteredAt.slice(0);
        newEnteredAt.push(minutes);
        res.enteredAt = newEnteredAt;
      }

      const newLocations = res.locations.slice(0);
      if (newLocations.indexOf(location) < 0) {
        newLocations.push(location);
      }
      res.locations = newLocations;

      res.save(function() {
        if (cb) {
          cb();
        }
      });
    }
  });

});

// ************************************************************************************************

Participant.schema.static('hasSignedUp', function(course, session, userId, location, cb) {
  const today = moment(new Date()).startOf('day');

  Participant.model.findOne({ user: userId, session: session._id, course: course._id, date: today }, function(err, res) {
    return cb(!err && res !== null && res.locations && res.locations.indexOf(location) >= 0);
  });

});

// ************************************************************************************************

Participant.schema.static('getParticipants', function(course, session, date, cb) {

  Participant.model.find({ session: session, course: course, date: {$gte: moment(date).startOf('day'), $lt: moment(date).startOf('day').add(1, 'd')} }).populate('user').exec(function(err, res) {
    const participants = [];
    if (!err) {
      res.forEach(function(r) {
        participants.push({
          name: r.user.name,
          locations: r.locations
        });
      });
    }
    return cb(participants);
  });

});

// ************************************************************************************************

Participant.schema.static('getMostFrequentUsers', function(course, cb) {

  const User = keystone.list('User');
  const users = {};

  Participant.model.aggregate([
    { $match: { course: course._id } },
    { $group: { _id: '$user', c: { $sum: 1 } } },
    { $sort: { c: -1 } }
  ],
    function(err, aggregateResult) {
      if (err) {
        return cb(err, null);
      } else {
        const userList = [];

        aggregateResult.forEach(function(row) {
          userList.push(row._id);
        });

        User.model.find({ _id: { $in: userList } }).exec(function(err, result) {
          if (result) {
            result.forEach(function(user) {
              users[user._id] = user.name.full;
            });

            const participants = [];
            let i = 1;
            aggregateResult.forEach(function(row) {
              participants.push([i, users[row._id], row.c]);
              i += 1;
            });

            cb(null, participants);

          }
        });

      }
    });

});

// ************************************************************************************************

Participant.schema.index({ course: 1, user: 1 });

Participant.schema.plugin(findOrCreate);
Participant.register();
