var keystone = require('keystone');
var findOrCreate = require('mongoose-findorcreate');

var Types = keystone.Field.Types;
var Course = new keystone.List('Course');

// ************************************************************************************************

Course.add({name: {type: Types.Text, required: true, initial: true, index: true},
  courseId: {type: Types.Text, required: true, initial: true, index: true}, pin: {type: Types.Number},
  url: {type: Types.Url}, adhoc: {type: Types.Boolean, 'default': false},
  combined: {type: Types.Text},
  projectorConf: {type: Types.Text},
  createdBy: {type: Types.Relationship, ref: 'User'}, createdAt: {type: Types.Datetime, 'default': Date.now},
  statisticsLevel: {type: Types.Number, required: true, 'default': 0},
  yellowLimit: {type: Types.Number, required: true, 'default': 15, min: 1},
  redLimit: {type: Types.Number, required: true, 'default': 20, min: 1}});

// ************************************************************************************************

Course.schema.method('createSummary', function(user, callback) {

  var Queue = keystone.list('Queue');
  var Session = keystone.list('Session');

  var self = this;

  var summary = {course: {name: self.name},
    user: {previousRow: user.previousRow, previousLocation: user.previousLocation}, sessions: [], locations: []};

  var handleSessions = function(sessions) {

    var counter = 0;
    var convertedSessions = [];
    sessions.forEach(function(session) {

      var sess = session.toJSON();
      sess.id = session._id.toString();
      sess.timespan = session.getTimespan();
      convertedSessions.push(sess);

      session.getQueueLength(self, function(err, count) {

        if (err) {
          callback(err, summary);
        } else {
          sess.queueLength = count;

          counter++;

          // Everything done?
          if (counter == sessions.length) {

            // A bit complicated, but maintain the original order
            convertedSessions.forEach(function(convertedSession) {
              var locations = convertedSession.location.split(',').map(function(item) {

                // Clone the original item
                var s = JSON.parse(JSON.stringify(convertedSession));

                s.location = item.trim();
                summary.sessions.push(s);
                return item.trim();

              });

              Array.prototype.push.apply(summary.locations, locations);

            });

            callback(err, summary);
          }
        }

      });

    });

    if (sessions.length === 0) {
      callback(null, summary);
    }

  };

  var addSessions = function() {
    Session.model.getCurrentSessions(self, function(err, sessions) {
      if (err) {
        callback(err, summary);
      } else {
        handleSessions(sessions);
      }
    });
  };

  Queue.model.getUserPosition(self, user, function(err, position, queue) {
    if (err) {
      callback(err, summary);
    } else {
      summary.user.position = position;
      summary.user.row = queue ? queue.row : 0;
      summary.user.location = queue ? queue.location : '';
      summary.user.sessionId = queue ? queue.session : '';
      addSessions();
    }
  });

});

// ************************************************************************************************

Course.schema.pre('validate', function(next) {

  var result = this.redLimit <= this.yellowLimit;

  if (result) {
    next(new Error('Validation failed'));
  } else {
    next();
  }

});

// ************************************************************************************************

Course.schema.plugin(findOrCreate);
Course.register();
