'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';

/********************************************************************
 *  Index is the main view if the user is not logged in.
 *******************************************************************/

export function Index() {
  return <div>
    <h1><FormattedMessage id="title"/></h1>

    <div className="jumbotron">
      <p>
        <FormattedMessage id="index-jumbotron-1"/>
      </p>
      <p>
        <FormattedMessage id="index-jumbotron-2"/>
      </p>
      <p>
        <FormattedMessage id="index-jumbotron-3"/>
      </p>
    </div>

    <p className="lead"><FormattedMessage id="index-lead"/></p>
  </div>;
}
