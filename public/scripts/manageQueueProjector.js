$(function() {

  /*
  Format for the projector configuration file (JSONP):
  
  projector({
    "course":"http://pathtocourse/course.png",
    "sessions": {"sessionA":"http://pathtocourse/sessionA.png"},
    "pictures": [{start:"2016-09-01 08:00", end:"2016-09-42 16:00", picture:"http://pathtocourse/hints.png"}]
  });

  */

  var isOpen = false;
  var sessionName = null;
  var projectorConf = null;

  var updateLayout = function() {

    document.title = 'Neuvontajono (' + koViewModel.users().length + ')';

    $('#length').text(koViewModel.users().length);

    if (koViewModel.users().length > 0) {

      var name = koViewModel.users()[0].user.name.first();
      var row = koViewModel.users()[0].row();

      if ($('#name').text() !== name || $('#row').text() != row) {
        $('#next').fadeOut('slow', function() {
          $('#name').text(name);
          $('#row').text(row);
          $('#next').fadeIn('slow');
        });
      }

    }

    if (koViewModel.users().length === 0 && $('#next').is(':visible')) {
      $('#next').fadeOut('slow', function() {
        $('#name').text('');
        $('#row').text('');
      });
    }

  };

  // **********************************************************************************************

  if (queueData.open !== undefined) {
    isOpen = queueData.open;
  }

  if (queueData.sessionName !== undefined) {
    sessionName = queueData.sessionName;
  }

  var koViewModel = ko.mapping.fromJS(queueData);
  ko.applyBindings(koViewModel);
  updateLayout();

  // **********************************************************************************************

  var socket = io.connect('/queue', { path: '/neuvontajono/socket.io', forceNew: true });

  socket.on('connect', function() {
    socket.emit('staffQueue', { 'sessionId': $('input[name="sessionId"]').val() });
  });

  socket.on('staffQueue', function(data) {
    if (data.error) {
      alert('Sivun päivittäminen epäonnistui! Yritä ladata sivu uudelleen.');
    } else {
      ko.mapping.fromJS(data, koViewModel);
      updateLayout();
    }
  });

  // **********************************************************************************************

  setInterval(function() {

    var timestamp = (new Date().getTime() / 1000).toFixed(0);
    $.getJSON("?timestamp=" + timestamp, function(data) {
      if (data.error) {
        alert('Sivun päivittäminen epäonnistui! Yritä ladata sivu uudelleen.');
      } else {

        if (data.open !== undefined) {
          isOpen = data.open;
        }
        if (data.sessionName !== undefined) {
          sessionName = data.sessionName;
        }

        ko.mapping.fromJS(data, koViewModel);
        updateLayout();
      }
    }).fail(function() {
      alert('Sivun päivittäminen epäonnistui! Yritä ladata sivu uudelleen.');
    });
  }, 20000);

  // **********************************************************************************************

  var remove = function() {

    var postData = {
      action: 'remove',
      name: 'queueId',
      queueId: koViewModel.users()[0]._id(),
      '_csrf': $('input[name="csrf"]').val()
    };

    $.post('#', postData, function(data) {
      if (data.error) {
        alert('Sivun päivittäminen epäonnistui! Yritä ladata sivu uudelleen.');
      } else {
        ko.mapping.fromJS(data, koViewModel);
        updateLayout();
      }
    }).fail(function() {
      alert('Sivun päivittäminen epäonnistui! Yritä ladata sivu uudelleen.');
    });

  };

  // **********************************************************************************************

  var setImageSize = function() {
    $('#img').css('max-width', ($(window).width() - 100) + 'px');
    $('#img').css('max-height', ($(window).height() - $('#header').height() - 100) + 'px');
  };

  // **********************************************************************************************

  var refresh = function() {

    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();

    var closed = '';

    if (!isOpen) {
      closed = 'Jono on suljettu - ';
    }

    if (m < 10) m = "0" + m;
    $('#time').contents().replaceWith(closed + h + ":" + m);


    var currentImage = $('#img').attr('src');
    var newImage = projectorConf.course;

    if (isOpen && projectorConf.sessions && projectorConf.sessions[sessionName]) {
      newImage = projectorConf.sessions[sessionName];
    }

    if (isOpen && projectorConf.pictures && !(moment().minute() % 15 === 0 && moment().hour() % 2 !== 0)) {
      var foundImages = [];
      projectorConf.pictures.forEach(function(picture) {
        if (moment().isAfter(moment(picture.start)) && moment().isBefore(moment(picture.end))) {
          foundImages.push(picture.picture);
        }
      });

      if (foundImages.length > 0) {
        newImage = foundImages[moment().minute() % foundImages.length];
      }

    }

    if (currentImage !== newImage) {
      $('#img').attr("id", "img1");
      $('#content').append('<img src="' + newImage + '" id="img" alt="" style="display: none;">');
      $('#img1').fadeOut("slow", function() {
        $('#img1').remove();
        $('#img').delay(500).fadeIn("slow");
      });
    }

    setImageSize();

  };

  // **********************************************************************************************

  $('#name').click(function() {
    remove();
  });

  $(window).keyup(function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code === 32 && koViewModel.users().length > 0) remove();
  });

  $(window).resize(function(e) {
    setImageSize();
  });

  // **********************************************************************************************

  var jsonpSettings = {
    dataType: 'jsonp',
    jsonp: false,
    jsonpCallback: 'projector'
  };


  var confUrl = $('input[name="projectorConf"]').val() + '?timestamp=' + Date.now();
  $.ajax(confUrl, jsonpSettings).done(function(data) {

    projectorConf = data;
    window.setInterval(refresh, 2000);
    refresh();

  }).fail(function() {
    alert('Näkymän asetusten lataaminen epäonnistui! Yritä ladata sivu uudelleen.');
  });


});
