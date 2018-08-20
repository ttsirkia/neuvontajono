'use strict';

import React from 'react';
import {injectIntl} from 'react-intl';

/********************************************************************
 *  Weekday renders a localized weekday string.
 *  0=Sunday, 6=Saturday
 *******************************************************************/

const Weekday_ = function(props) {
  const weekdays = props.intl.formatMessage({id: 'weekdays-short'}).split(',');
  return <span>{weekdays[props.weekday]}</span>;
};

const Weekday = injectIntl(Weekday_);

export {
  Weekday
};
