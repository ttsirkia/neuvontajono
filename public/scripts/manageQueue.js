$(function() {

  var updateLayout = function() {
    $('table#queue tr').eq(1).addClass('first-in-queue');
    $('table#queue tr').eq(1).find('button').removeClass('btn-xs');
    document.title = 'Neuvontajono (' + koViewModel.users().length + ')';
  };

  // **********************************************************************************************

  var koViewModel = ko.mapping.fromJS(queueData);
  ko.applyBindings(koViewModel);
  updateLayout();

  // **********************************************************************************************

  var socket = io.connect('/queue', {path: '/neuvontajono/socket.io'});

  socket.on('connect', function() {
    socket.emit('staffQueue', {'sessionId': $('input[name="sessionId"]').val()});
  });

  socket.on('staffQueue', function(data) {
    if (data.error) {
      $('div#alerts div.alert').remove();
      $('div#content div#alerts').prepend(
          $('<div class="alert alert-danger">Päivittäminen epäonnistui. Yritä päivittää sivu.</div>'));
    } else {
      ko.mapping.fromJS(data, koViewModel);
      updateLayout();
    }
  });

  // **********************************************************************************************

  setInterval(function() {

    var timestamp = (new Date().getTime() / 1000).toFixed(0);
    $.getJSON(
        "?timestamp=" + timestamp,
        function(data) {
          if (data.error) {
            $('div#alerts div.alert').remove();
            $('div#content div#alerts').prepend(
                $('<div class="alert alert-danger">Päivittäminen epäonnistui. Yritä päivittää sivu.</div>'));
          } else {
            ko.mapping.fromJS(data, koViewModel);
            updateLayout();
          }
        }).fail(
        function() {
          $('div#alerts div.alert').remove();
          $('div#content div#alerts').prepend(
              $('<div class="alert alert-danger">Päivittäminen epäonnistui. Yritä päivittää sivu.</div>'));
        });
  }, 60000);

  // **********************************************************************************************

  $(document.body).on('click', 'form#remove button.remove', function(e) {
    e.preventDefault();

    var form = $(this).parents('form#remove');
    var postData = form.serializeArray();
    var formURL = $(this).attr("action");

    postData.push({name: 'queueId', value: $(this).attr('value')});

    $.post(formURL, postData, function(data) {
      if (data.error) {
        $('div#alerts div.alert').remove();
        $('div#content div#alerts').prepend($('<div class="alert alert-danger">Poistaminen epäonnistui.</div>'));
      } else {
        ko.mapping.fromJS(data, koViewModel);
        updateLayout();
      }
    }).fail(function() {
      $('div#alerts div.alert').remove();
      $('div#content div#alerts').prepend($('<div class="alert alert-danger">Poistaminen epäonnistui.</div>'));
    });

  });

});
