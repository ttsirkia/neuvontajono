'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {injectIntl} from 'react-intl';
import moment from 'moment';

/********************************************************************
 *  ModifySession is the view for creating a new session or
 *  modifying an existing session.
 *******************************************************************/

const Header = function(props) {
  if (props.createNew) {
    return <h3><FormattedMessage id="modify-create-title"/></h3>;
  } else {
    return <h3><FormattedMessage id="modify-edit-title"/></h3>;
  }
};

// ********************************************************************************************************************

export class ModifySession_ extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      startTime: this.transformTime(props.view.startTime) || '',
      queueOpenTime: this.transformTime(props.view.queueOpenTime) || '',
      participationPolicy: props.view.participationPolicy,
      courseParticipationPolicy: props.view.courseParticipationPolicy
    };
    this.state.queueOpenTimeChanged = this.state.queueOpenTime !== '';

    this.handleStartTime = this.handleStartTime.bind(this);
    this.handleQueueOpenTime = this.handleQueueOpenTime.bind(this);
    this.transformDate = this.transformDate.bind(this);
    this.transformTime = this.transformTime.bind(this);
    this.handlePolicyChange = this.handlePolicyChange.bind(this);

  }

  // **********************************************************************************************

  handlePolicyChange(event) {
    this.setState({participationPolicy: +event.target.value});
  }

  // **********************************************************************************************

  handleStartTime(event) {
    // Default value for queue open time will be starting time
    const value = event.target.value;
    this.setState((prevState) => {
      const newQueueOpenTime = prevState.queueOpenTimeChanged ? prevState.queueOpenTime : value;
      return {startTime: value, queueOpenTime: newQueueOpenTime};
    });
  }

  // **********************************************************************************************

  handleQueueOpenTime(event) {
    this.setState({queueOpenTime: event.target.value, queueOpenTimeChanged: true});
  }

  // **********************************************************************************************

  componentDidMount() {
    $('.calendar').datetimepicker({
      locale: this.props.view.UILanguage,
      format: this.props.intl.formatMessage({id: 'date-input-format'})
    });
  }

  // **********************************************************************************************

  transformDate(value) {
    if (!value) {
      return '';
    }
    const dateFormat = this.props.intl.formatMessage({id: 'date-input-format'});
    return moment(value).format(dateFormat);
  }

  transformTime(value) {
    if (value === undefined) {
      return '';
    }
    const timeFormat = this.props.intl.formatMessage({id: 'time-input-format'});
    return moment().startOf('day').add(value, 'm').format(timeFormat);
  }

  // **********************************************************************************************

  render() {

    const actionURL = this.props.view.createNew ? '/neuvontajono/sessions/create' : `/neuvontajono/sessions/${this.props.view.sessionId}/edit`;
    const weekdays = this.props.intl.formatMessage({id: 'weekdays-order'}).split(',');
    const weekdayNames = this.props.intl.formatMessage({id: 'weekdays-long'}).split(',');
    const weekdayOptions = weekdays.map((item) => <option key={item} value={item}>{weekdayNames[item]}</option>);

    return <div>
      <Header createNew={this.props.view.createNew}/>
      <form className="form-horizontal" method="post" action={actionURL}>
        <input type="hidden" name="_csrf" value={this.props.view.csrf}/>
        <input type="hidden" name="dateFormat" value={this.props.intl.formatMessage({id: 'date-input-format'})}/>
        <input type="hidden" name="timeFormat" value={this.props.intl.formatMessage({id: 'time-input-format'})}/>
        <div className="form-group">
          <label htmlFor="courseName" className="col-sm-2 control-label"><FormattedMessage id="modify-name"/></label>
          <div className="col-sm-6">
            <input type="text" className="form-control" name="name" id="name" defaultValue={this.props.view.name}/>
            <p className="help-block small"><FormattedMessage id="modify-name-help"/></p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="participationPolicy" className="col-sm-2 control-label"><FormattedMessage id="settings-participation-policy"/></label>
          <div className="col-sm-6">
            <select name="participationPolicy" onChange={this.handlePolicyChange} value={this.state.participationPolicy}>
              <option value="0">{this.props.intl.formatMessage({id: 'settings-participation-policy-0'})}</option>
              <option value="1">{this.props.intl.formatMessage({id: 'settings-participation-policy-1'})}</option>
              <option value="2">{this.props.intl.formatMessage({id: 'settings-participation-policy-2'})}</option>
              <option value="3">{this.props.intl.formatMessage({id: 'settings-participation-policy-3'})}</option>
            </select>            
          </div>
        </div>
        
        {(this.state.participationPolicy === 1 || this.state.participationPolicy === 3 ||
         (this.state.participationPolicy === 0 && this.state.courseParticipationPolicy === 1) ||
         (this.state.participationPolicy === 0 && this.state.courseParticipationPolicy === 3)) &&
        <div className="form-group">
          <label htmlFor="location" className="col-sm-2 control-label"><FormattedMessage id="modify-location"/></label>
          <div className="col-sm-6">
            <input type="text" className="form-control" name="location" id="location" defaultValue={this.props.view.location}/>
            <p className="help-block small"><FormattedMessage id="modify-location-help"/></p>
          </div>
        </div>
        }

        {(this.state.participationPolicy === 2 || this.state.participationPolicy === 3 ||
         (this.state.participationPolicy === 0 && this.state.courseParticipationPolicy === 2) ||
         (this.state.participationPolicy === 0 && this.state.courseParticipationPolicy === 3)) &&
        <div className="form-group">
          <label htmlFor="location" className="col-sm-2 control-label"><FormattedMessage id="modify-remote-method"/></label>
          <div className="col-sm-6">
            <input type="text" className="form-control" name="remoteMethod" id="remoteMethod" defaultValue={this.props.view.remoteMethod}/>
            <p className="help-block small"><FormattedMessage id="modify-remote-method-help"/></p>
          </div>
        </div>
        }

        <div className="form-group">
          <label htmlFor="assistants" className="col-sm-2 control-label"><FormattedMessage id="modify-staff"/></label>
          <div className="col-sm-6">
            <input
              type="text"
              className="form-control"
              name="assistants"
              id="assistants"
              defaultValue={this.props.view.assistants}/>
            <p className="help-block small"><FormattedMessage id="modify-staff-help"/></p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="language" className="col-sm-2 control-label"><FormattedMessage id="modify-language"/></label>
          <div className="col-sm-6">
            <input type="text" className="form-control" name="language" id="language" defaultValue={this.props.view.language}/>
            <p className="help-block small"><FormattedMessage id="modify-language-help"/></p>
          </div>
        </div>            

        <hr/>

        <div className="form-group">
          <label htmlFor="weekday" className="col-sm-2 control-label"><FormattedMessage id="modify-weekday"/></label>
          <div className="col-sm-6">
            <select name="weekday" defaultValue={this.props.view.weekday}>
              {weekdayOptions}
            </select>
          </div>
        </div>

        <hr/>

        <div className="form-group">
          <label htmlFor="startDate" className="col-sm-2 control-label"><FormattedMessage id="modify-start-date"/></label>
          <div className="col-sm-4">
            <input
              type="text"
              className="form-control calendar"
              name="startDate"
              id="startDate"
              defaultValue={this.transformDate(this.props.view.startDate)}/>
            <p className="help-block small"><FormattedMessage id="modify-date-help"/></p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="endDate" className="col-sm-2 control-label"><FormattedMessage id="modify-end-date"/></label>
          <div className="col-sm-4">
            <input
              type="text"
              className="form-control calendar"
              name="endDate"
              id="endDate"
              defaultValue={this.transformDate(this.props.view.endDate)}/>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <div className="checkbox">
              <label>
                <input type="checkbox" name="active" value="active" id="active" defaultChecked={this.props.view.active}/>
                <FormattedMessage id="modify-in-use"/>
              </label>
              <p className="help-block small"><FormattedMessage id="modify-in-use-help"/></p>
            </div>
          </div>
        </div>
        <hr/>

        <div className="form-group">
          <label htmlFor="startTime" className="col-sm-2 control-label"><FormattedMessage id="modify-start-time"/></label>
          <div className="col-sm-3">
            <input
              type="text"
              className="form-control"
              name="startTime"
              id="startTime"
              value={this.state.startTime}
              onChange={this.handleStartTime}/>
            <p className="help-block small"><FormattedMessage id="modify-time-help"/></p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="endTime" className="col-sm-2 control-label"><FormattedMessage id="modify-end-time"/></label>
          <div className="col-sm-3">
            <input
              type="text"
              className="form-control"
              name="endTime"
              id="endTime"
              defaultValue={this.transformTime(this.props.view.endTime)}/>
          </div>
        </div>

        <hr/>

        <div className="form-group">
          <label htmlFor="queueOpenTime" className="col-sm-2 control-label"><FormattedMessage id="modify-queue-open-time"/></label>
          <div className="col-sm-3">
            <input
              type="text"
              className="form-control"
              name="queueOpenTime"
              id="queueOpenTime"
              value={this.state.queueOpenTime}
              onChange={this.handleQueueOpenTime}/>
          </div>
        </div>

        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <button type="submit" name="action" value="save" className="btn btn-primary"><FormattedMessage id="save"/></button>
            <a href="/neuvontajono/settings" className="btn btn-danger"><FormattedMessage id="cancel"/></a>
          </div>
        </div>
      </form>
    </div>;
  }
}

// ********************************************************************************************************************

const ModifySession = injectIntl(ModifySession_);

export {
  ModifySession
};
