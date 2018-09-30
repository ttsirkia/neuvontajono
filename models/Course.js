'use strict';

const keystone = require('keystone');
const findOrCreate = require('mongoose-findorcreate');

const Types = keystone.Field.Types;
const Course = new keystone.List('Course');

// ************************************************************************************************

Course.add({
  name: { type: Types.Text, required: true, initial: true, index: true },
  courseId: { type: Types.Text, required: true, initial: true, index: true },
  url: { type: Types.Url },
  adhoc: { type: Types.Boolean, 'default': false },
  combined: { type: Types.Text },
  projectorConf: { type: Types.Text },
  defaultLanguage: { type: Types.Text },
  createdBy: { type: Types.Relationship, ref: 'User' },
  createdAt: { type: Types.Datetime, 'default': Date.now },
  statisticsLevel: { type: Types.Number, required: true, 'default': 0 },
  statisticsQueueLevel: { type: Types.Number, required: true, 'default': 2 },
  statisticsGraphLevel: { type: Types.Number, required: true, 'default': 2 }
});

// ************************************************************************************************

Course.schema.method('createSummary', function(user, callback) {

  const Queue = keystone.list('Queue');
  const Session = keystone.list('Session');

  const self = this;

  const summary = {
    course: { name: self.name },
    user: { previousRow: user.previousRow, previousLocation: user.previousLocation, previousLanguage: user.previousLanguage },
    sessions: [],
    locations: []
  };

  const handleSessions = function(sessions) {

    let counter = 0;
    const convertedSessions = [];
    sessions.forEach(function(session) {

      const sess = session.toJSON();
      sess.id = session._id.toString();
      sess.language = session.getItemAsList('language');
      convertedSessions.push(sess);

      session.getQueueLength(self, function(err, count) {

        if (err) {
          callback(err, summary);
        } else {
          sess.queueLength = count;

          counter++;

          // Everything done?
          if (counter === sessions.length) {

            // A bit complicated, but maintain the original order
            convertedSessions.forEach(function(convertedSession) {
              const locations = convertedSession.location.split(',').map(function(item) {

                // Clone the original item
                const s = JSON.parse(JSON.stringify(convertedSession));

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

  const addSessions = function() {
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

Course.schema.plugin(findOrCreate);
Course.register();
