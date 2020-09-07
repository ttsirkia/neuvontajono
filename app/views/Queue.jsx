'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {injectIntl} from 'react-intl';
import io from 'socket.io-client';

/********************************************************************
 *  Queue is the main view for students  to enter the queue and
 *  see their position in the queue.
 *******************************************************************/

const clickHandler = function(event, props, successText, failText, overrideLocation) {
  props.clearAlertMessages();
  const form = $(event.target).closest('form');
  const postData = form.serializeArray();
  const formURL = $(form).attr('action');

  $.post(formURL, postData, function(data) {
    if (data.error && failText) {
      props.addAlertMessage('error', failText);
    } else {
      if (successText) {
        props.addAlertMessage('success', successText);
      }
      props.updateQueueData(data, overrideLocation);
    }
  }).fail(function() {
    if (failText) {
      props.addAlertMessage('error', failText);
    }
  });
};

// ********************************************************************************************************************

const CurrentPosition = function(props) {
  if (props.position >= 2) {
    return <div className="alert alert-info">
      <FormattedMessage id="queue-current-position" values={{
          position: props.position
        }}/>
    </div>;
  } else if (props.position === 1) {
    return <div className="alert alert-success">
      <FormattedMessage id="queue-next-in-queue"/>
    </div>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

const NoSessions = function(props) {
  if (props.position === 0 && props.locations.length === 0) {
    return <div className="alert alert-info">
      <FormattedMessage id="queue-not-open"/>
    </div>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

const EnterQueue = function(props) {

  const handleEnterClick = function(event) {
    event.preventDefault();

    if ($('#callURL').val() && ($('#callURL').val().indexOf('https://') !== 0 && $('#callURL').val().indexOf('http://') !== 0)) {
      alert(props.intl.formatMessage({id: 'queue-wrong-call-url'}));
      return;
    }

    clickHandler(event, props, null, 'queue-join-failed', true);
  };

  // **********************************************************************************************

  const MultipleLocations = function(props) {
    const results = props.sessions.filter(
      x => (props.localParticipation && x.local) || (!props.localParticipation && x.remote)
    );
    if (results.length > 1) {
      return <div>
        <div className="alert alert-warning">
          <FormattedMessage id="queue-multiple-locations"/>
        </div>

        <div className="form-group">
          <label htmlFor="location" className="col-sm-3 control-label"><FormattedMessage id="queue-group"/></label>
          <div className="col-sm-6">
            <select
              id="session-selector"
              defaultValue={props.selectedSession.location}
              onChange={props.handleSessionSelectionChange}>
              {
                results.map(
                  (session) => <option key={`${session.name}|${session.location}`} value={session.location}>{`${session.name} (${session.location})`}</option>
                )
              }
            </select>
          </div>
        </div>
      </div>;
    } else {
      return null;
    }
  };

  // **********************************************************************************************

  const SingleLocation = function(props) {
    const results = props.sessions.filter(
      x => (props.localParticipation && x.local) || (!props.localParticipation && x.remote)
    );
    if (results.length === 1) {      
      return <div className="form-group">
        <label htmlFor="location" className="col-sm-3 control-label"><FormattedMessage id="queue-group"/></label>
        <div className="col-sm-6">
          <span id="session-selector">{`${results[0].name} (${results[0].location})`}</span>
        </div>
      </div>;
    } else {
      return null;
    }
  };

  // **********************************************************************************************

  const Assistants = function(props) {
    if (props.session.assistants) {
      return <div className="form-group">
        <label className="col-sm-3 control-label"><FormattedMessage id="queue-assistants"/></label>
        <div className="col-sm-6">
          <p className="form-control-static">{props.session.assistants}</p>
        </div>
      </div>;
    } else {
      return null;
    }
  };

  // **********************************************************************************************

  const LanguageSelection = function(props) {

    if (props.languages.length < 2) {
      return null;
    }

    return <div>
      <div className="alert alert-info">
        <FormattedMessage id="queue-multiple-languages"/>
      </div>

      <div className="form-group">
        <label htmlFor="language" className="col-sm-3 control-label"><FormattedMessage id="queue-language"/></label>
        <div className="col-sm-6">
          <select name="language" defaultValue={props.previousLanguage}>
            {props.languages.map((language) => <option key={language} value={language}>{language}</option>)}
          </select>
        </div>
      </div>

    </div>;

  };

  // **********************************************************************************************

  if (props.sessions.length > 0 && props.user.position === 0) {

    return <div>
      <form className="queue form-horizontal" method="post" action="/neuvontajono/queue">

        <input type="hidden" name="action" value="add"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input type="hidden" name="sessionId" value={props.selectedSession.id}/>
        <input type="hidden" name="location" value={props.selectedSession.location}/>

        <MultipleLocations
          sessions={props.sessions}
          selectedSession={props.selectedSession}
          localParticipation={props.localParticipation}
          handleSessionSelectionChange={props.handleSessionSelectionChange}/>
        <SingleLocation sessions={props.sessions} 
          localParticipation={props.localParticipation} 
          setSelectedSession={props.setSelectedSession}/>

        <hr/>

        <Assistants session={props.selectedSession}/>

        <div className="form-group">
          <label className="col-sm-3 control-label"><FormattedMessage id="queue-current-length"/></label>
          <div className="col-sm-6">
            <p className="form-control-static">{props.selectedSession.queueLength}</p>
          </div>
        </div>

        <hr/>
        { props.localParticipation && <div className="form-group">
          <label htmlFor="row" className="col-sm-3 control-label"><FormattedMessage id="queue-my-row"/></label>
          <div className="col-sm-6">
            <select name="row" defaultValue={props.user.previousRow}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
            <p className="help-block small"><FormattedMessage id="queue-row-direction-help"/></p>
          </div>
          <input type="hidden" name="participationMode" value="local"/>
        </div>
        }

        {!props.localParticipation && <div className="form-group">
          <label htmlFor="callURL" className="col-sm-3 control-label"><FormattedMessage id="queue-call-url"/></label>
          <div className="col-sm-6">
            <input type="text" className="form-control" name="callURL" id="callURL" defaultValue={props.user.previousCallURL}/>
            <p className="help-block small"><FormattedMessage id="queue-call-url-help"/></p>
          </div>
          <input type="hidden" name="participationMode" value="remote"/>
        </div>
        }

        <LanguageSelection languages={props.selectedSession.language} previousLanguage={props.user.previousLanguage}/>

        <hr/>

        <div>
          <button className="add btn btn-primary" onClick={handleEnterClick}><FormattedMessage id="queue-join"/></button>
        </div>

      </form>
    </div>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

const ExitQueue = function(props) {

  const handleExitClick = function(event) {
    event.preventDefault();
    if (!confirm(props.intl.formatMessage({id: 'queue-leave-confirm'}))) {
      return;
    }
    clickHandler(event, props, 'queue-leave-confirmed', 'queue-leave-failed', true);
  };

  // **********************************************************************************************

  if (props.user.position >= 1) {
    return <div>
      <p><FormattedMessage id='queue-leave-reminder'/></p>
      <form id="remove" action="/neuvontajono/queue" method="post">
        <input type="hidden" name="action" value="remove"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <button className="remove btn btn-primary" onClick={handleExitClick}><FormattedMessage id="queue-leave"/></button>
      </form>
    </div>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

const ChangeLocation = function(props) {

  const handleChangeClick = function(event) {
    event.preventDefault();
    if ($('#callURL2').val() && ($('#callURL2').val().indexOf('https://') !== 0 && $('#callURL2').val().indexOf('http://') !== 0)) {
      alert(props.intl.formatMessage({id: 'queue-wrong-call-url'}));
      return;
    }
    clickHandler(event, props, 'queue-position-updated', 'queue-position-failed', true);
  };

  if (props.sessions.length > 0 && props.user.position > 0) {
    return <div className="change-session">
      <p><FormattedMessage id="queue-position-change"/></p>
      <form className="queue form-inline" method="post" action="/neuvontajono/queue">
        <input type="hidden" name="action" value="add"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input type="hidden" name="sessionId" value={props.selectedSession.id}/>
        <input type="hidden" name="location" value={props.selectedSession.location}/>

        <div className="form-group">
          <label htmlFor="session2"><FormattedMessage id="queue-group-short"/></label>
          <select id="session2" defaultValue={props.selectedSession.location} onChange={props.handleSessionSelectionChange}>
            {
              props.sessions.map(
                (session) => <option key={`${session.name}|${session.location}`} value={session.location}>{`${session.name} (${session.location})`}</option>
              )
            }
          </select>
        </div>

        {props.selectedSession.local &&
        <div className="form-group">
          <label htmlFor="row2"><FormattedMessage id="queue-row-short"/></label>
          <select name="row" defaultValue={props.user.previousRow}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
          <input type="hidden" name="participationMode" value="local"/>
        </div>
        }

        {props.selectedSession.remote &&
        <div className="form-group">
          <label htmlFor="callURL2"><FormattedMessage id="queue-url-short"/></label>
          <input name="callURL" id="callURL2" defaultValue={props.user.previousCallURL}></input>
          <input type="hidden" name="participationMode" value="remote"/>
          <input type="hidden" name="row" value="-1"/>
        </div>
        }

        <div className="form-group">
          <button className="add btn btn-primary btn-xs" onClick={handleChangeClick}><FormattedMessage id="queue-move"/></button>
        </div>

      </form>
    </div>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

const SelectParticipationMode = function(props) {

  if (props.local && props.remote && props.sessions.length > 0 && props.user.position === 0) {
    return <div style={{
        marginTop: '20px',
        marginBottom: '20px'
      }}>
      <div>
        <label>
          <input type="radio" value="local" name="participationMode"
           checked={props.currentlyLocal} onChange={props.changeParticipationMode}/>
          <span
            style={{
              display: 'inline-block',
              paddingLeft: '10px',
              fontSize: '125%'
            }}><FormattedMessage id="queue-local-participation"/></span>
        </label>
      </div>
      <div>
        <label>
          <input type="radio" value="remote" name="participationMode"
            checked={!props.currentlyLocal}
            onChange={props.changeParticipationMode}/>
          <span
            style={{
              display: 'inline-block',
              paddingLeft: '10px',
              fontSize: '125%'
            }}><FormattedMessage id="queue-remote-participation"/></span>
        </label>
      </div>
    </div>;
  } else {
    return null;
  }

}

// ********************************************************************************************************************

class Queue_ extends React.Component {

  constructor(props) {
    super(props);

    let selectedSession = null;
    let localP = (props.view.queueData.local && !props.view.queueData.remote) || (props.view.queueData.local && props.view.queueData.user.previousParticipationLocal);
    if (props.view.queueData.sessions.length > 0) {
      const results = props.view.queueData.sessions.filter(
        x => (localP && x.local) || (!localP && x.remote)
      );
        selectedSession = results[0];
    }
    
    if (props.view.queueData.sessions.length > 1 && props.view.queueData.user.previousLocation) {
      props.view.queueData.sessions.forEach((session) => {
        if (session.location === props.view.queueData.user.previousLocation && (localP && session.local) || (!localP && session.remote)) {
          selectedSession = session;
        }
      });
    }


    this.state = {
      sessions: props.view.queueData.sessions,
      locations: props.view.queueData.locations,
      user: props.view.queueData.user,
      selectedSession: selectedSession,
      local: props.view.queueData.local,
      remote: props.view.queueData.remote,
      localParticipation: localP
    };

    this.handleSessionSelectionChange = this.handleSessionSelectionChange.bind(this);
    this.updateQueueData = this.updateQueueData.bind(this);
    this.changeParticipationMode = this.changeParticipationMode.bind(this);
    this.setSelectedSession = this.setSelectedSession.bind(this);
  }

  // **********************************************************************************************

  componentDidMount() {

    const self = this;

    const socket = io.connect('/queue', {
      path: '/neuvontajono/socket.io',
      forceNew: true
    });

    socket.on('connect', function() {
      socket.emit('userQueue', {'courseId': self.props.view.courseId});
    });

    socket.on('userQueue', function(data) {
      if (data.error) {
        self.props.clearAlertMessages();
        self.props.addAlertMessage('error', 'alert-page-update-failed');
      } else {
        self.updateQueueData(data, false);
      }
    });

    const pollingUpdate = function() {
      const timestamp = Date.now();
      $.getJSON('?timestamp=' + timestamp, function(data) {
        if (data.error) {
          self.props.clearAlertMessages();
          self.props.addAlertMessage('error', 'alert-page-update-failed');

        } else {
          self.updateQueueData(data, false);
        }
      }).fail(function() {
        self.props.clearAlertMessages();
        self.props.addAlertMessage('error', 'alert-page-update-failed');
      });
    };

    setInterval(function() {
      pollingUpdate();
    }, 60000);

    socket.on('reconnect', function() {
      pollingUpdate();
    })

  }

  // **********************************************************************************************

  changeParticipationMode(event) {
    const localParticipation = event.target.value === 'local';
    const results = this.state.sessions.filter(
      x => (localParticipation && x.local) || (!localParticipation && x.remote)
    );
    const newState = {
      localParticipation,
      selectedSession: results[0]
    };
    
    this.setState(newState);
  }

  // **********************************************************************************************

  updateQueueData(data, overrideLocation) {

    const localP = (data.local && !data.remote) || (data.local && this.state.localParticipation);
    let selectedSession = null;
    if (data.sessions.length > 0) {
      const results = data.sessions.filter(
        x => (localP && x.local) || (!localP && x.remote)
      );
        selectedSession = results[0];
    }
    if (data.sessions.length > 1 && data.user.previousLocation) {
      data.sessions.forEach((session) => {
        if ((session.location === data.user.previousLocation && overrideLocation) || (session.location === this.state.selectedSession.location && !overrideLocation)) {
          if ((localP && session.local) || (!localP && session.remote)) {
            selectedSession = session;
          }
        }
      });
    }

    this.setState((prevState) => {
      return {
        sessions: data.sessions,
        locations: data.locations,
        user: data.user,
        selectedSession: selectedSession,
        local: data.local,
        remote: data.remote,
        localParticipation: localP
      }
    });

  }

  // **********************************************************************************************

  setSelectedSession(session) {
    this.setState({selectedSession: session});
  }

  // **********************************************************************************************

  handleSessionSelectionChange(event) {
    let newSession = null;
    this.state.sessions.forEach(function(session) {
      if (session.location === event.target.value) {
        newSession = session;
      }
    });

    if (newSession) {
      this.setState({selectedSession: newSession});
    }

  }

  // **********************************************************************************************

  render() {
    return <div>

      <p className="lead">
        <FormattedMessage id="queue-lead"/>
      </p>

      <CurrentPosition position={this.state.user.position}/>
      <NoSessions position={this.state.user.position} locations={this.state.locations}/>

      <SelectParticipationMode
        sessions={this.state.sessions}
        local={this.state.local}
        remote={this.state.remote}
        user={this.state.user}
        currentlyLocal={this.state.localParticipation}
        changeParticipationMode={this.changeParticipationMode}/>
      <EnterQueue
        csrf={this.props.view.csrf}
        handleSessionSelectionChange={this.handleSessionSelectionChange}
        sessions={this.state.sessions}
        localParticipation={this.state.localParticipation}
        selectedSession={this.state.selectedSession}
        clearAlertMessages={this.props.clearAlertMessages}
        addAlertMessage={this.props.addAlertMessage}
        updateQueueData={this.updateQueueData}
        setSelectedSession={this.setSelectedSession}
        user={this.state.user}
        intl={this.props.intl}/>
      <ExitQueue
        csrf={this.props.view.csrf}
        user={this.state.user}
        clearAlertMessages={this.props.clearAlertMessages}
        addAlertMessage={this.props.addAlertMessage}
        updateQueueData={this.updateQueueData}
        intl={this.props.intl}/>
      <ChangeLocation
        csrf={this.props.view.csrf}
        user={this.state.user}
        selectedSession={this.state.selectedSession}
        handleSessionSelectionChange={this.handleSessionSelectionChange}
        clearAlertMessages={this.props.clearAlertMessages}
        addAlertMessage={this.props.addAlertMessage}
        updateQueueData={this.updateQueueData}
        sessions={this.state.sessions}/>

    </div>;
  }
}

// ********************************************************************************************************************

const Queue = injectIntl(Queue_);

export {
  Queue
};
