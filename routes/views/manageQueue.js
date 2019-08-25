'use strict';

const keystone = require('keystone');

exports = module.exports = function(req, res) {

  const Session = keystone.list('Session');
  const Queue = keystone.list('Queue');

  const view = new keystone.View(req, res);
  const locals = res.locals;
  let errors = false;

  if (/projector/.test(req.path)) {
    locals.reactData.app.view = 'manageQueueProjector';
    locals.additionalResources = `
<script src="/neuvontajono/scripts/jquery-2.2.4.min.js"></script>
<link href="/neuvontajono/styles/projector.css" rel="stylesheet">`;

  } else {
    locals.reactData.app.view = 'manageQueue';
    locals.additionalResources = '<script src="/neuvontajono/scripts/jquery-2.2.4.min.js"></script>';
  }

  locals.reactData.app.selectedTab = 'selectSession';
  locals.reactData.view.queueData = { users: [], open: false, sessionName: '' };
  locals.reactData.view.csrf = locals.csrf_token_value;

  // **********************************************************************************************
  // Helper functions

  const getUsersInQueue = function(next) {
    Queue.model.getUsersInQueue(locals.course, locals.session, function(err, usersInQueue) {

      if (err) {
        errors = true;
        return next();
      }

      Session.model.getCurrentSessions(locals.course, function(err, sessions) {

        if (sessions) {
          sessions.forEach(function(session) {
            locals.reactData.view.queueData.sessionName = session.name;
            if (session.location === locals.session.location) {
              locals.reactData.view.queueData.open = true;
              locals.reactData.view.multipleLocations = session.location.indexOf(',') >= 0;
            }
          });
        }

        if (usersInQueue) {
          locals.reactData.view.queueData.users = usersInQueue;
          next();
        }

        if (err) {
          errors = true;
          next();
        }
      });

    });
  };

  // **********************************************************************************************

  view.on('init', function(next) {

    Session.model.findOne({ course: locals.course._id, _id: req.params.sessionId }).exec(function(err, session) {
      if (session) {

        locals.session = session;
        locals.reactData.view.sessionId = session._id.toString();
        locals.reactData.view.courseId = locals.course._id.toString();
        locals.reactData.view.courseName = locals.course.name;
        locals.reactData.view.sessionLocation = session.location;
        locals.reactData.view.projectorConf = locals.course.projectorConf;
        locals.reactData.view.multipleLocations = session.location.indexOf(',') >= 0;

        next();

      } else {
        req.flash('error', 'alert-session-not-found');
        res.redirect('/neuvontajono/selectSession');
      }

    });

  });

  // **********************************************************************************************

  view.on('get', function(next) {

    getUsersInQueue(function() {
      if (!req.xhr) {
        if (errors) {
          req.flash('error', 'alert-getting-queue-failed');
        }
        next();
      } else {
        if (errors) {
          res.json({ error: true });
        } else {
          res.json(locals.reactData.view.queueData);
        }
      }
    });

  });

  // **********************************************************************************************

  view.on('post', { action: 'clear' }, function(next) {

    Queue.model.clearQueue(locals.course, locals.session, function(err) {

      if (err) {
        req.flash('error', 'alert-clearing-queue-failed');
      }

      getUsersInQueue(function() {
        next();
      });
    });

  });

  // **********************************************************************************************

  view.on('post', { action: 'remove' }, function() {

    Queue.model.removeFromQueue(locals.course, locals.session, req.body.queueId, function(err) {

      getUsersInQueue(function() {
        if (errors || err) {
          res.json({ error: true });
        } else {
          res.json(locals.reactData.view.queueData);
        }
      });
    });

  });

  // **********************************************************************************************

  view.render('reactView', locals);

};
