'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';

/********************************************************************
 *  Tabs render the main navigation below the course name.
 *******************************************************************/

export function Tabs(props) {

  if (!props.course) {
    return null;
  }

  // Role can be staff or teacher

  const tabs = [
    {
      href: '/neuvontajono/queue',
      name: 'tabs-queue'
    }, {
      href: '/neuvontajono/sessions',
      name: 'tabs-sessions'
    }, {
      href: '/neuvontajono/statistics',
      name: 'tabs-statistics',
      role: props.statisticsLevel
    }, {
      href: '/neuvontajono/selectSession',
      name: 'tabs-selectSession',
      role: 'staff'
    }, {
      href: '/neuvontajono/settings',
      name: 'tabs-settings',
      role: 'teacher'
    }
  ];

  const Tab = function(props) {
    let cName = '';
    if ('tabs-' + props.view === props.name || 'tabs-' + props.selected === props.name) {
      cName = 'active';
    }
    return <li className={cName}>
      <a href={props.href}>
        <FormattedMessage id={props.name}/>
      </a>
    </li>;
  };

  return <ul className="nav nav-tabs">
    {
      tabs.map((tab) => {
        if (tab.role && tab.role !== 'any' && !props.user[tab.role]) {
          return null;
        } else {
          return <Tab key={tab.name} view={props.view} name={tab.name} href={tab.href} selected={props.selected}/>;
        }
      })
    }
  </ul>;
}
