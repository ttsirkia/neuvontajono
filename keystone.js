require('dotenv').load();
var keystone = require('keystone'), swig = require('swig'), moment = require('moment');

// Disable swig's bulit-in template caching, express handles it
swig.setDefaults({
  cache : false
});

keystone.init({

  'name' : 'Neuvontajono',
  'brand' : 'Neuvontajono',

  'less' : 'public',
  'static' : 'public',
  'favicon' : 'public/favicon.ico',
  'views' : 'templates/views',
  'view engine' : 'swig',

  'custom engine' : swig.renderFile,

  'auto update' : true,
  'session' : true,
  'session store': 'connect-mongo',
  'auth' : true,
  'user model' : 'User',
  'trust proxy' : true,
  'cookie secret' : 'd">os.P%$2>Qs+>4LlT5M87[(burD,]%"{o{JLrid`m"r]oi^:^BbTHV5tTMk>~!',

  // Change these!
  'lti key' : 'neuvontajono',
  'lti secret' : 'neuvontajono'
});

keystone.import('models');

keystone.set('locals', {
  _ : require('underscore'),
  env : keystone.get('env'),
  utils : keystone.utils
});

keystone.set('routes', require('./routes/routes.js'));

keystone.start({
  onHttpServerCreated : function() {

    var Queue = keystone.list('Queue');

    // Clean first possible old users away
    var cleanLimit = moment().subtract(5, 'h').toDate();
    Queue.model.remove({enteredAt: {$lt: cleanLimit}}, function() {
    });

    var io = require('socket.io');
    var socketHandler = require('./sockets/socket');

    // Initialize sockets

    io = io.listen(keystone.httpServer);

    // Attach session to incoming socket
    io.use(function(socket, next) {
      keystone.get('express session')(socket.request, socket.request.res, next);
    });

    socketHandler.initialize(io);

  }
});
