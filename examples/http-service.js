
var config = require('nor-config').from(__dirname);
config._def('port', 3000);
var api = require('nor-api');
api.createServer(config, {
	'hello': 'world',
	'date': function() {
		return ''+new Date();
	}
});
