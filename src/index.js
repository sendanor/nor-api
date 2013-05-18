/* Index */

var Q = require('q');
var api_config = require('nor-config').from(__dirname);
var IS = require('./is.js');
var RequestRouter = require('./Router.js');
var api = module.exports = {};

var flags = require('./flags.js');
api.replySent = flags.replySent;
api.notFound = flags.notFound;

/** */
function stringify_resource(obj) {
	if(! IS.obj(obj) ) {
		return JSON.stringify(obj);
	}
	if(IS.array(obj) ) {
		return JSON.stringify(obj);
	}
	var res = {};
	Object.keys(obj).forEach(function(k) {
		var v = obj[k];
		if(IS.fun(v)) {
			res[k] = {};
		} else {
			res[k] = v;
		}
	});
	return JSON.stringify(res);
}

/** Sends successful HTTP reply */
function do_success(req, res, msg) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	msg = (typeof msg === 'string') ? msg : stringify_resource(msg);
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
	res.end(stringify_resource(obj) + '\n');
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
		console.log(__filename + ': DEBUG: '+req_counter+': req.url = '+"'" + req.url + "'"); 
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
	return do_create_server(config, function(req, res) {
		req_handler(req, res).then(function(obj) {
			if(obj === api.replySent) {
				return;
			} else if( (obj === undefined) || (obj === api.notFound) ) {
				do_failure(req, res, {'verb': 'notFound', 'desc':'The requested resource could not be found.', 'code':404});
			} else {
				do_success(req, res, obj);
			}
		}).fail(function(err) {
			do_failure(req, res, err);
		}).done();
	});
}

/** Handle the request with a first matching request handler from the list */
api.first = function(list) {
	var i = 0;
	function handler(req, res) {
		return Q.fcall(function() {
			if(i >= list.length) { return api.notFound; }
			var h = list[i];
			if(!is.fun(h)) { throw new TypeError("Handler #"+i+" in api.first() was not a function!"); }
			return h(req, res).then(function(obj) {
				if(obj === api.notFound) {
					i += 1;
					return handler(req, res);
				} else {
					return obj;
				}
			}); // return h(req, res)
		}); // Q.fcall
	} // handler
	return handler;
}; // api.first

// Exports
api.createHandler = do_create_req;
api.createServer = setup_server;

/* EOF */
