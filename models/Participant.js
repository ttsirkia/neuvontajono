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
  enteredAt: { type: Types.NumberArray }
});

// ************************************************************************************************

Participant.schema.static('addParticipant', function(course, session, userId) {
  const minutes = new Date().getHours() * 60 + new Date().getMinutes();
  const today = moment(new Date()).startOf('day');

  if (course.statisticsLevel < 0) {
    return;
  }

  Participant.model.findOrCreate({ user: userId, session: session._id, course: course._id, date: today }, {}, function(err, res) {

    // If this fails, we don't care

    if (res) {
      // Direct push fails in Mongoose ($pushAll removed)
      const newArray = res.enteredAt.slice(0);
      newArray.push(minutes);
      res.enteredAt = newArray;
      res.save();
    }
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
