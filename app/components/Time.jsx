'use strict';

import React from 'react';
import {injectIntl} from 'react-intl';
import moment from 'moment';

/********************************************************************
 *  Time renders a localized time string.
 *  Value represents minutes after midnight.
 *******************************************************************/

const Time_ = function(props) {
  const timeFormat = props.intl.formatMessage({id: 'time-output-format'});
  const time = moment().startOf('day').add(props.value, 'm').format(timeFormat);
  return <span>{time}</span>;
};

const Time = injectIntl(Time_);

export {
  Time
};
