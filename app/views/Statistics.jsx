'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';

/********************************************************************
 *  Statistics provides the view for showing the number of participants
 *  in each session and the list of the most active participants.
 *******************************************************************/

const ColoredItem = function(props) {
  if (props.y === 0 || props.x === 0) {
    return <td>{props.item}</td>;
  } else {
    if (props.item === '-') {
      return <td>{props.item}</td>;
    } else if (props.item[0] === '<') {
      return <td className="statistics-green">{props.item}</td>;
    } else if (+props.item >= props.redLimit) {
      return <td className="statistics-red">{props.item}</td>;
    } else if (+props.item >= props.yellowLimit) {
      return <td className="statistics-yellow">{props.item}</td>;
    } else if (+props.item < props.yellowLimit) {
      return <td className="statistics-green">{props.item}</td>;
    } else {
      return <td>{props.item}</td>;
    }
  }
};

// ********************************************************************************************************************

const TableRow = function(props) {
  return <tr>
    {
      props.row.map(function(item, i) {
        return <ColoredItem redLimit={props.redLimit} yellowLimit={props.yellowLimit} key={i} x={i} y={props.y} item={item}/>;
      })
    }
  </tr>;
};

// ********************************************************************************************************************

const FrequentUsers = function(props) {
  if (props.teacher) {
    return <div>
      <hr/>

      <h3><FormattedMessage id="statistics-most-active-title"/></h3>

      <div className="alert alert-info">
        <FormattedMessage id="statistics-most-active-info"/>
      </div>

      <p>
        <FormattedMessage id="statistics-most-active-main"/>
      </p>

      <table className="table table-condensed">
        <thead>
          <tr>
            <th><FormattedMessage id="statistics-th-active-position"/></th>
            <th><FormattedMessage id="statistics-th-active-name"/></th>
            <th><FormattedMessage id="statistics-th-active-visits"/></th>
          </tr>
        </thead>
        <tbody>
          {
            props.mostFrequent.map(function(participant, i) {
              return <tr key={i}>
                <td><FormattedMessage id="ordinal-value" values={{position: participant[0]}}/></td>
                <td>{participant[1]}</td>
                <td>{participant[2]}</td>
              </tr>;
            })
          }
        </tbody>
      </table>
    </div>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

export function Statistics(props) {
  return <div>

    <p>
      <FormattedMessage id="statistics-main"/>
    </p>

    <table className="statistics-table">
      <tbody>
        {
          props.view.stats.map(
            (row, i) => <TableRow redLimit={props.view.redLimit} yellowLimit={props.view.yellowLimit} key={i} y={i} row={row}/>
          )
        }
      </tbody>
    </table>

    <FrequentUsers teacher={props.view.teacher} mostFrequent={props.view.mostFrequent}/>

  </div>;
}
