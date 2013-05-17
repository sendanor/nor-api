/* Index */

var api_config = require('nor-config').from(__dirname);

var RequestRouter = require('./Router.js');

var mod = module.exports = {};

/** */
function stringify_resource(obj) {
	if(! (obj && (typeof obj === "object")) ) {
		return JSON.stringify(obj);
	}
	return JSON.stringify(obj.map(function(v) {
		if(v && (typeof v === 'function')) {
			return {'type':'function'};
		}
		return v;
	}));
}

/** Sends successful HTTP reply */
function do_success(req, res, msg) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	msg = (typeof msg === 'string') ? msg : JSON.stringify(msg);
	res.end(msg + '\n');
}

/** Sends failed HTTP reply */
function do_failure(req, res, msg, code) {
	code = code || 501;
	res.writeHead(code, {'Content-Type': 'application/json'});
	msg = (typeof msg === 'string') ? msg : JSON.stringify(msg);
	res.end(msg + '\n');
}

/** Builder for generic HTTP Request Handler */
function do_create_req(config, opts) {
	
	var routes = opts.routes || {};
	var version = opts.version || {};
	
	if(version && (typeof version === 'object')) {
	} else {
		version = {'self':version};
	}
	
	// FIXME: If routes.version is missing, read it from the package.json of the target application.

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
		var obj = router.resolve( req, res );
		if(obj === undefined) {
			do_failure(req, res, {'verb': 'notfound', 'msg':'The requested resource could not be found.'}, 404);
		} else {
			do_success(req, res, obj);
		}

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
}

/** API builder */
function setup_api(config, opts) {
	config._def('port', 3000);
	do_create_server(config, do_create_req(config, opts));
}

// Exports
mod.setup = setup_api;

/* EOF */
