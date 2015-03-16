var keystone = require('keystone');
var findOrCreate = require('mongoose-findorcreate');
var moment = require('moment');

var Types = keystone.Field.Types;
var Participant = new keystone.List('Participant');

// ************************************************************************************************

Participant.add({user: {type: Types.Relationship, initial: true, required: true, ref: 'User'},
  course: {type: Types.Relationship, initial: true, required: true, ref: 'Course'},
  session: {type: Types.Relationship, initial: true, required: true, ref: 'Session'},
  date: {type: Types.Date, required: true, 'default': Date.now}, enteredAt: {type: Types.NumberArray}});

// ************************************************************************************************

Participant.schema.static('addParticipant', function(course, session, userId) {
  var minutes = new Date().getHours() * 60 + new Date().getMinutes();
  var today = moment(new Date()).startOf('day');

  Participant.model.findOrCreate({user: userId, session: session._id, course: course._id, date: today},
      {enteredAt: []}, function(err, res) {
        
        // If this fails, we don't care
        
        if (res) {
          res.enteredAt.push(minutes);
          res.save();
        }
      });
  
});

// ************************************************************************************************

Participant.schema.plugin(findOrCreate);
Participant.register();
