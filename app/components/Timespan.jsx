'use strict';

import React from 'react';
import {Weekday} from './Weekday';
import {Time} from './Time';

/********************************************************************
 *  Timespan renders a localized time string containing
 *  weekday, two start times and end time.
 *******************************************************************/

export function Timespan(props) {
  const weekday = props.weekday !== undefined ? <Weekday weekday={props.weekday}/> : null;
  const preStart = props.preStart !== undefined && props.preStart !== props.start ? <Time value={props.preStart}/> : null;
  const start = <Time value={props.start}/>;
  const end = <Time value={props.end}/>;
  return <React.Fragment>{weekday}{' '}{preStart ? '(' : ''}{preStart}{preStart ? ') - ' : ''}{start}{' - '}{end}</React.Fragment>;
}
