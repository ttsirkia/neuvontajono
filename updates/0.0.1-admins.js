// Creates admin account if a new database is created

exports.create = {
	User: [
		{ 'name.first': 'Admin', 'name.last': 'User', email: 'admin@example.com', password: 'password', isAdmin: true, ltiId: 'admin' }
	]
};
