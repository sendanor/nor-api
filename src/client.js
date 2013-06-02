/* Index */

var Q = require('q');
var IS = require('./is.js');
var mod = module.exports = {};

/** Create HTTP request
 * @param opts string|object URL as parsed object or string.
 * @returns Q-based promise with parsed JSON reply.
 */
mod.request = function(opts) {
	var defer = Q.defer();
	var options = require('url').parse(opts);
	if(!options.method) {
		options.method = 'GET';
	}
	var req = require('http').request(options, function(res) {
		var buffer = '';
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));

	 	res.setEncoding('utf8');
		res.on('data', function (chunk) {
			buffer += chunk;
		});
		res.on('error', function(error) {
			defer.reject(error);
		});
		res.on('close', function() {
			try {
				if(res.statusCode !== 200) {
					defer.reject('Status code was ' + res.statusCode + ': ' + buffer);
				} else {
					defer.reject('Connection closed before end event!');
				}
			} catch(e) {
				defer.reject(e);
			}
		});
		res.on('end', function() {
			try {
				if(res.statusCode !== 200) {
					defer.reject('Status code was ' + res.statusCode + ': ' + buffer);
				} else {
					var reply = JSON.parse(buffer);
					reply.$ = {
						statusCode: res.statusCode,
						headers: res.headers
					};
					defer.resolve(reply);
				}
			} catch(e) {
				defer.reject(e);
			}
		});
	});

	req.on('error', function(error) {
		defer.reject(error);
	});

	req.end();

	return defer.promise;
}; // .request

/* EOF */
