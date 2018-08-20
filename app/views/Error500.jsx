'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';

/********************************************************************
 *  Error500 is the view for errors which can be caught without
 *  crashing the process. It also processess the CSRF errors (403).
 *******************************************************************/

const Error403 = function(props) {
  if (props.statusCode === 403) {
    return <div>
      <p class="lead"><FormattedMessage id="error-403-lead"/></p>
      <p><FormattedMessage id="error-403-help"/></p>
    </div>;
  } else {
    return null;
  }
};

const Error5xx = function(props) {
  if (props.statusCode !== 403) {
    return <p className="lead"><FormattedMessage id="error-500"/></p>;
  } else {
    return null;
  }
};

const RenderError = function(props) {
  if (props.error) {
    return <div>
      <pre className="alert alert-danger">{props.error}</pre>
      <pre>{props.stacktrace}</pre>
    </div>;
  } else {
    return null;
  }

};

export function Error500(props) {
  return <div class="container">
    <h1>{props.view.statusCode}</h1>

    <Error403 statusCode={props.view.statusCode}/>
    <Error5xx statusCode={props.view.statusCode}/>
    <RenderError error={props.view.error} stacktrace={props.view.stacktrace}/>

  </div>;
}
