'use strict';

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {injectIntl} from 'react-intl';

/********************************************************************
 *  Statistics provides the view for showing the number of participants
 *  and other numerical data as well as the list of the most active
 *  participants.
 *******************************************************************/

const ColoredItem = function(props) {

  function createSpan(text) {
    return <span
      style={{
        cursor: 'default'
      }}
      onMouseEnter={(e) => props.showTooltip(e, props.item[props.item.length - 1])}
      onMouseLeave={props.hideTooltip}>{text}</span>;
  }

  if (props.y === 0 || props.x === 0) {
    return <td>{props.item}</td>;
  } else {
    const item = props.item[props.index];
    const color = props.color[props.index];
    const colors = ['green', 'yellow', 'red'];
    if (colors.indexOf(color) >= 0) {
      return <td className={'statistics-' + color}>{createSpan(item)}</td>;
    } else {
      return <td>{createSpan(item)}</td>;
    }
  }
};

// ********************************************************************************************************************

class Tooltip extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidUpdate() {

    if (!this.props.data || !this.props.data.stats || this.props.data.stats.length < 1 || this.props.data.stats === '-') {
      return;
    }

    /* Data is in format "234|5" in which the first part is minutes after
     * midnight and the second if the length of the queue.
    */

    const data = this.props.data.stats.map(function(x) {
      const parts = x.split('|');
      const hours = ~~(+parts[0] / 60);
      let minutes = +parts[0] % 60;
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      return hours + ':' + minutes + '|' + parts[1];
    });

    const svg = d3.select('#tooltip-svg');
    const margin = {
      top: 10,
      right: 25,
      bottom: 20,
      left: 25
    };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const parseTime = d3.timeParse('%H:%M');
    const x = d3.scaleTime().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);
    const line = d3.line().x(function(d) {
      return x(parseTime(d.split('|')[0]));
    }).y(function(d) {
      return y(+d.split('|')[1]);
    });

    x.domain(d3.extent(data, function(d) {
      return parseTime(d.split('|')[0]);
    })).nice();

    y.domain([
      0,
      d3.max(data, function(d) {
        return + d.split('|')[1];
      })
    ]).nice();

    const xAxis = d3.axisBottom().scale(x).ticks(5).tickFormat(d3.timeFormat('%H:%M'));
    const yAxis = d3.axisLeft(y).ticks(5);

    var makeXAxisForGrid = function(y, axis) {
      return d3.axisTop().scale(y).tickValues(axis.tickValues());
    };

    var makeYAxisForGrid = function(y, axis) {
      return d3.axisLeft().scale(y).tickValues(axis.tickValues());
    };

    g.append('g').attr('class', 'grid').call(makeXAxisForGrid(x, xAxis).tickSize(-height, 0, 0).tickFormat('')).select(
      '.domain '
    ).remove();
    g.append('g').attr('class', 'grid').call(makeYAxisForGrid(y, yAxis).tickSize(-width, 0, 0).tickFormat('')).select(
      '.domain '
    ).remove();
    g.append('g').attr('transform', 'translate(0,' + height + ')').call(xAxis);
    g.append('g').call(yAxis);

    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#007').attr('stroke-width', 1.5).attr('d', line);

  }

  render() {
    if (!this.props.data || !this.props.data.stats || this.props.data.stats.length < 1 || this.props.data.stats === '-') {
      return null;
    }
    return <div id="tooltip" style={{
        top: this.props.data.y,
        left: this.props.data.x
      }}>
      <div style={{
          fontSize: '13px',
          fontWeight: 'bold'
        }}><FormattedMessage id="statistics-queue-graph"/></div>
      <svg id="tooltip-svg" width="400" height="200"></svg>
    </div>;
  }
}

// ********************************************************************************************************************

const TableRow = function(props) {
  return <tr>
    {
      props.row.map(function(item, i) {
        return <ColoredItem
          redLimit={props.redLimit}
          yellowLimit={props.yellowLimit}
          key={i}
          x={i}
          y={props.y}
          item={item}
          color={props.colors[i]}
          index={props.index}
          showTooltip={props.showTooltip}
          hideTooltip={props.hideTooltip}/>;
      })
    }
  </tr>;
};

// ********************************************************************************************************************

const FrequentUsers = function(props) {
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
              <td><FormattedMessage id="ordinal-value" values={{
                position: participant[0]
              }}/></td>
              <td>{participant[1]}</td>
              <td>{participant[2]}</td>
            </tr>;
          })
        }
      </tbody>
    </table>
  </div>;
};

// ********************************************************************************************************************

export class Statistics_ extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      tooltip: null
    };

    this.selectionChange = this.selectionChange.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);

  }

  selectionChange(e) {
    this.setState({
      selectedIndex: +e.target.value.split('|')[0]
    });
  }

  showTooltip(e, stats) {
    if (!this.props.view.showGraph) {
      return;
    }
    this.setState({
      tooltip: {
        x: (e.pageX + 30) + 'px',
        y: (e.pageY - 100) + 'px',
        stats: stats
      }
    });
  }

  hideTooltip() {
    this.setState({tooltip: null});
  }

  render() {
    return <div>

      {
        this.props.view.datasetNames.length > 1 && <div>
            <select onChange={this.selectionChange}>
              {
                this.props.view.datasetNames.map(
                  (name, index) => <option key={`${name}`} value={`${index}|${name}`}>{this.props.intl.formatMessage({id: name})}</option>
                )
              }
            </select>
          </div>
      }

      <h3><FormattedMessage id={this.props.view.datasetNames[this.state.selectedIndex]}/></h3>

      <p>
        <FormattedMessage id={this.props.view.datasetNames[this.state.selectedIndex] + '-lead'}/>
      </p>

      {
        this.props.view.showGraph && <p>
            <FormattedMessage id="statistics-queue-graph-lead"/>
          </p>
      }

      <table className="statistics-table">
        <tbody>
          {
            this.props.view.stats.map(
              (row, i) => <TableRow
                redLimit={this.props.view.redLimit}
                yellowLimit={this.props.view.yellowLimit}
                index={this.state.selectedIndex}
                key={i}
                y={i}
                row={row}
                colors={this.props.view.colors[i]}
                showTooltip={this.showTooltip}
                hideTooltip={this.hideTooltip}/>
            )
          }
        </tbody>
      </table>

      {
        this.props.view.teacher && this.props.view.mostFrequent && this.props.view.mostFrequent.length > 0 && <div>
            <FrequentUsers mostFrequent={this.props.view.mostFrequent}/>
          </div>
      }

      <Tooltip data={this.state.tooltip}/>

    </div>;
  }
}

// ********************************************************************************************************************

const Statistics = injectIntl(Statistics_);
export {
  Statistics
};
