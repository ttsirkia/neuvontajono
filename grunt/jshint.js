module.exports = {
	options: {
		reporter: require('jshint-stylish'),
		force: true
	},
	all: [ 'routes/**/*.js', 'models/**/*.js', 'public/scripts/m*.js', 'public/scripts/q*.js', 'public/scripts/s*.js'
	],
	server: [
		'./keystone.js'
	]
}
