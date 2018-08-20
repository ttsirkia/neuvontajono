'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {injectIntl} from 'react-intl';
import io from 'socket.io-client';

import {Time} from '../components/Time';

/********************************************************************
 *  ManageQueue is the assistant view for managing the queue.
 *******************************************************************/
 
const clickHandler = function(event, props, successText, failText) {
  props.clearAlertMessages();
  const form = $(event.target).closest('form');
  const postData = form.serializeArray();
  postData.push({name: 'queueId', value: event.target.value});
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
  if (props.projectorConf) {
    return <div>
      <p>
        <a href={`/neuvontajono/sessions/${props.sessionId}/manage/projector`} target="_blank" className="btn btn-success">
          <FormattedMessage id="manage-open-projector"/>
        </a>
      </p>
      <p>
        <FormattedMessage id="manage-projector-help"/>
      </p>
      <hr/>
    </div>;
  } else {
    return <div>
      <p><FormattedMessage id="manage-projector-not-in-use"/></p>
    </div>;
  }
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

    clickHandler(event, props, null, 'manage-remove-queue-failed');

  };

  return <tr className={props.position === 1 ? 'first-in-queue' : ''}>
    <td><FormattedMessage id="ordinal-value" values={{position: props.position}}/></td>
    <td>{`${props.user.user.name.first} ${props.user.user.name.last}`}</td>
    <td><Time value={props.user.enteredAt}/></td>
    <td><FormattedMessage
      id="manage-user-row-template"
      values={{
      location: props.user.location,
      row: props.user.row
    }}/></td>
    <td>
      <button onClick={handleClick} className={cName} name="queueId" value={props.user._id}>
        <FormattedMessage id="manage-remove"/>
      </button>
    </td>
  </tr>;
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
                key={user._id}
                user={user}
                position={index + 1}
                intl={props.intl}/>
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

class ManageQueue_ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      queueData: this.props.view.queueData
    };

    this.updateQueueData = this.updateQueueData.bind(this);

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

    setInterval(function() {

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
    }, 60000);
  }

  // **********************************************************************************************

  updateQueueData(data) {
    this.setState({queueData: data});
  }

  // **********************************************************************************************

  render() {
    return <div>

      <h3>{this.props.view.sessionLocation}</h3>

      <ProjectorMode projectorConf={this.props.view.projectorConf} sessionId={this.props.view.sessionId}/>

      <p id="queue-length">
        <FormattedMessage
          id="manage-current-length"
          values={{
            length: this.state.queueData.users.length
          }}/>
      </p>

      <UsersInQueue
        users={this.state.queueData.users}
        csrf={this.props.view.csrf}
        length={this.state.queueData.users.length}
        addAlertMessage={this.props.addAlertMessage}
        clearAlertMessages={this.props.clearAlertMessages}
        updateQueueData={this.updateQueueData}
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
