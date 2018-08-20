'use strict';

const keystone = require('keystone');

exports = module.exports = function(req, res) {

  const view = new keystone.View(req, res);
  const locals = res.locals;
  locals.reactData.app.view = 'index';

  if (locals.course) {
    res.redirect('/neuvontajono/queue');
    return;
  }

  view.render('reactView', locals);

};
