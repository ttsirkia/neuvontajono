var keystone = require('keystone');
var findOrCreate = require('mongoose-findorcreate');
  
var Types = keystone.Field.Types;
var Participant = new keystone.List('Participant');

Participant.add({
  user: { type: Types.Relationship, initial: true, required: true, ref: 'User' },
  course: { type: Types.Relationship, initial: true, required: true, ref: 'Course' },
  session: { type: Types.Relationship, initial: true, required: true, ref: 'Session' },
  date: { type: Types.Date, required: true, 'default': Date.now },
  enteredAt: { type: Types.NumberArray }
});

Participant.schema.plugin(findOrCreate);
Participant.register();
