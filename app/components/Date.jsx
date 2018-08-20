'use strict';

import React from 'react';
import {injectIntl} from 'react-intl';
import moment from 'moment';

/********************************************************************
 *  Date renders a localized date string.
 *******************************************************************/

const Date_ = function(props) {
  const dateFormat = props.intl.formatMessage({id: 'date-output-format'});
  const date = moment(props.value).format(dateFormat);
  return <span>{date}</span>;
};

const DateString = injectIntl(Date_);

export {
  DateString
};
