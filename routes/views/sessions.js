'use strict';

const keystone = require('keystone');
const moment = require('moment');

exports = module.exports = function(req, res) {

  const Session = keystone.list('Session');

  const view = new keystone.View(req, res);
  const locals = res.locals;

  locals.reactData.app.view = 'sessions';
  locals.reactData.view.sessions = [];
  locals.reactData.view.today = new Date().getDay();
  locals.reactData.view.isTeacher = locals.teacher === true;
  locals.reactData.view.showLanguage = false;
  locals.reactData.view.showAssistants = false;
  locals.reactData.view.url = locals.course.url;

  view.on('init', function(next) {

    const weekday = moment().day();
    const today = moment().startOf('day').toDate();
    const endOfWeek = moment().startOf('isoWeek').add(7, 'd').toDate();

    const query = {
      active: true,
      course: locals.course._id,
      startDate: { $lt: endOfWeek },
      endDate: { $gte: today }
    };
    Session.model.find(query).sort({ weekday: 'asc', startTime: 'asc' }).exec(function(err, sessions) {

      if (sessions) {
        sessions.forEach(function(session) {
          const sess = session.toJSON();
          sess.id = session._id.toString();
          sess.today = weekday === session.weekday;
          locals.reactData.view.showLanguage = locals.reactData.view.showLanguage || session.getItemAsList('language').length > 0;
          locals.reactData.view.showAssistants = locals.reactData.view.showAssistants || session.getItemAsList('assistants').length > 0;
          locals.reactData.view.sessions.push(sess);
        });
      }

      if (err) {
        req.flash('error', 'alert-getting-sessions-failed');
      }

      next();

    });

  });

  view.render('reactView', locals);

};
