/* Index */

var Q = require('q');
var api_config = require('nor-config').from(__dirname);
var IS = require('./is.js');
var helpers = require('./helpers.js');
var RequestRouter = require('./Router.js');
var api = module.exports = {};

var flags = require('./flags.js');
api.replySent = flags.replySent;
api.notFound = flags.notFound;

/** Sends successful HTTP reply */
function do_success(req, res, msg) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	msg = (typeof msg === 'string') ? msg : helpers.stringify(msg);
	res.end(msg + '\n');
}

/** Sends failed HTTP reply */
function do_failure(req, res, opts) {
	opts = opts || {};
	var obj = {
		'type': opts.type || 'error',
		'code': opts.code || 501,
		'desc': opts.desc || (''+opts)
	};

	res.writeHead(obj.code, {'Content-Type': 'application/json'});
	res.end(helpers.stringify(obj) + '\n');
}

/** Builder for generic HTTP Request Handler */
function do_create_req(config, routes) {
	routes = routes || {};

	var version = routes.version || {};
	if(version && (typeof version === 'object')) {
	} else {
		version = {'self':routes.version};
	}
	
	// If routes.version is missing, read it from the package.json of the target application.
	if(!routes.version) {
		routes.version = {
			'self': version.self || config.pkg.version,
			'api': version.api || api_config.pkg.version
		};
	}
	
	var router = new RequestRouter(routes);
	var req_counter = 0;

	/* Inner Request handler */
	function do_req(req, res) {
		req_counter += 1;
		//console.log(__filename + ': DEBUG: '+req_counter+': req.url = '+"'" + req.url + "'"); 
		return router.resolve( req, res );
	} // do_req

	return do_req;
}

/** HTTP Server Creation */
function do_create_server(config, do_req) {
	var http = require('http');
	if(config.host) {
		http.createServer(do_req).listen(config.port, config.host);
		console.log("Server running at http://"+config.host+":"+config.port+"/");
	} else {
		http.createServer(do_req).listen(config.port);
		console.log("Server running at http://0.0.0.0:"+config.port);
	}
	return http;
}

/** API server builder */
function setup_server(config, opts) {
	config._def('port', 3000);
	var req_handler = do_create_req(config, opts);
	var server = do_create_server(config, function(req, res) {
		req_handler(req, res).then(function(obj) {
			if(obj === api.replySent) {
				console.log('DEBUG: RESULT: reply was sent already: ', obj);
				return;
			} else if(obj === api.notFound) {
				console.log('DEBUG: RESULT: notFound: ', obj);
				do_failure(req, res, {'verb': 'notFound', 'desc':'The requested resource could not be found.', 'code':404});
			} else {
				console.log('DEBUG: RESULT: success: ', obj);
				do_success(req, res, obj);
			}
		}).fail(function(err) {
			do_failure(req, res, err);
			require('prettified').errors.print(err);
		}).done();
	});
	return server;
}

/** Handle the request with a first matching request handler from the list */
api.first = function(list) {
	/*
	function iterate_list(req, res) {
		var i = 0;
		function handler() {
			return Q.fcall(function() {
				if(i >= list.length) { return api.notFound; }
				var h = list[i];
				if(!IS.fun(h)) { throw new TypeError("Handler #"+i+" in api.first() was not a function!"); }
				return h(req, res).then(function(obj) {
					if(obj === api.notFound) {
						console.log('DEBUG: Not found: ', obj, ' #' + i);
						i += 1;
						return handler();
					} else {
						console.log('DEBUG: Found: ', obj, ' #' + i);
						return obj;
					}
				}); // return h(req, res)
			}); // Q.fcall
		} // handler
		return handler();
	} // iterate_list
	return iterate_list;
	*/

	function handler(req, res) {
		var init = {'type':'initial value'};
		var paths = [];

		function check_obj(obj) {
			if( (obj === api.notFound) || (obj === init) ) {
				console.log('DEBUG: Skipping: ', obj);
			} else {
				console.log('DEBUG: Found: ', obj);
				paths.push( obj );
			}
			return obj;
		}

		var p = list.map(function(f) {
			return f.bind(undefined, req, res);
		}).reduce(function (soFar, f) {
			return soFar.then(check_obj).then(f);
		}, Q.resolve(init)).then(check_obj).then(function() {
			if(paths.length === 0) {
				return api.notFound;
			}
			return paths.shift();
		});
		return p;
	}
	return handler;
}; // api.first

// Exports
api.createHandler = do_create_req;
api.createServer = setup_server;

/* EOF */
