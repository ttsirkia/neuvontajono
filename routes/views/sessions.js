var keystone = require('keystone');
var io = require('../../sockets/socket');
var moment = require('moment');

exports = module.exports = function(req, res) {

  var Session = keystone.list('Session');

  var view = new keystone.View(req, res);
  var locals = res.locals;

  locals.sessions = [];
  locals.today = new Date().getDay();

  var now = new Date();
  var today = moment().startOf('day').toDate();
  var endOfWeek = moment().startOf('isoWeek').add(7, 'd').toDate();

  Session.model.find({active: true, course: locals.course._id, startDate: {$lt: endOfWeek}, endDate: {$gte: today}}).sort(
      {weekday: 'asc', startTime: 'asc'}).exec(function(err, sessions) {

    if (sessions) {
      sessions.forEach(function(session) {
        var sess = session.toJSON();
        sess.id = session._id.toString();
        sess.timespan = session.getTimespan();
        sess.datespan = session.getDatespan();
        sess.weekdayString = session.weekdayString;
        locals.sessions.push(sess);
      });
    }

    if (err) {
      req.flash('error', 'Harjoitusryhmien hakeminen epäonnistui.');
    }

    view.render('sessions', locals);

  });

};
