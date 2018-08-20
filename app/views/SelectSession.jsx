'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Timespan} from '../components/Timespan';

/********************************************************************
 *  SelectSession is the view for assistant to choose the exercise
 *  group they want to manage.
 *******************************************************************/

const SessionRow = function(props) {
  return <tr className={props.session.status}>
    <td>{props.session.name}</td>
    <td><Timespan
      preStart={props.session.queueOpenTime}
      start={props.session.startTime}
      end={props.session.endTime}/></td>
    <td>{props.session.location}</td>
    <td>{props.session.assistants}</td>
    <td>
      <a href={`/neuvontajono/sessions/${props.session.id}/manage`} className="btn btn-primary"><FormattedMessage id="select"/></a>
    </td>
  </tr>;
};

// ********************************************************************************************************************

const Sessions = function(props) {
  if (props.sessions.length === 0) {
    return <p><FormattedMessage id="select-no-groups-today"/></p>;
  } else {
    return <div>
      <p><FormattedMessage id="select-main-text"/></p>
      <table className="table">
        <thead>
          <tr>
            <th><FormattedMessage id="select-th-name"/></th>
            <th><FormattedMessage id="select-th-time"/></th>
            <th><FormattedMessage id="select-th-location"/></th>
            <th><FormattedMessage id="select-th-staff"/></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {props.sessions.map((session) => <SessionRow session={session} key={session.id}/>)}
        </tbody>
      </table>

    </div>;
  }
};

// ********************************************************************************************************************

export function SelectSession(props) {
  return <div>
    <Sessions sessions={props.view.sessions}/>
  </div>;
}
