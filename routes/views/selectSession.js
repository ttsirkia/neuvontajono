'use strict';

const keystone = require('keystone');

exports = module.exports = function(req, res) {

  const Session = keystone.list('Session');

  const view = new keystone.View(req, res);
  const locals = res.locals;

  locals.reactData.app.view = 'selectSession';
  locals.reactData.view.sessions = [];

  Session.model.getSessionsToday(locals.course, function(err, sessions) {

    if (sessions) {
      sessions.forEach(function(session) {
        
        const sess = session.toJSON();
        sess.id = session._id.toString();
        sess.status = '';

        // CSS class
        if (session.isOpen()) {
          sess.status = 'success';
        } else if (session.isOpening()) {
          sess.status = 'session-starting';
        }

        locals.reactData.view.sessions.push(sess);

      });
    }

    if (err) {
      req.flash('error', 'alert-getting-sessions-failed');
    }

    view.render('reactView', locals);

  });

};
