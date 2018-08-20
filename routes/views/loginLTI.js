'use strict';

const keystone = require('keystone');
const lti = require('ims-lti');
const utils = keystone.utils;

exports = module.exports = function(req, res) {

  const User = keystone.list('User');
  const Course = keystone.list('Course');

  // **********************************************************************************************
  // Helper functions

  const loginOK = function() {
    res.redirect('/neuvontajono/queue');
  };

  const loginFailed = function() {
    req.flash('error', 'alert-lti-login-failed');
    res.redirect('/neuvontajono');
  };

  // Check the course and if it doesn't exist, create a new course
  const checkCourse = function(next) {

    const courseId = req.body.context_id;
    const courseName = req.body.context_title;

    if (req.session.teacher) {

      Course.model.findOrCreate({ 'courseId': courseId }, { 'name': courseName, 'createdBy': req.user._id },
        function(err, course, created) {

          if (!err && course) {

            if (created) {
              req.flash('success', 'alert-new-course-created');
            }

            req.session.courseId = course._id;
            req.course = course;
            next();

          } else {

            loginFailed();

          }

        });

    } else {

      Course.model.findOne({ 'courseId': courseId }, function(err, course) {

        if (!err && course) {

          // Is this a combined queue and we should redirect user to another course?
          if (!course.combined) {

            req.session.courseId = course._id;
            req.course = course;
            next();

          } else {

            Course.model.findOne({ 'courseId': course.combined }, function(err, course) {
              if (err || !course) {
                req.flash('error', 'alert-queue-not-in-use');
                res.redirect('/neuvontajono');
              } else {
                req.session.courseId = course._id;
                req.course = course;
                next();
              }
            });

          }

        } else if (!err && !course) {

          req.flash('error', 'alert-queue-not-in-use');
          res.redirect('/neuvontajono');

        } else {

          loginFailed();

        }

      });

    }
  };

  // Checks the user and if it doesn't exist, create a new user
  const checkUser = function(next) {

    const email = req.body.lis_person_contact_email_primary;
    const name = req.body.lis_person_name_full;
    const userId = req.body.user_id;
    const otherSystem = req.body.tool_consumer_instance_guid || '';
    const combined = otherSystem + '|' + userId;
    const newUser = { 'name.full': name, 'email': email, 'password': utils.randomString(10), 'ltiId': combined };

    User.model.findOrCreate({ 'ltiId': combined }, newUser, function(err, user) {

      if (!err && user) {
        req.session.userId = user._id;
        req.user = user;

        if (user.name.full !== name || user.email !== email) {
          user.name.full = name;
          user.email = email;
          user.save();
        }

        next();

      } else {

        loginFailed();

      }

    });
  };

  // **********************************************************************************************
  // Check the LTI request

  // This is needed because of the URL rewrite in Nginx
  req.originalUrl = '/neuvontajono/login/lti';

  const provider = new lti.Provider(keystone.get('lti key'), keystone.get('lti secret'));
  provider.valid_request(req, function(err, isValid) {

    if (isValid) {

      // Take the UI language from the launch request if defined
      // If it is form en-US, only the first part will be used

      let language = null;
      if (req.body.launch_presentation_locale) {
        language = req.body.launch_presentation_locale.split('-')[0];
      }
      if (language && keystone.get('languages available').indexOf(language) < 0) {
        language = keystone.get('default language');
      }
      req.session.uiLanguage = language || keystone.get('default language');

      checkUser(function() {
        req.session.teacher = /Instructor/.test(req.body.roles) || req.user.isAdmin;
        req.session.assistant = /TeachingAssistant|TA/.test(req.body.roles) || req.user.isAdmin;
        req.session.staff = req.session.teacher || req.session.assistant;
        checkCourse(loginOK);
      });

    } else {

      loginFailed();

    }

  });

};
