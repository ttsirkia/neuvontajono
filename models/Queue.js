var keystone = require('keystone');
var socketHandler = require('../sockets/socket.js');
var findOrCreate = require('mongoose-findorcreate');
var moment = require('moment');

var Types = keystone.Field.Types;
var Queue = new keystone.List('Queue');

// **********************************************************************************************

Queue.add({user: {type: Types.Relationship, initial: true, required: true, ref: 'User'},
  course: {type: Types.Relationship, initial: true, required: true, ref: 'Course'},
  session: {type: Types.Relationship, initial: true, required: true, ref: 'Session'},
  location: {type: Types.Text, initial: true, required: true},
  row: {type: Types.Number, initial: true, required: true},
  enteredAt: {type: Types.Datetime, initial: true, required: true, 'default': Date.now}});

// **********************************************************************************************

Queue.schema.static('getUsersInQueue', function(course, session, callback) {

  var cleanLimit = moment().subtract(5, 'h').toDate();

  // Clean first possible old users away
  Queue.model.remove({course: course._id, enteredAt: {$lt: cleanLimit}}, function(err, result) {

    // Users are in the same session or the same location (no need to change
    // session if the location remains the same)
    Queue.model.find(
        {course: course._id, $or: [{session: session._id}, {location: {$in: session.getLocationsAsList()}}]}).sort(
        'enteredAt').populate('user', 'name').exec(function(err, users) {

      if (users) {

        // Transform the timestamp into a formatted string
        users = users.map(function(item) {
          var JSONItem = item.toJSON();
          JSONItem.enteredAt = item._.enteredAt.format('H:mm');
          return JSONItem;
        });

      }

      callback(err, users);

    });

  });

});

// **********************************************************************************************

Queue.schema.static('getQueueLength', function(course, session, callback) {

  Queue.model
      .find({course: course._id, $or: [{session: session._id}, {location: {$in: session.getLocationsAsList()}}]})
      .count().exec(function(err, count) {

        callback(err, count);

      });

});

// **********************************************************************************************

Queue.schema.static('addToQueue', function(course, session, user, location, row, callback) {

  user.previousRow = row;
  user.previousLocation = location;
  user.save();

  Queue.model.findOrCreate({course: course._id, user: user._id}, {session: session._id, location: location, row: row},
      function(err, result, created) {

        var sockets = function(session, location) {
          Queue.model.getUsersInQueue(course, session, function(err, users) {
            socketHandler.sendQueueStaffStatus(course._id, location, {users: users});
          });
          socketHandler.sendUserStatus(course);
        };

        if (!created) {

          // Already in queue, update session, location and row
          var oldSession = result.session;
          var oldLocation = result.location;

          result.session = session._id;
          result.location = location;
          result.row = row;
          result.save(function(err) {
            callback(err, result);

            var Session = keystone.list('Session');
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
        var Participant = keystone.list('Participant');
        Participant.model.addParticipant(course, session, user._id);

      });

});

// **********************************************************************************************

Queue.schema.static('clearQueue', function(course, session, callback) {

  Queue.model.remove(
      {course: course._id, $or: [{session: session._id}, {location: {$in: session.getLocationsAsList()}}]}).exec(
      function(err, result) {

        callback(err, result);

        if (!err) {
          Queue.model.getUsersInQueue(course, session, function(err, users) {
            session.getLocationsAsList().forEach(function(location) {
              socketHandler.sendQueueStaffStatus(course._id, location, {users: users});
            });
          });
        }

        socketHandler.sendUserStatus(course);

      });

});

// **********************************************************************************************

Queue.schema.static('removeFromQueue', function(course, session, queueId, callback) {

  Queue.model.findOneAndRemove({course: course._id, _id: queueId}).exec(function(err, result) {

    callback(err, result);

    if (result) {

      var Session = keystone.list('Session');
      Session.model.getCurrentSessions(course, function(err, sessions) {
        
        var selected = null;
        var saved = false;
        
        sessions.forEach(function(curSession) {

          var foundCorrect = curSession._id == session._id;
          var foundInSameLocation = selected == null && curSession.getLocationsAsList().indexOf(result.location) >= 0;
          if (foundCorrect || foundInSameLocation) {
            selected = curSession;
          }

          // User did not get assistance in the session in which originally
          // entered => participant in two sessions
          if (selected && selected._id != result && !saved) {
            var Participant = keystone.list('Participant');
            Participant.model.addParticipant(course, selected, result.user);
            saved = true;
          }

        });
      });

      Queue.model.getUsersInQueue(course, session, function(err, users) {
        socketHandler.sendQueueStaffStatus(course._id, result.location, {users: users});
      });
    }

    socketHandler.sendUserStatus(course);

  });

});

// **********************************************************************************************

Queue.schema.static('removeUser', function(course, user, callback) {

  Queue.model.findOneAndRemove({course: course._id, user: user._id}).populate('session').exec(function(err, result) {

    callback(err, result);

    if (result) {
      Queue.model.getUsersInQueue(course, result.session, function(err, users) {
        socketHandler.sendQueueStaffStatus(course._id, result.location, {users: users});
      });
    }

    socketHandler.sendUserStatus(course);

  });

});

// **********************************************************************************************

Queue.schema.static('getUserPosition', function(course, user, callback) {

  Queue.model.findOne({course: course._id, user: user._id}).exec(
      function(err, queue) {

        if (err) {
          callback(err, 0, null);
        } else if (queue) {

          Queue.model.find(
              {$or: [{session: queue.session}, {location: queue.location}], enteredAt: {$lte: queue.enteredAt}})
              .count().exec(function(err, position) {

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
