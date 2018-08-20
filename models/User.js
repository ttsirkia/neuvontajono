'use strict';

const keystone = require('keystone');
const Types = keystone.Field.Types;
const findOrCreate = require('mongoose-findorcreate');

const User = new keystone.List('User');

//**********************************************************************************************

User.add({
  name: { type: Types.Name, required: true, index: true },
  email: { type: Types.Email, initial: true, required: true, index: true },
  password: { type: Types.Password, initial: true, required: true },
  previousLocation: { type: Types.Text, 'default': '' },
  previousRow: { type: Types.Number, 'default': 1 },
  ltiId: { type: Types.Text, required: true, initial: true, index: true },
}, 'Permissions', {
  isAdmin: { type: Boolean, label: 'Can access Keystone', index: true }
});

//**********************************************************************************************

User.schema.virtual('canAccessKeystone').get(function() {
  return this.isAdmin;
});

//**********************************************************************************************

User.schema.plugin(findOrCreate);
User.defaultColumns = 'name, email, isAdmin';
User.register();
