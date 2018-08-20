'use strict';

import React from 'react';
import {DateString} from './Date';

/********************************************************************
 *  Datespan renders a localized time string containing
 *  weekday, two start times and end time.
 *******************************************************************/

export function Datespan(props) {
  const start = <DateString value={props.start}/>;
  const end = <DateString value={props.end}/>;
  return <React.Fragment>{start}{' - '}{end}</React.Fragment>;
}
