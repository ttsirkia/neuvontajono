var keystone = require('keystone');
var findOrCreate = require('mongoose-findorcreate');
var moment = require('moment');

var Types = keystone.Field.Types;
var Participant = new keystone.List('Participant');

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
  var minutes = new Date().getHours() * 60 + new Date().getMinutes();
  var today = moment(new Date()).startOf('day');

  Participant.model.findOrCreate({ user: userId, session: session._id, course: course._id, date: today }, { enteredAt: [] }, function(err, res) {

    // If this fails, we don't care

    if (res) {
      res.enteredAt.push(minutes);
      res.save();
    }
  });

});

// ************************************************************************************************

Participant.schema.static('getMostFrequentUsers', function(course, cb) {

  var User = keystone.list('User');
  var users = {};

  Participant.model.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: '$user', c: { $sum: 1 } } },
      { $sort: { c: -1 } }
    ],
    function(err, aggregateResult) {
      if (err) {
        return cb(err, null);
      } else {
        var userList = [];

        aggregateResult.forEach(function(row) {
          userList.push(row._id);
        });

        User.model.find({_id: {$in: userList}}).exec(function(err, result) {
          if (result) {
            result.forEach(function(user) {
              users[user._id] = user.name.full;
            });

            var participants = [];
            var i = 1;
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
