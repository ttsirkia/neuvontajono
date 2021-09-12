'use strict';

const keystone = require('keystone');
const socketHandler = require('../sockets/socket.js');
const findOrCreate = require('mongoose-findorcreate');
const moment = require('moment');

const Types = keystone.Field.Types;
const Queue = new keystone.List('Queue');

// **********************************************************************************************

Queue.add({
  user: { type: Types.Relationship, initial: true, required: true, ref: 'User' },
  course: { type: Types.Relationship, initial: true, required: true, ref: 'Course' },
  session: { type: Types.Relationship, initial: true, required: true, ref: 'Session' },
  location: { type: Types.Text, initial: true, required: true },
  row: { type: Types.Number, initial: true, required: true },
  enteredAt: { type: Types.Datetime, initial: true, required: true, 'default': Date.now },
  language: { type: Types.Text },
  callURL: { type: Types.Text },
});

// **********************************************************************************************

Queue.schema.static('getUsersInQueue', function(course, session, callback) {

  const cleanLimit = moment().subtract(12, 'h').toDate();

  // Clean first possible old users away
  Queue.model.remove({ course: course._id, enteredAt: { $lt: cleanLimit } }, function() {

    // Users are in the same session or the same location (no need to change
    // session if the location remains the same)
    const query = {
      course: course._id,
      $or: [
        { session: session._id },
        { location: { $in: session.getAllLocations(course) } }
      ]
    };
    Queue.model.find(query).sort('enteredAt').populate('user', 'name email').exec(function(err, users) {

      if (users) {

        // Transform the timestamp into a formatted string
        users = users.map(function(item) {
          const JSONItem = item.toJSON();
          JSONItem.enteredAt = moment(item.enteredAt).diff(moment().startOf('day'), 'minutes');
          return JSONItem;
        });

      }

      callback(err, users);

    });

  });

});

// **********************************************************************************************

Queue.schema.static('getQueueLength', function(course, session, callback) {

  const query = {
    course: course._id,
    $or: [
      { session: session._id },
      { location: { $in: session.getAllLocations(course) } }
    ]
  };
  Queue.model.find(query).count().exec(function(err, count) {
    callback(err, count);
  });

});

// **********************************************************************************************

Queue.schema.static('addToQueue', function(course, session, user, location, row, language, callURL, callback) {

  user.previousRow = row;
  user.previousLocation = location;
  if (language) {
    user.previousLanguage = language;
  }
  user.previousParticipationLocal = row >= 0;
  if (row < 0 ) {
    user.previousCallURL = callURL;
  }
  user.save();

  if (row < 0) {
    location = 'REMOTELOCATION';
  }

  Queue.model.findOrCreate({ course: course._id, user: user._id }, { session: session._id, location: location, row: row, callURL: callURL, language: language },
    function(err, result, created) {

      const sockets = function(session, location) {
        Queue.model.getUsersInQueue(course, session, function(err, users) {
          socketHandler.sendQueueStaffStatus(course._id, location, { users: users });
        });
        socketHandler.sendUserStatus(course);
      };

      if (!created) {

        // Already in queue, update session, location, and row
        const oldSession = result.session;
        const oldLocation = result.location;

        result.session = session._id;
        result.location = location;
        result.row = row;

        result.save(function(err) {
          callback(err, result);

          const Session = keystone.list('Session');
          Session.model.findById(oldSession, function(err, oldSession) {
            // Notify old and new sessions
            if (oldSession) {
              sockets(oldSession, oldLocation);
            }
            sockets(session, location);
          });

        });

      } else {
        callback(err, result);
        sockets(session, location);
      }

      // Register participant for statistics
      const Participant = keystone.list('Participant');
      Participant.model.addParticipant(course, session, user._id, location);

    });

});

// **********************************************************************************************

Queue.schema.static('clearQueue', function(course, session, callback) {

  const query = {
    course: course._id,
    $or: [{ session: session._id },
      { location: { $in: session.getAllLocations(course) } }
    ]
  };
  Queue.model.remove(query).exec(
    function(err, result) {

      callback(err, result);

      if (!err) {
        Queue.model.getUsersInQueue(course, session, function(err, users) {
          session.getAllLocations(course).forEach(function(location) {
            socketHandler.sendQueueStaffStatus(course._id, location, { users: users });
          });
        });
      }

      socketHandler.sendUserStatus(course);

    });

});

// **********************************************************************************************

Queue.schema.static('removeFromQueue', function(course, session, queueId, callback) {

  Queue.model.findOneAndRemove({ course: course._id, _id: queueId }).populate('session').exec(function(err, result) {

    if (result) {

      const Session = keystone.list('Session');
      const SessionStats = keystone.list('SessionStats');

      const duration = moment().diff(moment(result.enteredAt), 'seconds');
      SessionStats.model.addQueueDuration(course, result.session, duration);

      Session.model.getCurrentSessions(course, function(err, sessions) {

        let selected = null;
        let saved = false;
        const Participant = keystone.list('Participant');

        sessions.forEach(function(curSession) {

          const foundCorrect = curSession._id === session._id;
          const foundInSameLocation = selected === null && curSession.getAllLocations(course).indexOf(result.location) >= 0;
          if (foundCorrect || foundInSameLocation) {
            selected = curSession;
          }

          // User did not get assistance in the session in which originally
          // entered => participant in two sessions
          if (selected && selected._id !== result._id && !saved) {
            Participant.model.addParticipant(course, selected, result.user, result.location);
            saved = true;
          }

        });
      });

      Queue.model.getUsersInQueue(course, session, function(err, users) {
        socketHandler.sendQueueStaffStatus(course._id, result.location, { users: users });
      });
    }

    socketHandler.sendUserStatus(course);
    callback(err, result);

  });

});

// **********************************************************************************************

Queue.schema.static('removeUser', function(course, user, callback) {

  Queue.model.findOneAndRemove({ course: course._id, user: user._id }).populate('session').exec(function(err, result) {

    if (result) {
      Queue.model.getUsersInQueue(course, result.session, function(err, users) {
        socketHandler.sendQueueStaffStatus(course._id, result.location, { users: users });
      });
    }

    socketHandler.sendUserStatus(course);
    callback(err, result);

  });

});

// **********************************************************************************************

Queue.schema.static('getUserPosition', function(course, user, callback) {

  Queue.model.findOne({ course: course._id, user: user._id }).exec(
    function(err, queue) {

      if (err) {
        callback(err, 0, null);
      } else if (queue) {

        const query = {
          course: course._id,
          $or: [
            { session: queue.session },
            { location: queue.location }
          ],
          enteredAt: { $lte: queue.enteredAt }
        };
        Queue.model.find(query).count().exec(function(err, position) {

          if (err) {
            callback(err, 0, queue);
          } else {
            callback(err, position, queue);
          }

        });

      } else {
        callback(err, 0, null);
      }

    });

});

// **********************************************************************************************

Queue.schema.plugin(findOrCreate);
Queue.register();
