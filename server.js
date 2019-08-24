'use strict';

require('dotenv').config();

const keystone = require('keystone');
const cons = require('consolidate');

keystone.init({

  'name': 'Neuvontajono',
  'brand': 'Neuvontajono',

  'static': 'public',
  'favicon': 'public/favicon.ico',
  'views': 'templates',
  'view engine': '.njk',
  'custom engine': cons.nunjucks,
  'auto update': true,
  'session': true,
  'session store': 'connect-mongo',
  'auth': true,
  'user model': 'User',
  'trust proxy': true,
  'port': process.env.PORT || 3002,
  'unix socket': process.env.UNIX_SOCKET || '',
  'session options': {
    'key': 'neuvontajono.sid'
  },
  'languages available': ['fi', 'en'],
  'default language': process.env.DEFAULT_LANGUAGE || 'fi',

  // Define these environment variables or change default values!
  'lti key': process.env.LTI_KEY || 'neuvontajono',
  'lti secret': process.env.LTI_SECRET || 'neuvontajono',
  'cookie secret': process.env.COOKIE_SECRET || 'secret',

  // Change also the default admin password in /updates/0.0.1-admins.js

});

keystone.import('models');

keystone.set('locals', {
  _: require('lodash'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable
});

keystone.set('routes', require('./routes/routes.js'));

const socketHandler = function() {

  const Queue = keystone.list('Queue');
  const SessionStats = keystone.list('SessionStats');
  const moment = require('moment');

  // Clean first possible old users away
  const cleanLimit = moment().subtract(5, 'h').toDate();
  Queue.model.remove({ enteredAt: { $lt: cleanLimit } }, function() {});

  let io = require('socket.io');
  const socketHandler = require('./sockets/socket');

  // Initialize sockets

  io = io.listen(keystone.httpServer);

  // Attach session to incoming socket
  io.use(function(socket, next) {
    keystone.expressSession(socket.request, socket.request.res, next);
  });

  socketHandler.initialize(io);

  // Start statistics
  setInterval(function() {
    SessionStats.model.saveQueueLengths();
  }, 30000);

};

keystone.start({
  onHttpServerCreated: socketHandler,
  onSocketServerCreated: socketHandler
});
