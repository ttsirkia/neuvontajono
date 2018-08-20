'use strict';

const keystone = require('keystone');
const moment = require('moment');

exports = module.exports = function(req, res) {

  const Course = keystone.list('Course');
  const Session = keystone.list('Session');
  const Participant = keystone.list('Participant');

  const view = new keystone.View(req, res);
  const locals = res.locals;

  locals.reactData.app.view = 'settings';

  // **********************************************************************************************

  view.on('init', function(next) {
    locals.reactData.view = {
      csrf: locals.csrf_token_value,
      course: {
        name: locals.course.name,
        combined: locals.course.combined,
        courseId: locals.course.courseId,
        url: locals.course.url,
        projectorConf: locals.course.projectorConf,
        redLimit: locals.course.redLimit,
        yellowLimit: locals.course.yellowLimit,
        statisticsLevel: locals.course.statisticsLevel
      },
      sessions: []
    };
    next();
  });

  // **********************************************************************************************

  view.on('post', { 'action': 'saveSettings' }, function(next) {

    locals.reactData.view = {
      csrf: locals.csrf_token_value,
      course: {
        name: req.body.name,
        combined: req.body.combined,
        courseId: locals.course.courseId,
        url: req.body.url,
        projectorConf: req.body.projectorConf,
        redLimit: req.body.redLimit,
        yellowLimit: req.body.yellowLimit,
        statisticsLevel: req.body.statisticsLevel
      },
      sessions: []
    };

    Course.model.findById(req.session.courseId).exec(function(err, course) {
      if (course) {

        course.name = req.body.name;
        course.url = req.body.url;
        course.statisticsLevel = req.body.statisticsLevel;
        course.yellowLimit = req.body.yellowLimit;
        course.redLimit = req.body.redLimit;
        course.combined = req.body.combined;
        course.projectorConf = req.body.projectorConf;

        course.save(function(err) {
          if (!err) {

            locals.course = course;
            locals.reactData.course.name = course.name;

            // Remove collected statistics if statistics will be disabled
            if (course.statisticsLevel === -1) {
              Participant.model.remove({course: locals.course._id}).exec(function() {

              });
            }

            req.flash('success', 'alert-settings-saved');

          } else {
            req.flash('error', 'alert-settings-save-failed');
          }

          next();

        });

      } else {
        req.flash('error', 'alert-settings-save-failed');
        next();
      }

    });

  });

  // **********************************************************************************************

  view.on('post', { 'action': 'remove' }, function(next) {
    Session.model.findOneAndRemove({ course: locals.course._id, _id: req.body.sessionId }, function(err, session) {
      if (session) {
        req.flash('success', 'alert-session-deleted');
      } else {
        req.flash('error', 'alert-session-delete-failed');
      }
      next();
    });
  });

  // **********************************************************************************************

  view.on('post', { 'action': 'disableAll' }, function(next) {
    Session.model.update({ course: locals.course }, { active: false }, { multi: true }, function(err) {
      if (!err) {
        req.flash('success', 'alert-sessions-disabled');
      } else {
        req.flash('error', 'alert-sessions-disable-failed');
      }
      next();
    });
  });

  // **********************************************************************************************

  view.on('post', { 'action': 'enableAll' }, function(next) {
    Session.model.update({ course: locals.course }, { active: true }, { multi: true }, function(err) {
      if (!err) {
        req.flash('success', 'alert-sessions-enabled');
      } else {
        req.flash('error', 'alert-sessions-enable-failed');
      }
      next();
    });
  });

  // **********************************************************************************************

  view.on({}, function(next) {

    Session.model.find({ course: locals.course._id }).sort({ weekday: 'asc', startTime: 'asc' }).exec(
      function(err, sessions) {

        if (sessions) {
          sessions.forEach(function(session) {
            var sess = session.toJSON();
            var queueOpen = '';

            if (session.queueOpenTime < session.startTime) {
              queueOpen = '(' + session.queueOpenTimeString + ') - ';
            }

            sess.id = session._id.toString();
            sess.startDate = moment(session.startDate).format('YYYY-MM-DD');
            sess.endDate = moment(session.endDate).format('YYYY-MM-DD');
            locals.reactData.view.sessions.push(sess);
          });
        }

        next();
      });

  });

  // **********************************************************************************************


  view.render('reactView', locals);

};
