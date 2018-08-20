'use strict';

const keystone = require('keystone');
const _ = require('lodash');
const Course = keystone.list('Course');

// ************************************************************************************************

exports.initLocals = function(req, res, next) {

  res.setHeader('Cache-Control', 'private');

  const locals = res.locals;
  locals.user = req.user;

  if (locals.user) {
    locals.teacher = req.session.teacher;
    locals.staff = req.session.staff;
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

exports.initReactData = function(req, res, next) {

  const locals = res.locals;

  const permissionLevels = {
    '-1': 'nobody',
    0: 'any',
    1: 'staff',
    2: 'teacher'
  };

  locals.reactData = {
    user: {},
    course: {},
    app: { language: keystone.get('default language') },
    view: {}
  };

  if (req.session && req.session.uiLanguage) {
    locals.reactData.app.language = req.session.uiLanguage;
  }

  if (locals.user) {
    locals.reactData.user.name = `${locals.user.name.first} ${locals.user.name.last}`;
    locals.reactData.user.staff = locals.staff === true;
    locals.reactData.user.teacher = locals.teacher === true;
  }

  if (locals.course) {
    locals.reactData.course.name = locals.course.name;
    locals.reactData.app.statisticsLevel = permissionLevels[locals.course.statisticsLevel];
  }

  next();

};

// ************************************************************************************************

exports.transformReactData = function(req, res, next) {

  const locals = res.locals;

  // avoid </script> tags in the JSON data
  locals.reactData = JSON.stringify(locals.reactData).replace(/</g, '\\u003c');
  next();

};

// ************************************************************************************************

exports.flashMessages = function(req, res, next) {
  const flashMessages = {
    info: req.flash('info'),
    success: req.flash('success'),
    warning: req.flash('warning'),
    error: req.flash('error'),
  };

  res.locals.reactData.app.messages = _.some(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;
  next();

};

// ************************************************************************************************

exports.requireUser = function(req, res, next) {
  if (!req.user) {
    if (!req.xhr) {
      req.flash('error', 'alert-not-logged');
      res.redirect('/neuvontajono');
    } else {
      res.json({ error: true });
    }
  } else {
    next();
  }
};

// ************************************************************************************************

exports.requireCourse = function(req, res, next) {
  if (!req.user || !res.locals.course) {
    if (!req.xhr) {
      req.flash('error', 'alert-no-course');
      res.redirect('/neuvontajono');
    } else {
      res.json({ error: true });
    }
  } else {
    next();
  }
};

// ************************************************************************************************

exports.requireStaff = function(req, res, next) {
  if (!req.user || !res.locals.course || !res.locals.staff) {
    if (!req.xhr) {
      req.flash('error', 'alert-no-staff');
      res.redirect('/neuvontajono');
    } else {
      res.json({ error: true });
    }
  } else {
    next();
  }
};

// ************************************************************************************************

exports.requireTeacher = function(req, res, next) {
  if (!req.user || !res.locals.course || !res.locals.teacher) {
    if (!req.xhr) {
      req.flash('error', 'alert-no-teacher');
      res.redirect('/neuvontajono');
    } else {
      res.json({ error: true });
    }
  } else {
    next();
  }
};

// ************************************************************************************************

exports.handle404 = function(req, res) {
  res.locals.reactData.app.view = 'error404';
  res.locals.reactData = JSON.stringify(res.locals.reactData);
  res.status(404);
  res.render('reactView', res.locals);
};

// ************************************************************************************************

exports.handle500 = function(err, req, res) {
  const locals = res.locals;

  res.locals.reactData.app.view = 'error500';

  if ((res.locals && res.locals.user && res.locals.user.isAdmin) || keystone.get('env') === 'development') {

    // Adapted from the original error handler
    if (err instanceof Error) {
      locals.reactData.view.error = err.message;
      if (err.stack) {
        locals.reactData.view.stacktrace = err.stack;
      }
    } else if ('object' === typeof err) {
      locals.reactData.view.error = JSON.stringify(err);
    } else if (err) {
      locals.reactData.view.error = err;
    }
  }

  if (res.statusCode !== 403 && res.statusCode !== 500) {
    res.status(500);
  }

  locals.reactData.view.statusCode = res.statusCode;
  res.locals.reactData = JSON.stringify(res.locals.reactData);

  if (req.xhr) {
    res.json({ error: true });
  } else {
    res.render('reactView', locals);
  }

};

// ************************************************************************************************

exports.CSRFValidate = function(req, res, next) {
  // LTI is ignored, remember Nginx rewrite here
  if (req.path === '/login/lti') {
    next();
  } else {
    keystone.security.csrf.middleware.validate(req, res, next);
  }
};
