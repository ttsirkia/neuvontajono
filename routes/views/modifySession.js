var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var Session = keystone.list('Session');

  var view = new keystone.View(req, res);
  var locals = res.locals;

  locals.formData = {weekday: 1, active: true};
  locals.formDataJSON = JSON.stringify(locals.formData);

  // **********************************************************************************************

  view.on('get', function(next) {
    if (!req.params.sessionId) {
      locals.createNew = true;
      next();
    } else {
      Session.model.findOne({course: locals.course._id, _id: req.params.sessionId}).exec(function(err, session) {
        if (session) {

          locals.formData = session.toJSON();
          locals.formData.startDate = session._.startDate.format();
          locals.formData.endDate = session._.endDate.format();
          locals.formData.startTime = session.startTimeString;
          locals.formData.endTime = session.endTimeString;
          locals.formData.queueOpenTime = session.queueOpenTimeString;
          locals.formDataJSON = JSON.stringify(locals.formData);

          next();

        } else {
          req.flash('error', 'Tuntematon harjoitusryhmä.');
          res.redirect('/neuvontajono/settings');
        }
      });
    }

  });

  // **********************************************************************************************

  view.on('post', {'action': 'save'}, function(next) {

    locals.formData = req.body;
    locals.formDataJSON = JSON.stringify(req.body);

    var save = function(session, next) {

      session.name = req.body.name;
      session.weekday = req.body.weekday;
      session.location = req.body.location;
      session.assistants = req.body.assistants;

      session.startDate = session._.startDate.parse(req.body.startDate, 'D.M.YYYY');
      session.endDate = session._.endDate.parse(req.body.endDate, 'D.M.YYYY');

      // TODO: Waiting PR to be accepted
      // session._.startDate.update(req.body);
      // session._.endDate.update(req.body);

      session.startTimeString = req.body.startTime;
      session.endTimeString = req.body.endTime;
      session.queueOpenTimeString = req.body.queueOpenTime;
      session._.active.update(req.body);

      session.save(function(err) {
        if (!err) {

          req.flash('success', 'Harjoitusryhmän tiedot on tallennettu.');
          res.redirect('/neuvontajono/settings');

        } else {
          req.flash('error', 'Harjoitusryhmän tallentaminen ei onnistunut.');
          next();
        }

      });
    };

    if (req.params.sessionId) {

      Session.model.findOne({course: locals.course._id, _id: req.params.sessionId}).exec(function(err, session) {
        if (session) {

          save(session, next);

        } else {

          req.flash('error', 'Harjoitusryhmän tallentaminen ei onnistunut.');
          next();

        }

      });

    } else {

      var session = new Session.model({course: locals.course._id});

      save(session, next);

    }

  });

  // **********************************************************************************************

  view.render('modifySession', locals);

};
