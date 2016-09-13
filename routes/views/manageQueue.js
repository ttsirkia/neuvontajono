var keystone = require('keystone');
var io = require('../../sockets/socket');

exports = module.exports = function(req, res) {

  var Session = keystone.list('Session');
  var Queue = keystone.list('Queue');

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.queueData = {users: [], open: false, sessionName: ''};
  var errors = false;

  // **********************************************************************************************
  // Helper functions

  var getUsersInQueue = function(next) {
    Queue.model.getUsersInQueue(locals.course, locals.session, function(err, usersInQueue) {

      if (err) {
        errors = true;
        next();
        return;
      }

      Session.model.getCurrentSessions(locals.course, function(err, sessions) {

        if (sessions) {
          sessions.forEach(function(session) {
            locals.queueData.sessionName = session.name;
            if (session.location === locals.session.location) {
              locals.queueData.open = true;
            }
          });
        }

        if (usersInQueue) {
          locals.queueData.users = usersInQueue;
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

    Session.model.findOne({course: locals.course._id, _id: req.params.sessionId}).exec(function(err, session) {
      if (session) {

        locals.session = session;
        next();

      } else {
        req.flash('error', 'Harjoitusryhmää ei löydy.');
        res.redirect('/neuvontajono/selectSession');
      }

    });

  });

  // **********************************************************************************************

  view.on('get', function(next) {

    getUsersInQueue(function() {

      if (!req.xhr) {

        if (errors) {
          req.flash('error', 'Jonottajien hakeminen epäonnistui.');
        }

        locals.queueData = JSON.stringify(locals.queueData);
        next();

      } else {

        if (errors) {
          res.json({error: true});
        } else {
          res.json(locals.queueData);
        }

      }

    });

  });

  // **********************************************************************************************

  view.on('post', {action: 'clear'}, function(next) {

    Queue.model.clearQueue(locals.course, locals.session, function(err, result) {

      if (err) {
        req.flash('error', 'Jonon tyhjentäminen epäonnistui.');
      }

      getUsersInQueue(function() {
        locals.queueData = JSON.stringify(locals.queueData);
        next();
      });
    });

  });

  // **********************************************************************************************

  view.on('post', {action: 'remove'}, function(next) {

    Queue.model.removeFromQueue(locals.course, locals.session, req.body.queueId, function(err, result) {

      getUsersInQueue(function() {
        if (!req.xhr) {

          if (errors || err) {
            req.flash('error', 'Poistaminen epäonnistui.');
          }

          locals.queueData = JSON.stringify(locals.queueData);
          next();

        } else {

          if (errors || err) {
            res.json({error: true});
          } else {
            res.json(locals.queueData);
          }

        }
      });
    });

  });

  // **********************************************************************************************

  if (!/projector/.test(req.path)) {
    view.render('manageQueue', locals);
  } else {
    view.render('manageQueueProjector', locals);
  }

};
