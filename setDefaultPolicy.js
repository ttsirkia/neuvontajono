'use strict';

// Use this tool to change the default participation mode for all courses

const mongoose = require('mongoose');
const keystone = require('keystone');

// ************************************************************************************************

keystone.init({ 'name': 'Neuvontajono' });
keystone.import('models');

// ************************************************************************************************

const Course = keystone.list('Course');

// ************************************************************************************************
if (process.argv.length >= 3) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/neuvontajono', { useMongoClient: true });
  mongoose.connection.once('open', function() {

    Course.model.updateMany({}, { participationPolicy: process.argv[2] }).exec(function(err, res) {
      if (!err) {
        console.log('OK!');
        console.log(res.nModified + ' courses changed.');
        process.exit(0);
      } else {
        console.log(err);
        process.exit(1);
      }
    });

  });
} else {
  console.log('Missing the default mode parameter.');
  console.log('1=local, 2=remote, 3=both');
}
