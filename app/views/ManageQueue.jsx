'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {injectIntl} from 'react-intl';
import io from 'socket.io-client';

import {Time} from '../components/Time';

/********************************************************************
 *  ManageQueue is the assistant view for managing the queue.
 *******************************************************************/

const clickHandler = function(event, id, props, successText, failText) {
  props.clearAlertMessages();
  const form = $(event.target).closest('form');
  const postData = form.serializeArray();
  postData.push({name: 'queueId', value: id});
  const formURL = $(form).attr('action');

  $.post(formURL, postData, function(data) {
    if (data.error && failText) {
      props.addAlertMessage('error', failText);
    } else {
      if (successText) {
        props.addAlertMessage('success', successText);
      }
      props.updateQueueData(data);
    }
  }).fail(function() {
    if (failText) {
      props.addAlertMessage('error', failText);
    }
  });
};

// ********************************************************************************************************************

const ProjectorMode = function(props) {
  return <div>
    <p>
      <a
        href={`/neuvontajono/sessions/${props.sessionId}/manage/projector`}
        target="_blank"
        className="btn btn-success"
        onClick={props.disableNotifications}>
        <FormattedMessage id="manage-open-projector"/>
      </a>
    </p>
    <p>
      <FormattedMessage id="manage-projector-help"/>
    </p>
    <hr/>
  </div>;
};

// ********************************************************************************************************************

const UserRow = function(props) {

  const cName = 'btn btn-primary remove ' + (
  props.position === 1 ? '' : 'btn-xs'
);

  const handleClick = function(event) {
    event.preventDefault();
    if (props.position !== 1) {
      if (!confirm(props.intl.formatMessage({id: 'manage-confirm-remove-middle'}))) {
        return;
      }
    }

    if (props.user.row < 0) {
      props.setLastConnectionInfo({
        connection: props.user.callURL || props.user.user.email,
        name: `${props.user.user.name.first} ${props.user.user.name.last}`
      });
    } else {
      props.setLastConnectionInfo(null);
    }
    clickHandler(event, props.user._id, props, null, 'manage-remove-queue-failed');

  };

  return <>
    <tr className={props.position === 1 ? 'first-in-queue' : ''}>
      <td><FormattedMessage id="ordinal-value" values={{
        position: props.position
      }}/></td>
      <td>{`${props.user.user.name.first} ${props.user.user.name.last}`}</td>
      <td><Time value={props.user.enteredAt}/></td>
      <td>
        {
          props.user.row > 0 && <FormattedMessage
              id="manage-user-row-template"
              values={{
                location: props.user.location,
                row: props.user.row
              }}/>
        }
        {props.user.row < 0 && <FormattedMessage id="queue-remote"/>}
      </td>
      {props.showLanguage && <td>{props.user.language}</td>}
      <td>
        <button onClick={handleClick} className={cName}>
          <FormattedMessage id="manage-remove"/>
        </button>
      </td>
    </tr>
    {props.user.row < 0 && <tr>
      <td colSpan="5" className={(props.position === 1 ? 'first-in-queue' : '') + ' details-row'}>
        {props.user.callURL ? <a targe="_blank" href={props.user.callURL}>{props.user.callURL}</a> : props.user.user.email}
      </td>
    </tr>}
  </>;
};

// ********************************************************************************************************************

const ClearQueue = function(props) {

  const handleClick = function(event) {
    if (!confirm(props.intl.formatMessage({id: 'manage-clear-queue-confirm'}))) {
      event.preventDefault();
    }
  };

  if (props.length > 0) {
    return <form action="#" method="post">
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <button id="clear-queue" type="submit" className="btn btn-danger" name="action" value="clear" onClick={handleClick}>
        <FormattedMessage id="manage-clear-queue"></FormattedMessage>
      </button>
    </form>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

const UsersInQueue = function(props) {

  if (props.length > 0) {

    let showLanguage = false;
    props.users.forEach(function(user) {
      if (user.language) {
        showLanguage = true;
      }
    });

    return <form id="remove" action="#" method="post">
      <input type="hidden" name="action" value="remove"/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <table id="queue" className="table">
        <thead>
          <tr>
            <th><FormattedMessage id='manage-th-position'/></th>
            <th><FormattedMessage id='manage-th-name'/></th>
            <th><FormattedMessage id='manage-th-entered-at'/></th>
            <th><FormattedMessage id='manage-th-location'/></th>
            {showLanguage && <th><FormattedMessage id='select-th-language'/></th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            props.users.map(
              (user, index) => <UserRow
                clearAlertMessages={props.clearAlertMessages}
                addAlertMessage={props.addAlertMessage}
                updateQueueData={props.updateQueueData}
                setLastConnectionInfo={props.setLastConnectionInfo}
                key={user._id}
                user={user}
                position={index + 1}
                intl={props.intl}
                showLanguage={showLanguage}/>
            )
          }
        </tbody>
      </table>
    </form>;
  } else {
    return null;
  }

};

// ********************************************************************************************************************

const NotificationPanel = function(props) {

  if (props.permission && props.enabled) {
    return <p><FormattedMessage id="notification-enabled"/>{' '}
      <a href="#" onClick={props.disableNotifications}><FormattedMessage id="notification-disable"/></a>
    </p>;
  } else if (props.permission && !props.enabled) {
    return <p><FormattedMessage id="notification-disabled"/>{' '}
      <a href="#" onClick={props.enableNotifications}><FormattedMessage id="notification-activate"/></a>
    </p>;
  } else {
    return <p><a href="#" onClick={(e) => {
      e.preventDefault();
      if (window.Notification) {
        window.Notification.requestPermission(function(permission) {
          if (permission === 'granted') {
            props.enableNotifications();
          }
        });
      }
    }}><FormattedMessage id="notification-no-permission"/></a>
    </p>;
  }

};

// ********************************************************************************************************************

class ManageQueue_ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      queueData: this.props.view.queueData,
      notificationPermission: false,
      nofificationsEnabled: false,
      lastRemovedConnection: null
    };

    this.updateQueueData = this.updateQueueData.bind(this);
    this.disableNotifications = this.disableNotifications.bind(this);
    this.enableNotifications = this.enableNotifications.bind(this);
    this.setLastConnectionInfo = this.setLastConnectionInfo.bind(this);

  }

  // **********************************************************************************************

  componentDidMount() {

    const self = this;

    const socket = io.connect('/queue', {
      path: '/neuvontajono/socket.io',
      forceNew: true
    });

    socket.on('connect', function() {
      socket.emit('staffQueue', {'sessionId': self.props.view.sessionId});
    });

    socket.on('staffQueue', function(data) {
      if (data.error) {
        self.props.clearAlertMessages();
        self.props.addAlertMessage('error', 'alert-page-update-failed');
      } else {
        self.updateQueueData(data);
      }
    });

    if (window.Notification && window.Notification.permission === 'granted') {
      this.setState({notificationPermission: true, notificationsEnabled: true});
    }

    const pollingUpdate = function() {
      const timestamp = Date.now();
      $.getJSON('?timestamp=' + timestamp, function(data) {
        if (data.error) {
          self.props.clearAlertMessages();
          self.props.addAlertMessage('error', 'alert-page-update-failed');
        } else {
          self.updateQueueData(data);
        }
      }).fail(function() {
        self.props.clearAlertMessages();
        self.props.addAlertMessage('error', 'alert-page-update-failed');
      });
    };

    socket.on('reconnect', function() {
      pollingUpdate();
    });

    setInterval(pollingUpdate, 60000);

    document.title = this.props.intl.formatMessage({id: 'title'}) + ' (' + this.state.queueData.users.length + ')';

  }

  // **********************************************************************************************

  disableNotifications() {
    this.setState({notificationsEnabled: false});
  }

  enableNotifications(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({notificationPermission: true, notificationsEnabled: true});
  }

  // **********************************************************************************************

  setLastConnectionInfo(info) {
    this.setState({lastRemovedConnection: info});
  }

  // **********************************************************************************************

  updateQueueData(data) {

    if (this.state.notificationsEnabled && this.state.queueData.users.length === 0 && data.users.length > 0) {
      const options = {
        body: this.props.intl.formatMessage({
          id: data.users[0].row > 0 ? 'notification-joined-queue-local' : 'notification-joined-queue-remote'
        }, {
          name: data.users[0].user.name.first,
          row: data.users[0].row,
          location: data.users[0].location
        })
      };
      const notification = new Notification(this.props.intl.formatMessage({id: 'title'}), options);
      setTimeout(notification.close.bind(notification), 4000);
    }

    this.setState({queueData: data});
    document.title = this.props.intl.formatMessage({id: 'title'}) + ' (' + data.users.length + ')';
  }

  // **********************************************************************************************

  render() {
    return <div>

      <h3>{this.props.view.sessionLocation}</h3>

      <NotificationPanel
        enabled={this.state.notificationsEnabled}
        permission={this.state.notificationPermission}
        disableNotifications={this.disableNotifications}
        enableNotifications={this.enableNotifications}/>

      <hr/>

      <ProjectorMode
        projectorConf={this.props.view.projectorConf}
        sessionId={this.props.view.sessionId}
        disableNotifications={this.disableNotifications}/>

      <p id="queue-length">
        <FormattedMessage
          id="manage-current-length"
          values={{
            length: this.state.queueData.users.length
          }}/>
      </p>

      {
        this.state.lastRemovedConnection && <p>
          <FormattedMessage id={'manage-last-connection'}/>{' '}
          {this.state.lastRemovedConnection.name}{', '}
          {this.state.lastRemovedConnection.connection.indexOf('http') === 0 ?
          <a target="_blank" href={this.state.lastRemovedConnection.connection}>{this.state.lastRemovedConnection.connection}</a> :
          this.state.lastRemovedConnection.connection}
        </p>
      }

      <UsersInQueue
        users={this.state.queueData.users}
        csrf={this.props.view.csrf}
        length={this.state.queueData.users.length}
        addAlertMessage={this.props.addAlertMessage}
        clearAlertMessages={this.props.clearAlertMessages}
        updateQueueData={this.updateQueueData}
        setLastConnectionInfo={this.setLastConnectionInfo}
        intl={this.props.intl}/>

      <ClearQueue intl={this.props.intl} csrf={this.props.view.csrf} length={this.state.queueData.users.length}/>

    </div>;
  }
}

// ********************************************************************************************************************

const ManageQueue = injectIntl(ManageQueue_);

export {
  ManageQueue
};
