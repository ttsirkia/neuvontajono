'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {injectIntl} from 'react-intl';

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

const Header_ = function(props) {

  document.title = props.intl.formatMessage({id: 'title'});

  return <nav className="navbar navbar-default navbar-static-top">
    <div className="container">
      <div className="navbar-header">
        <a className="navbar-brand"><FormattedMessage id="title"/></a>
      </div>
      <p className="navbar-text navbar-right"><UserName user={props.user}/></p>
    </div>
  </nav>;
}

const Header = injectIntl(Header_);

export {
  Header
};
