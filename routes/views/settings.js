var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var Course = keystone.list('Course');
  var Session = keystone.list('Session');

  var view = new keystone.View(req, res);
  var locals = res.locals;

  locals.formData = locals.course;
  locals.sessions = [];

  locals.formDataJSON = {statisticsLevel: locals.course.statisticsLevel};
  locals.formDataJSON = JSON.stringify(locals.formData);

  // **********************************************************************************************

  view.on('render', function(next) {

    Session.model.find({course: locals.course._id}).sort({weekday: 'asc', startTime: 'asc'}).exec(
        function(err, sessions) {

          if (sessions) {
            sessions.forEach(function(session) {
              var sess = session.toJSON();
              var queueOpen = '';

              if (session.queueOpenTime < session.startTime) {
                queueOpen = '(' + session.queueOpenTimeString + ') - ';
              }

              sess.id = session._id.toString();
              sess.datespan = session.getDatespan();
              sess.timespan = session.weekdayString + ' ' + queueOpen + session.getTimespan();
              locals.sessions.push(sess);
            });
          }

          next();
        });

  });

  // **********************************************************************************************

  view.on('post', {'action': 'saveSettings'}, function(next) {

    locals.formData = req.body;
    locals.formDataJSON = {statisticsLevel: req.body.statisticsLevel};
    locals.formDataJSON = JSON.stringify(locals.formData);

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
            req.flash('success', 'Kurssin asetukset on tallennettu.');

          } else {
            req.flash('error', 'Kurssin asetusten tallentaminen ei onnistunut.');
          }

          next();

        });

      } else {
        req.flash('error', 'Kurssin asetusten tallentaminen ei onnistunut.');
        next();
      }

    });

  });

  // **********************************************************************************************

  view.on('post', {'action': 'remove'}, function(next) {
    Session.model.findOneAndRemove({course: locals.course._id, _id: req.body.sessionId}, function(err, session) {
      if (session) {
        req.flash('success', 'Harjoitusryhmä on poistettu.');
      } else {
        req.flash('error', 'Harjoitusryhmän poistaminen ei onnistunut.');
      }
      next();
    });
  });

  // **********************************************************************************************

  view.on('post', {'action': 'disableAll'}, function(next) {
    Session.model.update({course: locals.course}, {active: false}, {multi: true}, function(err, result) {
      if (!err) {
        req.flash('success', 'Harjoitusryhmät on poistettu käytöstä.');
      } else {
        req.flash('error', 'Harjoitusryhmien poistaminen käytöstä ei onnistunut.');
      }
      next();
    });
  });

  // **********************************************************************************************

  view.on('post', {'action': 'enableAll'}, function(next) {
    Session.model.update({course: locals.course}, {active: true}, {multi: true}, function(err, session) {
      if (!err) {
        req.flash('success', 'Harjoitusryhmät on otettu käyttöön.');
      } else {
        req.flash('error', 'Harjoitusryhmien ottaminen käyttöön ei onnistunut.');
      }
      next();
    });
  });

  view.render('settings', locals);

};
