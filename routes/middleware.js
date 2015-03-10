var keystone = require('keystone');
var _ = require('underscore');
var Course = keystone.list('Course');

// ************************************************************************************************

exports.initLocals = function(req, res, next) {

  var locals = res.locals;
  locals.user = req.user;

  if (locals.user) {
    locals.teacher = req.session.teacher || locals.user.isAdmin;
    locals.staff = req.session.staff || locals.user.isAdmin;
  }

  // Attach Course object to req
  if (req.session.userId && req.session.courseId) {
    Course.model.findById(req.session.courseId).exec(function(err, course) {
      if (course) {
        locals.course = course;
      }
      next();
    });
  } else {
    next();
  }

};

// ************************************************************************************************

exports.flashMessages = function(req, res, next) {

  var flashMessages = {info: req.flash('info'), success: req.flash('success'), warning: req.flash('warning'),
    error: req.flash('error')};

  res.locals.messages = _.any(flashMessages, function(msgs) {
    return msgs.length;
  }) ? flashMessages : false;

  next();

};

// ************************************************************************************************

exports.requireUser = function(req, res, next) {
  if (!req.user) {
    if (!req.xhr) {
      req.flash('error', 'Et ole kirjautunut sisään.');
      res.redirect('/neuvontajono');
    } else {
      res.json({error: true});
    }
  } else {
    next();
  }
};

// ************************************************************************************************

exports.requireCourse = function(req, res, next) {
  if (!req.user || !res.locals.course) {
    if (!req.xhr) {
      req.flash('error', 'Et ole kirjautunut kurssille.');
      res.redirect('/neuvontajono');
    } else {
      res.json({error: true});
    }
  } else {
    next();
  }
};

// ************************************************************************************************

exports.requireStaff = function(req, res, next) {
  if (!req.user || !res.locals.course || !req.session.staff) {
    if (!req.xhr) {
      req.flash('error', 'Et ole henkilökuntaa.');
      res.redirect('/neuvontajono');
    } else {
      res.json({error: true});
    }
  } else {
    next();
  }
};

// ************************************************************************************************

exports.requireTeacher = function(req, res, next) {
  if (!req.user || !res.locals.course || !req.session.teacher) {
    if (!req.xhr) {
      req.flash('error', 'Et ole opettaja.');
      res.redirect('/neuvontajono');
    } else {
      res.json({error: true});
    }
  } else {
    next();
  }
};

// ************************************************************************************************

exports.handle500 = function(err, req, res, next) {

  var locals = {};

  if ((res.locals && res.locals.user && res.locals.user.isAdmin) || keystone.get('env') === 'development') {

    // Adapted from the original error handler
    if (err instanceof Error) {
      locals.error = err.message;
      if (err.stack) {
        locals.stacktrace = err.stack;
      }
    } else if ('object' === typeof err) {
      locals.error = JSON.stringify(err);
    } else if (err) {
      locals.error = err;
    }
  }

  if (res.statusCode != 403 && res.statusCode != 500) {
    res.status(500);
  }

  locals.statusCode = res.statusCode;

  if (req.xhr) {
    res.json({error: true});
  } else {
    res.render('errors/500.swig', locals);
  }

};

// ************************************************************************************************

exports.CSRFValidate = function(req, res, next) {
  // LTI is ignored, remember Nginx rewrite here
  if (req.path == '/login/lti') {
    next();
  } else {
    keystone.security.csrf.middleware.validate(req, res, next);
  }
};
