'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';

/********************************************************************
 *  Header renders the application name and user name
 *  on the top of each page.
 *******************************************************************/

const UserName = (props) => {
  if (props.user) {
    return <span>{props.user.name}</span>;
  } else {
    return <span/>;
  }
};

export function Header(props) {
  return <nav className="navbar navbar-default navbar-static-top">
    <div className="container">
      <div className="navbar-header">
        <a className="navbar-brand"><FormattedMessage id="title"/></a>
      </div>
      <p className="navbar-text navbar-right"><UserName user={props.user}/></p>
    </div>
  </nav>;
}
