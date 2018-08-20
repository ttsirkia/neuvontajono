'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {FormattedHTMLMessage} from 'react-intl';
import {Timespan} from '../components/Timespan';

/********************************************************************
 *  Sessions provides a summary view of the sessions which will be
 *  held during the current week.
 *******************************************************************/

const AdditionalInformation = function(props) {
  if (props.url) {
    return <p>
      <FormattedHTMLMessage id="sessions-additional-info" values={{
          url: props.url
        }}/>
    </p>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

const SessionRow = function(props) {
  return <tr className={props.session.today ? 'success' : ''}>
    <td>{props.session.name}</td>
    <td><Timespan
      weekday={props.session.weekday}
      start={props.session.startTime}
      end={props.session.endTime}/></td>
    <td>{props.session.location}</td>
    <td>{props.session.assistants}</td>
  </tr>;
};

// ********************************************************************************************************************

const TeacherRow = function(props) {
  if (props.isTeacher) {
    return <p><FormattedHTMLMessage id="sessions-modify-link" values={{
        url: '/neuvontajono/settings'
      }}/></p>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

export function Sessions(props) {
  return <div>
    <p>
      <FormattedMessage id="sessions-main-text"/>
    </p>
    <AdditionalInformation url={props.view.url}/>

    <table className="table">
      <thead>
        <tr>
          <th><FormattedMessage id="select-th-name"/></th>
          <th><FormattedMessage id="select-th-time"/></th>
          <th><FormattedMessage id="select-th-location"/></th>
          <th><FormattedMessage id="select-th-staff"/></th>
        </tr>
      </thead>
      <tbody>
        {props.view.sessions.map((session) => <SessionRow key={session._id} session={session}/>)}
      </tbody>
    </table>

    <TeacherRow isTeacher={props.view.isTeacher}/>

  </div>;
}
