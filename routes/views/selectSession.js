'use strict';

const keystone = require('keystone');

exports = module.exports = function(req, res) {

  const Session = keystone.list('Session');

  const view = new keystone.View(req, res);
  const locals = res.locals;

  locals.reactData.app.view = 'selectSession';
  locals.reactData.view.sessions = [];
  locals.reactData.view.showLanguage = false;
  locals.reactData.view.showAssistants = false;

  Session.model.getSessionsToday(locals.course, function(err, sessions) {

    if (sessions) {
      sessions.forEach(function(session) {

        const sess = session.toJSON();
        sess.id = session._id.toString();
        sess.status = '';
        sess.location = session.getAllVisibleLocations(locals.course).join(', ');

        // CSS class
        if (session.isOpen()) {
          sess.status = 'success';
        } else if (session.isOpening()) {
          sess.status = 'session-starting';
        }

        locals.reactData.view.showLanguage = locals.reactData.view.showLanguage || session.getItemAsList('language').length > 0;
        locals.reactData.view.showAssistants = locals.reactData.view.showAssistants || session.getItemAsList('assistants').length > 0;

        locals.reactData.view.sessions.push(sess);

      });
    }

    if (err) {
      req.flash('error', 'alert-getting-sessions-failed');
    }

    view.render('reactView', locals);

  });

};
