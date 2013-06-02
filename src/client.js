/* Index */

var Q = require('q');
var IS = require('./is.js');
var HTTPError = require('./errors.js').HTTPError;
var mod = module.exports = {};

/* */
function parse_by_content_type(type, body) {
	if(type === 'application/json') {
		return JSON.parse(body);
	}
	if(type === 'text/plain') {
		return ''+body;
	}
	return body;
}

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

		var content_type = (res && res.headers && res.headers['content-type']) ? res.headers['content-type'] : 'application/json';

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
					throw new HTTPError(parse_by_content_type(content_type, buffer));
				} else {
					throw new Error('Connection closed before end event!');
				}
			} catch(e) {
				defer.reject(e);
			}
		});
		res.on('end', function() {
			try {
				if(res.statusCode !== 200) {
					throw new HTTPError(parse_by_content_type(content_type, buffer));
				} else {
					var reply = parse_by_content_type(content_type, buffer);
					if(reply && (typeof reply === 'object')) {
						reply.$ = {
							statusCode: res.statusCode,
							headers: res.headers
						};
					}
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
