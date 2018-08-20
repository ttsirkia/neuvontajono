'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {injectIntl} from 'react-intl';
import io from 'socket.io-client';
import moment from 'moment';

/********************************************************************
 *  ManageQueueProjector is the view for the projector to show
 *  the length of the queue and some course-specific pictures.
 *******************************************************************/

class ManageQueueProjector_ extends React.Component {

  constructor(props) {
    super(props);
    this.isOpen = props.view.queueData.open === true;
    this.currentImage = null;
    this.nextInQueue = null;
    this.queueLength = props.view.queueData.users.length;
    this.sessionName = props.view.queueData.sessionName;
    this.multipleLocations = false;
    this.projectorConf = null;
    this.pictureChanging = false;

    this.downloadProjectorConf = this.downloadProjectorConf.bind(this);
    this.setImageSize = this.setImageSize.bind(this);
    this.updateClockAndLength = this.updateClockAndLength.bind(this);
    this.updateNextInQueue = this.updateNextInQueue.bind(this);
    this.updatePicture = this.updatePicture.bind(this);
    this.remove = this.remove.bind(this);
    this.pollingUpdate = this.pollingUpdate.bind(this);
  }

  // **********************************************************************************************

  downloadProjectorConf() {

    const self = this;

    const jsonpSettings = {
      dataType: 'jsonp',
      jsonp: false,
      jsonpCallback: 'projector'
    };

    const confUrl = this.props.view.projectorConf + '?timestamp=' + Date.now();
    $.ajax(confUrl, jsonpSettings).done(function(data) {

      self.projectorConf = data;
      self.updatePicture();

    }).fail(function() {
      alert(self.props.intl.formatMessage({id: 'manage-projector-conf-fail'}));
    });
  }

  // **********************************************************************************************

  updateClockAndLength() {

    const timeFormat = this.props.intl.formatMessage({id: 'time-output-format'});
    const time = moment().format(timeFormat);

    let closed = '';

    if (!this.isOpen) {
      closed = this.props.intl.formatMessage({id: 'manage-projector-queue-closed'}) + ' - ';
    }

    $('#time').text(closed + time);

    $('#length').text(this.queueLength);
    document.title = 'Neuvontajono (' + this.queueLength + ')';

  }

  // **********************************************************************************************

  updateNextInQueue(data) {

    if (data.users.length > 0 && this.nextInQueue === null) {
      $('#name').text(data.users[0].user.name.first);
      $('#location').text(data.users[0].location + ', ');
      $('#row').text(data.users[0].row);
      $('#next').fadeIn(500);
      this.nextInQueue = data.users[0]._id;
    } else if (data.users.length === 0 && this.nextInQueue !== null) {
      $('#next').fadeOut(500, function() {
        $('#name').text('');
        $('#location').text('');
        $('#row').text('');
      });
      this.nextInQueue = null;
    } else if (data.users.length > 0 && this.nextInQueue !== data.users[0]._id) {
      $('#next').fadeOut(500, function() {
        $('#name').text(data.users[0].user.name.first);
        $('#location').text(data.users[0].location + ', ');
        $('#row').text(data.users[0].row);
        $('#next').fadeIn(500);
        this.nextInQueue = data.users[0]._id;
      });
      this.nextInQueue = null;
    } else if (data.users.length > 0) {
      $('#name').text(data.users[0].user.name.first);
      $('#location').text(data.users[0].location + ', ');
      $('#row').text(data.users[0].row);
      this.nextInQueue = data.users[0]._id;
    } else {
      $('#next').fadeOut(500);
      this.nextInQueue = null;
    }

  }

  // **********************************************************************************************

  update(data) {
    this.queueLength = data.users.length;

    // Socket doesn't provide these
    if (data.open !== undefined) {
      this.isOpen = data.open === true;
      this.sessionName = data.sessionName;
    }

    this.multipleLocations = data.multipleLocations === true;
    if (this.multipleLocations) {
      $('#location').show();
    } else {
      $('#location').hide();
    }

    this.updateNextInQueue(data);
    this.updateClockAndLength();
  }

  // **********************************************************************************************

  updatePicture() {

    if (!this.projectorConf || this.pictureChanging) {
      return;
    }

    const self = this;
    let newImage = this.projectorConf.course;

    if (this.isOpen && this.projectorConf.sessions && this.projectorConf.sessions[this.sessionName]) {
      newImage = this.projectorConf.sessions[this.sessionName];
    }

    if (this.isOpen && this.projectorConf.pictures && !(moment().minute() % 15 === 0 && (moment().hour() % 2 !== 0 || moment().minute() !== 0))) {
      const foundImages = [];
      this.projectorConf.pictures.forEach(function(picture) {
        if (moment().isAfter(moment(picture.start)) && moment().isBefore(moment(picture.end))) {
          foundImages.push(picture.picture);
        }
      });

      if (foundImages.length > 0) {
        newImage = foundImages[moment().minute() % foundImages.length];
      }

    }

    if (!this.currentImage) {
      $('#content').append('<img src="' + newImage + '" id="img" alt="">');
      this.setImageSize();
      this.currentImage = newImage;
    } else if (this.currentImage !== newImage) {
      this.pictureChanging = true;
      $('#img').attr('id', 'img1');
      $('#content').append(
        '<img src="' + newImage + '" id="img" alt="" style="display: none;">'
      );
      this.currentImage = newImage;
      this.setImageSize();
      $('#img1').fadeOut(500, function() {
        $('#img1').remove();
        $('#img').delay(500).fadeIn(500, function() {
          self.pictureChanging = false;
        });
      });
    }

  }

  // **********************************************************************************************

  setImageSize() {
    $('#img').css('max-width', ($(window).width() - 100) + 'px');
    $('#img').css('max-height', ($(window).height() - $('#header').height() - 100) + 'px');
  }

  // **********************************************************************************************

  remove() {
    const self = this;
    const postData = {
      action: 'remove',
      queueId: this.nextInQueue,
      '_csrf': this.props.view.csrf
    };

    $.post('#', postData, function(data) {
      if (data.error) {
        alert(self.props.intl.formatMessage({id: 'alert-page-update-failed'}));
      } else {
        self.update(data);
      }
    }).fail(function() {
      alert(self.props.intl.formatMessage({id: 'alert-page-update-failed'}));
    });
  }

  // **********************************************************************************************

  pollingUpdate() {
    const self = this;
    const timestamp = Date.now();
    $.getJSON('?timestamp=' + timestamp, function(data) {
      if (data.error) {
        alert(self.props.intl.formatMessage({id: 'alert-page-update-failed'}));
      } else {
        self.update(data);
      }
    }).fail(function() {
      alert(self.props.intl.formatMessage({id: 'alert-page-update-failed'}));
    });
  }

  // **********************************************************************************************

  componentDidMount() {

    const self = this;
    setInterval(this.updateClockAndLength, 2000);
    setInterval(this.pollingUpdate, 20000);
    setInterval(this.updatePicture, 2000);
    this.update(this.props.view.queueData);
    this.downloadProjectorConf();

    const socket = io.connect('/queue', {
      path: '/neuvontajono/socket.io',
      forceNew: true
    });

    socket.on('connect', function() {
      socket.emit('staffQueue', {'sessionId': self.props.view.sessionId});
    });

    socket.on('staffQueue', function(data) {
      if (data.error) {
        alert(self.props.intl.formatMessage({id: 'alert-page-update-failed'}));
      } else {
        self.update(data);
      }
    });

    $('#next').click(function() {
      if (self.nextInQueue !== null) {
        self.remove();
      }
    });

    $(window).keyup(function(e) {
      const code = (e.keyCode ? e.keyCode : e.which);
      if (code === 32 && self.nextInQueue !== null) {
        self.remove();
      }
    });

    $(window).resize(function() {
      self.setImageSize();
    });

  }

  // **********************************************************************************************

  render() {
    return <div>
      <div id="header">
        <div id="time"></div>
        <div id="queue">
          <FormattedMessage id="manage-projector-in-queue"/>
          <span id="length"></span>
        </div>
        <div id="next">
          <FormattedMessage id="manage-projector-next-in-queue"/>
          <span id="name"></span>{' '}
          (<span id="location"></span><FormattedMessage id="manage-projector-row"/>{' '}
          <span id="row"></span>)</div>
      </div>

      <div id="content"></div>

    </div>;
  }
}

// ********************************************************************************************************************

const ManageQueueProjector = injectIntl(ManageQueueProjector_);

export {
  ManageQueueProjector
};