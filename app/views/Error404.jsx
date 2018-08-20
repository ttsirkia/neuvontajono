'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';

/********************************************************************
 *  Error404 is the view for non-existing pages.
 *******************************************************************/

export function Error404() {
  return <div className="container">
    <h1>404</h1>
    <p className="lead"><FormattedMessage id="error-404"/></p>
  </div>;
}
