var keystone = require('keystone'), Types = keystone.Field.Types;

var Invitation = new keystone.List('Invitation');

Invitation.add({email: {type: Types.Email, initial: true, required: true},
  sentBy: {type: Types.Relationship, ref: 'User'},
  timestamp: {type: Types.Date, required: true, 'default': Date.now}
});

Invitation.register();
