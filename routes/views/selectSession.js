var keystone = require('keystone');
var io = require('../../sockets/socket');

exports = module.exports = function(req, res) {

  var Session = keystone.list('Session');

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.sessions = [];

  Session.model.getSessionsToday(locals.course, function(err, sessions) {

    if (sessions) {
      sessions.forEach(function(session) {
        var sess = session.toJSON();
        sess.id = session._id.toString();
        sess.timespan = session.getTimespan();
        sess.status = '';

        // CSS class
        if (session.isOpen()) {
          sess.status = 'success';
        } else if (session.isOpening()) {
          sess.status = 'session-starting';
        }

        locals.sessions.push(sess);

      });
    }

    if (err) {
      req.flash('error', 'Harjoitusryhmien hakeminen epäonnistui.');
    }

    view.render('selectSession', locals);

  });

};
