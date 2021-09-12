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
  statisticsLevel: { type: Types.Number, required: true, 'default': 0, min: -1, max: 2 },
  statisticsQueueLevel: { type: Types.Number, required: true, 'default': 2, min: 0, max: 2 },
  statisticsGraphLevel: { type: Types.Number, required: true, 'default': 2, min: 0, max: 2 },
  participationPolicy: { type: Types.Number, required: true, 'default': 1, min: 1, max: 3 },
  requireSignUp: { type: Types.Boolean, 'default': false },
});

// ************************************************************************************************

Course.schema.method('createSummary', function(user, callback) {

  const Queue = keystone.list('Queue');
  const Session = keystone.list('Session');
  const Participant = keystone.list('Participant');

  const self = this;

  const summary = {
    course: { name: self.name },
    user: { previousRow: user.previousRow, previousLocation: user.previousLocation, previousLanguage: user.previousLanguage, previousParticipationLocal: user.previousParticipationLocal, previousCallURL: user.previousCallURL },
    sessions: [],
    locations: [],
    remote: false,
    local: false,
    signUpRequired: self.requireSignUp === true && self.statisticsLevel >= 0
  };

  const handleSessions = function(sessions) {

    let counter = 0;
    const convertedSessions = [];
    sessions.forEach(function(session) {

      const sess = session.toJSON();
      sess.id = session._id.toString();
      sess.language = session.getItemAsList('language');
      sess.location = session.getAllVisibleLocations(session.course);
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
              const locations = convertedSession.location.map(function(item) {

                // Clone the original item
                const s = JSON.parse(JSON.stringify(convertedSession));
                delete s.course;
                s.location = item.trim();

                if (convertedSession.participationPolicy === 1 || (convertedSession.participationPolicy === 0 && convertedSession.course.participationPolicy === 1)) {
                  s.local = true;
                  summary.local = true;
                }

                if (convertedSession.participationPolicy === 2 || (convertedSession.participationPolicy === 0 && convertedSession.course.participationPolicy === 2)) {
                  s.remote = true;
                  summary.remote = true;
                }

                if (convertedSession.participationPolicy === 3 || (convertedSession.participationPolicy === 0 && convertedSession.course.participationPolicy === 3)) {
                  summary.local = true;
                  summary.remote = true;
                  if (item.trim() === convertedSession.remoteMethod) {
                    s.remote = true;
                  } else {
                    s.local = true;
                  }
                }

                summary.sessions.push(s);
                return item.trim();

              });

              Array.prototype.push.apply(summary.locations, locations);

            });

            let sessionCounter = 0;
            summary.sessions.forEach(function(session) {
              Participant.model.hasSignedUp(self, session, user._id, session.local ? session.location : 'REMOTELOCATION', function(res) {
                session.hasSignedUp = res;
                sessionCounter++;
                console.log(res)
                if (sessionCounter === summary.sessions.length) {
                  callback(err, summary);
                }
              });
            });

            if (summary.sessions.length === 0) {
              callback(err, summary);
            }

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
