var keystone = require('keystone');

var socketHandler = function() {
};

// ************************************************************************************************

socketHandler.initialize = function(io) {

  var Session = keystone.list('Session');
  socketHandler.io = io;

  socketHandler.queueNsp = io.of('/queue');
  socketHandler.queueNsp.on('connection', function(socket) {

    socket.on('staffQueue', function(data) {
      if (data.sessionId && socket.request.session.staff) {

        Session.model.findOne({course: socket.request.session.courseId, _id: data.sessionId}, function(err, session) {

          if (!err && session) {
            session.location.split(',').forEach(function(location) {
              socket.join('Staff|' + location.trim() + '|' + socket.request.session.courseId);
            });

          }

        });

      }
    });

    socket.on('userQueue', function(data) {
      if (data.courseId) {
        socket.join('Users|' + socket.request.session.courseId);
      }
    });

  });

};

// ************************************************************************************************

socketHandler.sendQueueStaffStatus = function(courseId, location, status) {
  socketHandler.queueNsp.to('Staff|' + location + '|' + courseId).emit('staffQueue', status);
};

// ************************************************************************************************

socketHandler.sendUserStatus = function(course) {

  var User = keystone.list('User');

  var handleUser = function(userId, socketId) {
    User.model.findById(userId, function(err, user) {
      if (user) {
        course.createSummary(user, function(err, summary) {
          if (!err && socketHandler.queueNsp.connected.socketId) {
            socketHandler.queueNsp.connected.socketId.emit('userQueue', summary);
          }
        });
      }
    });
  };

  var iterateSockets = function(room) {
    Object.keys(room).forEach(function(socketId) {
      var userId = socketHandler.queueNsp.connected[socketId].request.session.userId;
      handleUser(userId, socketId);
    });
  };

  var room = socketHandler.queueNsp.adapter.rooms['Users|' + course._id];
  if (room) {
    iterateSockets(room);
  }
};

module.exports = socketHandler;
