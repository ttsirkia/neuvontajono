'use strict';

const keystone = require('keystone');
const moment = require('moment');
const _ = require('lodash');

const Session = keystone.list('Session');
const Participant = keystone.list('Participant');
const SessionStats = keystone.list('SessionStats');

exports = module.exports = function(req, res) {

  const view = new keystone.View(req, res);
  const locals = res.locals;

  locals.weeks = [];
  locals.reactData.app.view = 'statistics';
  locals.reactData.view.stats = [];
  locals.reactData.view.colors = [];
  locals.reactData.view.mostFrequent = [];
  locals.reactData.view.datasetNames = [];
  locals.reactData.view.sessionNames = [];
  locals.reactData.view.teacher = locals.teacher === true;
  locals.reactData.view.UILanguage = locals.reactData.app.language;
  locals.reactData.view.csrf = locals.csrf_token_value;
  locals.reactData.view.showParticipants = locals.course.statisticsLevel >= 0;

  locals.additionalResources = `
<script src="/neuvontajono/scripts/d3.v5.min.js"></script>
<script src="/neuvontajono/scripts/jquery-2.2.4.min.js"></script>
<script src="/neuvontajono/scripts/moment.min.js"></script>
<script src="/neuvontajono/scripts/bootstrap.transitions.min.js"></script>
<script src="/neuvontajono/scripts/bootstrap-datetimepicker.min.js"></script>
<link href="/neuvontajono/styles/bootstrap-datetimepicker.min.css" rel="stylesheet">
`;

  let priviledgeLevel = 0;
  if (locals.teacher) {
    priviledgeLevel = 2;
  } else if (locals.staff) {
    priviledgeLevel = 1;
  }

  view.on('init', function(next) {

    const permission = (locals.course.statisticsLevel >= 0 && priviledgeLevel >= locals.course.statisticsLevel) || (priviledgeLevel >= locals.course.statisticsQueueLevel);

    if (!permission) {
      req.flash('error', 'alert-statistics-no-permission');
      res.redirect('/neuvontajono');
    } else {
      next();
    }

  });

  // **********************************************************************************************

  view.on('post', { 'action': 'search' }, function() {
    const response = {
      participants: []
    };

    if (!locals.teacher || !req.body.session) {
      return res.json(response);
    } else {
      const date = req.body.date ? moment(req.body.date, [req.body.dateFormat, 'D.M.YYYY']) : moment();
      const session = req.body.session;
      Participant.model.getParticipants(locals.course._id, session, date, function(participants) {
        response.participants = participants;
        return res.json(response);
      });
    }

  });

  // **********************************************************************************************

  view.on('get', function(next) {

    Session.model.find({ course: locals.course._id }).sort({ 'weekday': 1, 'startTime': 1 }).exec(function(err1, sessions) {
      Participant.model.find({ course: locals.course._id }, function(err2, participants) {
        SessionStats.model.find({ course: locals.course._id }, function(err3, sessionStats) {

          if (err1 || err2 || err3) {
            req.flash('error', 'alert-statistics-load-failed');
            return res.redirect('/neuvontajono');
          }

          const startDates = [];
          const endDates = [];
          const names = {};
          const stats = {};
          const colors = {};
          const weeks = [];
          const sessionIdList = [];
          let weekNames = [''];

          // ********************************************************************

          const generateWeeks = function(datasets) {
            sessions.forEach(function(session) {

              locals.reactData.view.sessionNames.push({name: session.name, id: session.id});

              // Find the actual first and last date for sessions
              const startTime = moment(session.startDate).startOf('day').add(session.queueOpenTime, 'm');
              startTime.day(session.weekday);

              if (startTime.isBefore(moment(session.startDate).startOf('day'))) {
                startTime.add(1, 'w');
              }

              const endTime = moment(session.endDate).startOf('day').add(session.endTime, 'm');
              endTime.day(session.weekday);

              if (endTime.isAfter(moment(session.endDate).startOf('day').add(1, 'd'))) {
                endTime.subtract(1, 'w');
              }

              startDates.push(startTime);
              endDates.push(moment(endTime));
              names[session._id] = session.name;
              stats[session._id] = [];
              colors[session._id] = [];
              sessionIdList.push(session._id);

              for (let i = 0; i < datasets; i++) {
                stats[session._id].push({});
                colors[session._id].push({});
              }

              const week = moment(startTime);
              const endWeek = endTime;

              // Generate all weeks when this session is organized
              while (week.isBefore(endWeek) && moment().isAfter(week)) {
                for (let i = 0; i < datasets; i++) {
                  stats[session._id][i][week.format('W/YYYY')] = 0;
                  colors[session._id][i][week.format('W/YYYY')] = '-';
                }
                week.add(1, 'w');
              }

            });

            const minDay = moment.min(startDates);
            const maxDay = moment.max(endDates);
            const maxWeek = maxDay.format('W/YYYY');

            const currentWeek = moment(minDay);

            // Generate all possible weeks

            let currentWeekFormat;
            do {
              currentWeekFormat = currentWeek.format('W/YYYY');
              weeks.push(currentWeekFormat);
              currentWeek.add(1, 'w');
            } while (currentWeekFormat !== maxWeek);

            Array.prototype.push.apply(weekNames, weeks);

            weekNames = weekNames.map(function(item) {
              return item.split('/')[0];
            });

            locals.reactData.view.stats.push(weekNames);
            locals.reactData.view.colors.push(weekNames);

            // Generate the matrix to be filled with the actual data

            sessionIdList.forEach(function(id) {

              const row = [names[id]];
              const row2 = [names[id]];
              weeks.forEach(function() {
                const col = [];
                const col2 = [];
                for (let i = 0; i < datasets; i++) {
                  col.push('-');
                  col2.push('-');
                }
                row.push(col);
                row2.push(col2);
              });

              locals.reactData.view.stats.push(row);
              locals.reactData.view.colors.push(row2);

            });

          };

          // ********************************************************************

          const selectColor = function(value, values) {
            if (values.length < 4 || value < 1) {
              return 'green';
            } else if (value < values[~~(values.length * 0.75)]) {
              return 'green';
            } else if (value < values[~~(values.length * 0.9)]) {
              return 'yellow';
            } else {
              return 'red';
            }
          };

          // ********************************************************************

          const participantCount = function(index) {
            locals.reactData.view.datasetNames.push('statistics-participant-count');
            participants.forEach(function(participant) {
              if (!stats[participant.session]) {
                return; // Session does not exist anymore
              }
              const week = moment(participant.date).format('W/YYYY');
              if (!stats[participant.session][index][week]) {
                stats[participant.session][index][week] = 0;
              }
              stats[participant.session][index][week]++;
            });

            const values = [];
            sessionIdList.forEach(function(id) {
              weeks.forEach(function(week) {
                if (stats[id][index][week] > 0) {
                  values.push(stats[id][index][week]);
                }
              });
            });
            values.sort((a, b) => a - b);

            sessionIdList.forEach(function(id, i) {
              weeks.forEach(function(week, j) {
                if (stats[id][index][week] !== undefined) {
                  if (locals.staff || stats[id][index][week] >= 5) {
                    locals.reactData.view.stats[i + 1][j + 1][index] = stats[id][index][week];
                  } else {
                    locals.reactData.view.stats[i + 1][j + 1][index] = '<5';
                  }
                  locals.reactData.view.colors[i + 1][j + 1][index] = selectColor(stats[id][index][week], values);
                }
              });
            });
          };

          // ********************************************************************

          const maximumQueueDuration = function(index) {
            locals.reactData.view.datasetNames.push('statistics-maximum-queue-duration');
            sessionStats.forEach(function(sessStat) {
              const week = moment(sessStat.date).format('W/YYYY');
              if (!stats[sessStat.session][index][week]) {
                stats[sessStat.session][index][week] = 0;
              }
              stats[sessStat.session][index][week] = ((_.max(sessStat.queueDuration) || 0) / 60);
            });

            const values = [];
            sessionIdList.forEach(function(id) {
              weeks.forEach(function(week) {
                if (stats[id][index][week] > 0) {
                  values.push(stats[id][index][week]);
                }
              });
            });
            values.sort((a, b) => a - b);

            sessionIdList.forEach(function(id, i) {
              weeks.forEach(function(week, j) {
                if (stats[id][index][week] !== undefined) {
                  if (locals.staff || stats[id][index][week] < 30) {
                    locals.reactData.view.stats[i + 1][j + 1][index] = stats[id][index][week].toFixed(0);
                  } else {
                    locals.reactData.view.stats[i + 1][j + 1][index] = '>30';
                  }
                  locals.reactData.view.colors[i + 1][j + 1][index] = selectColor(stats[id][index][week], values);
                }
              });
            });
          };

          // ********************************************************************

          const queueCount = function(index) {
            locals.reactData.view.datasetNames.push('statistics-queue-count');
            sessionStats.forEach(function(sessStat) {
              const week = moment(sessStat.date).format('W/YYYY');
              if (!stats[sessStat.session][index][week]) {
                stats[sessStat.session][index][week] = 0;
              }
              stats[sessStat.session][index][week] = sessStat.queueDuration.length;
            });

            const values = [];
            sessionIdList.forEach(function(id) {
              weeks.forEach(function(week) {
                if (stats[id][index][week] > 0) {
                  values.push(stats[id][index][week]);
                }
              });
            });
            values.sort((a, b) => a - b);

            sessionIdList.forEach(function(id, i) {
              weeks.forEach(function(week, j) {
                if (stats[id][index][week] !== undefined) {
                  if (locals.staff || stats[id][index][week] >= 10) {
                    locals.reactData.view.stats[i + 1][j + 1][index] = stats[id][index][week];
                  } else {
                    locals.reactData.view.stats[i + 1][j + 1][index] = '<10';
                  }
                  locals.reactData.view.colors[i + 1][j + 1][index] = selectColor(stats[id][index][week], values);
                }
              });
            });
          };

          // ********************************************************************

          const medianQueueDuration = function(index) {
            locals.reactData.view.datasetNames.push('statistics-median-queue-duration');
            sessionStats.forEach(function(sessStat) {

              const week = moment(sessStat.date).format('W/YYYY');
              if (!stats[sessStat.session][index][week]) {
                stats[sessStat.session][index][week] = 0;
              }

              const numbers = sessStat.queueDuration.slice(0);
              let median = 0;

              if (numbers.length > 0) {
                numbers.sort((a, b) => a - b);
                if (numbers.length % 2 === 0) {
                  median = (numbers[numbers.length / 2] + numbers[(numbers.length / 2) - 1]) / 2;
                } else {
                  median = numbers[(numbers.length - 1) / 2];
                }
              }
              stats[sessStat.session][index][week] = (median / 60);
            });

            const values = [];
            sessionIdList.forEach(function(id) {
              weeks.forEach(function(week) {
                if (stats[id][index][week] > 0) {
                  values.push(stats[id][index][week]);
                }
              });
            });
            values.sort((a, b) => a - b);

            sessionIdList.forEach(function(id, i) {
              weeks.forEach(function(week, j) {
                if (stats[id][index][week] !== undefined) {
                  if (locals.staff || stats[id][index][week] < 30) {
                    locals.reactData.view.stats[i + 1][j + 1][index] = stats[id][index][week].toFixed(0);
                  } else {
                    locals.reactData.view.stats[i + 1][j + 1][index] = '>30';
                  }
                  locals.reactData.view.colors[i + 1][j + 1][index] = selectColor(stats[id][index][week], values);
                }
              });
            });
          };

          // ********************************************************************

          const queueGraph = function(index) {
            sessionStats.forEach(function(sessStat) {
              const week = moment(sessStat.date).format('W/YYYY');
              if (!stats[sessStat.session][index][week]) {
                stats[sessStat.session][index][week] = [];
              }
              stats[sessStat.session][index][week] = sessStat.queueLength;
            });

            sessionIdList.forEach(function(id, i) {
              weeks.forEach(function(week, j) {
                if (stats[id][index][week] !== undefined) {
                  locals.reactData.view.stats[i + 1][j + 1][index] = stats[id][index][week];
                }
              });
            });
          };

          // ********************************************************************

          const statsFunctions = [];

          // Which statistics the user is allowed to see?

          if (locals.course.statisticsLevel >= 0 && priviledgeLevel >= locals.course.statisticsLevel) {
            statsFunctions.push(participantCount);
          }

          if (priviledgeLevel >= locals.course.statisticsQueueLevel) {
            statsFunctions.push(medianQueueDuration);
            statsFunctions.push(maximumQueueDuration);
            statsFunctions.push(queueCount);
          }

          if (priviledgeLevel >= locals.course.statisticsGraphLevel) {
            statsFunctions.push(queueGraph);
            locals.reactData.view.showGraph = true;
          }

          generateWeeks(statsFunctions.length);

          statsFunctions.forEach(function(func, index) {
            func.call(this, index);
          });

          if (locals.teacher && locals.course.statisticsLevel >= 0) {
            Participant.model.getMostFrequentUsers(locals.course, function(err, result) {
              locals.reactData.view.mostFrequent = result || [];
              next();
            });
          } else {
            next();
          }

        });
      });
    });
  });

  view.render('reactView', locals);

};
