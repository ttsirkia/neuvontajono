var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('routes', keystone.security.csrf.middleware.init);
keystone.pre('routes', middleware.CSRFValidate);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {views: importRoutes('./views')};

keystone.set('404', 'errors/404');
keystone.set('500', middleware.handle500);

// Setup Route Bindings
exports = module.exports = function(app) {

  // Views

  // For all
  app.all('/', routes.views.index);
  app.post('/login/lti', routes.views.loginLTI);

  // For all after course is selected
  app.all('/queue', middleware.requireCourse, routes.views.queue);
  app.all('/statistics', middleware.requireCourse, routes.views.statistics);
  app.all('/sessions', middleware.requireCourse, routes.views.sessions);

  // For staff
  app.all('/selectSession', middleware.requireStaff, routes.views.selectSession);
  app.all('/sessions/:sessionId/manage', middleware.requireStaff, routes.views.manageQueue);

  // For teacher
  app.all('/settings', middleware.requireTeacher, routes.views.settings);
  app.all('/sessions/:sessionId/edit', middleware.requireTeacher, routes.views.modifySession);
  app.all('/sessions/create', middleware.requireTeacher, routes.views.modifySession);

};
