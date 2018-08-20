'use strict';

const keystone = require('keystone');
const moment = require('moment');

const Session = keystone.list('Session');
const Participant = keystone.list('Participant');

exports = module.exports = function(req, res) {

  const view = new keystone.View(req, res);
  const locals = res.locals;

  locals.weeks = [];
  locals.reactData.app.view = 'statistics';
  locals.reactData.view.stats = [];
  locals.reactData.view.mostFrequent = [];
  locals.reactData.view.yellowLimit = locals.course.yellowLimit;
  locals.reactData.view.redLimit = locals.course.redLimit;
  locals.reactData.view.teacher = locals.teacher === true;

  view.on('init', function(next) {

    if (locals.course.statisticsLevel < 0 || (locals.course.statisticsLevel === 2 && !locals.teacher) || (locals.course.statisticsLevel === 1 && !locals.staff)) {
      req.flash('error', 'alert-statistics-no-permission');
      res.redirect('/neuvontajono');
    } else {
      next();
    }

  });

  view.on('get', function(next) {
    Session.model.find({ course: locals.course._id }).sort({ 'weekday': 1, 'startTime': 1 }).exec(function(err, sessions) {

      if (!err) {

        const startDates = [];
        const endDates = [];
        const names = {};
        const stats = {};
        const weeks = [];
        const sessionIdList = [];

        sessions.forEach(function(session) {

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
          stats[session._id] = {};
          sessionIdList.push(session._id);

          const week = moment(startTime);
          const endWeek = endTime;

          // Generate all weeks when this session is organized
          while (week.isBefore(endWeek) && moment().isAfter(week)) {
            stats[session._id][week.format('W/YYYY')] = 0;
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

        Participant.model.find({ course: locals.course._id }, function(err, participants) {

          if (!err) {

            participants.forEach(function(participant) {

              if (!stats[participant.session]) {
                return; // Session does not exist anymore
              }

              const week = moment(participant.date).format('W/YYYY');

              if (!stats[participant.session][week]) {
                stats[participant.session][week] = 0;
              }

              stats[participant.session][week]++;

            });

            let weekNames = [''];
            Array.prototype.push.apply(weekNames, weeks);

            weekNames = weekNames.map(function(item) {
              return item.split('/')[0];
            });


            locals.reactData.view.stats.push(weekNames);

            // Collect data

            sessionIdList.forEach(function(id) {

              const participantsTotal = [names[id]];

              weeks.forEach(function(week) {
                if (stats[id][week] !== undefined) {
                  if (locals.staff || stats[id][week] >= 5) {
                    participantsTotal.push(stats[id][week]);
                  } else {
                    participantsTotal.push('<5');
                  }
                } else {
                  participantsTotal.push('-');
                }
              });

              locals.reactData.view.stats.push(participantsTotal);

            });

          } else {
            req.flash('error', 'alert-statistics-load-failed');
          }

          if (locals.teacher) {
            Participant.model.getMostFrequentUsers(locals.course, function(err, result) {
              locals.reactData.view.mostFrequent = result || [];
              next();
            });
          } else {
            next();
          }

        });

      } else {

        req.flash('error', 'alert-statistics-load-failed');

      }

    });
  });

  view.render('reactView', locals);

};
