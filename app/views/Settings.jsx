'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {FormattedHTMLMessage} from 'react-intl';
import {injectIntl} from 'react-intl';

import {Timespan} from '../components/Timespan';
import {Datespan} from '../components/Datespan';

/********************************************************************
 *  Settings provides the view for changing the course settings and
 *  a list of sessions to create, modify, and remove them.
 *******************************************************************/

const GeneralSettings = function(props) {
  return <form className="form-horizontal" method="post" action="/neuvontajono/settings">

    <h3><FormattedMessage id="settings-title"/></h3>

    <input type="hidden" name="_csrf" value={props.csrf}/>
    <div className="form-group">
      <label htmlFor="courseName" className="col-sm-2 control-label"><FormattedMessage id="settings-course-name"/></label>
      <div className="col-sm-6">
        <input type="text" className="form-control" name="name" id="courseName" defaultValue={props.course.name}/>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="courseId" className="col-sm-2 control-label"><FormattedMessage id="settings-course-id"/></label>
      <div className="col-sm-6">
        <p id="courseId" className="form-control-static">{props.course.courseId}</p>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="courseURL" className="col-sm-2 control-label"><FormattedMessage id="settings-course-url"/></label>
      <div className="col-sm-6">
        <input type="text" className="form-control" name="url" id="courseURL" defaultValue={props.course.url}/>
        <p className="help-block small"><FormattedMessage id="settings-course-url-help"/></p>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="combined" className="col-sm-2 control-label"><FormattedMessage id="settings-combine"/></label>
      <div className="col-sm-6">
        <input type="text" className="form-control" name="combined" id="combined" defaultValue={props.course.combined}/>
        <p className="help-block small">
          <FormattedMessage id="settings-combine-help"/>
        </p>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="projectorConf" className="col-sm-2 control-label"><FormattedMessage id="settings-projector"/></label>
      <div className="col-sm-6">
        <input
          type="text"
          className="form-control"
          name="projectorConf"
          id="projectorConf"
          defaultValue={props.course.projectorConf}/>
        <p className="help-block small"><FormattedHTMLMessage
          id="settings-projector-help"
          values={{
      url: 'https://github.com/ttsirkia/neuvontajono/blob/master/README.md#projector-configuration'
    }}/></p>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="defaultLanguage" className="col-sm-2 control-label"><FormattedMessage id="settings-default-language"/></label>
      <div className="col-sm-6">
        <select name="defaultLanguage" defaultValue={props.course.defaultLanguage}>
          {props.languages.map((language) => <option key={language} value={language}>{language}</option>)}
        </select>
        <p className="help-block small"><FormattedHTMLMessage id="settings-default-language-help"/></p>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="participationPolicy" className="col-sm-2 control-label"><FormattedMessage id="settings-participation-policy"/></label>
      <div className="col-sm-6">
        <select name="participationPolicy" defaultValue={props.course.participationPolicy}>
          <option value="1">{props.intl.formatMessage({id: 'settings-participation-policy-1'})}</option>
          <option value="2">{props.intl.formatMessage({id: 'settings-participation-policy-2'})}</option>
          <option value="3">{props.intl.formatMessage({id: 'settings-participation-policy-3'})}</option>
        </select>
        <p className="help-block small"><FormattedMessage id="settings-participation-policy-help"/></p>
      </div>
    </div>

    <hr/>

    <div className="form-group">
      <label htmlFor="statisticsLevel" className="col-sm-2 control-label"><FormattedMessage id="settings-statistics-visibility"/></label>
      <div className="col-sm-6">
        <select name="statisticsLevel" defaultValue={props.course.statisticsLevel}>
          <option value="-1">{props.intl.formatMessage({id: 'settings-statistics--1'})}</option>
          <option value="0">{props.intl.formatMessage({id: 'settings-statistics-0'})}</option>
          <option value="1">{props.intl.formatMessage({id: 'settings-statistics-1'})}</option>
          <option value="2">{props.intl.formatMessage({id: 'settings-statistics-2'})}</option>
        </select>
        <p className="help-block small"><FormattedMessage id="settings-statistics-help"/></p>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="statisticsQueueLevel" className="col-sm-2 control-label"><FormattedMessage id="settings-statistics-queue-visibility"/></label>
      <div className="col-sm-6">
        <select name="statisticsQueueLevel" defaultValue={props.course.statisticsQueueLevel}>
          <option value="0">{props.intl.formatMessage({id: 'settings-statistics-0'})}</option>
          <option value="1">{props.intl.formatMessage({id: 'settings-statistics-1'})}</option>
          <option value="2">{props.intl.formatMessage({id: 'settings-statistics-2'})}</option>
        </select>
        <p className="help-block small"><FormattedMessage id="settings-statistics-queue-help"/></p>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="statisticsGraphLevel" className="col-sm-2 control-label"><FormattedMessage id="settings-statistics-graph-visibility"/></label>
      <div className="col-sm-6">
        <select name="statisticsGraphLevel" defaultValue={props.course.statisticsGraphLevel}>
          <option value="0">{props.intl.formatMessage({id: 'settings-statistics-0'})}</option>
          <option value="1">{props.intl.formatMessage({id: 'settings-statistics-1'})}</option>
          <option value="2">{props.intl.formatMessage({id: 'settings-statistics-2'})}</option>
        </select>
        <p className="help-block small"><FormattedMessage id="settings-statistics-graph-help"/></p>
      </div>
    </div>

    <div className="form-group">
      <div className="col-sm-offset-2 col-sm-10">
        <button type="submit" name="action" value="saveSettings" className="btn btn-primary"><FormattedMessage id="save"/></button>
      </div>
    </div>

  </form>;
};

// ********************************************************************************************************************

const SessionRow = function(props) {

  const cName = props.session.active ? '' : 'inactive-session';

  const deleteHandler = function(e) {
    if (!confirm(props.intl.formatMessage({id: 'settings-delete-confirm'}))) {
      e.preventDefault();
    }
  };

  return <>
    <tr className={cName}>
    <td>{props.session.name}</td>
    <td><Datespan start={props.session.startDate} end={props.session.endDate}/></td>
    <td><Timespan
      weekday={props.session.weekday}
      preStart={props.session.queueOpenTime}
      start={props.session.startTime}
      end={props.session.endTime}/></td>
    <td>{props.session.location}</td>
    
    <td>{props.session.language}</td>
    <td>
      <a href={`/neuvontajono/sessions/${props.session.id}/edit`} className="btn btn-xs btn-primary"><FormattedMessage id="edit"/></a>
      <button
        onClick={deleteHandler}
        name="sessionId"
        value={props.session.id}
        className="btn btn-xs btn-danger delete-session"><FormattedMessage id="delete"/></button>
    </td>
  </tr>
  <tr>
    <td className="details-row" colSpan="6">
      <FormattedMessage id="select-th-staff"/>{': '}
      {props.session.assistants}
    </td>
  </tr>
  <tr>
    <td className="details-row" colSpan="6">
    <FormattedMessage id="settings-participation-policy"/>{' '}
    {props.intl.formatMessage({id: 'settings-participation-policy-' + props.session.participationPolicy})}
    </td>
  </tr>
  </>;
};

// ********************************************************************************************************************

const Sessions = function(props) {
  return <form action="/neuvontajono/settings" method="post" style={{marginTop: '30px'}}>
    <hr/>
    <h3><FormattedMessage id="settings-sessions-title"/></h3>
    <input type="hidden" name="action" value="remove"/>
    <input type="hidden" name="_csrf" value={props.csrf}/>
    <table className="table">
      <thead>
        <tr>
          <th><FormattedMessage id="select-th-name"/></th>
          <th><FormattedMessage id="settings-th-span"/></th>
          <th><FormattedMessage id="select-th-time"/></th>
          <th><FormattedMessage id="select-th-location"/></th>
          <th><FormattedMessage id="select-th-language"/></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.sessions.map((session) => <SessionRow intl={props.intl} session={session} key={session.id}/>)}
      </tbody>
    </table>
  </form>;
};

// ********************************************************************************************************************

const SessionActions = function(props) {
  return <form action="/neuvontajono/settings" method="post">
    <input type="hidden" name="_csrf" value={props.csrf}/>
    <p>
      <a href="/neuvontajono/sessions/create" className="btn btn-success"><FormattedMessage id="create"/></a>
    </p>
    <p style={{
        marginTop: '25px'
      }}>
      <FormattedMessage id="settings-actions-help"/>
    </p>
    <p>
      <button name="action" value="disableAll" className="btn btn-primary"><FormattedMessage id="disable-all"/></button>
      <button name="action" value="enableAll" className="btn btn-primary"><FormattedMessage id="enable-all"/></button>
    </p>
  </form>;
};

// ********************************************************************************************************************

function Settings_(props) {
  return <div>
    <GeneralSettings course={props.view.course} csrf={props.view.csrf} intl={props.intl} languages={props.view.languages}/>
    <Sessions intl={props.intl} csrf={props.view.csrf} sessions={props.view.sessions}/>
    <SessionActions csrf={props.view.csrf}/>
  </div>;
}

// ********************************************************************************************************************

const Settings = injectIntl(Settings_);

export {
  Settings
};
