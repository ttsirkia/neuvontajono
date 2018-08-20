'use strict';

import React from 'react';
import {injectIntl} from 'react-intl';

/********************************************************************
 *  Alerts renders the flash messages
 *  on top of the application.
 *******************************************************************/

const Alert = function(props) {

  // The message in the alert is assumed to be the translation key for the actual message.

  const classes = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'danger'
  };
  return <div className={'alert alert-' + classes[props.category]}>{props.intl.formatMessage({id: props.message})}</div>;
};

const Alerts_ = function(props) {
  if (props.messages) {
    const alerts = [];
    const categories = ['info', 'success', 'warning', 'error'];
    categories.forEach((name) => {
      if (props.messages[name]) {
        props.messages[name].forEach((message) => {
          alerts.push(<Alert intl={props.intl} category={name} message={message} key={name}/>);
        });
      }
    });
    return <div id="flash-messages" className="container">
      {alerts}
    </div>;
  } else {
    return null;
  }
};

const Alerts = injectIntl(Alerts_);

export {
  Alerts
};
