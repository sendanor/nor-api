/* Index */

var api_config = require('nor-config').from(__dirname);

var mod = module.exports = {};

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
	
	/* Inner Request handler */
	function do_req(req, res) {
		var url = require('url').parse(req.url);
		var replied = false;
		var parent;
		var item = routes;
		url.path.split('/').forEach(function(key) {
			if(key.length === 0) { return; }

			if(item && (typeof item === 'object') && (item instanceof Array)) {
				var orig_key = key;
				key = parseInt(key, 10);
				if(''+key !== orig_key) {
					do_failure(req, res, {'verb': 'invalid_identifier', 'msg':'Invalid item identifier: ' + orig_key}, 501);
					replied = true;
					return;
				}
				if(item[key] === undefined) {
					do_failure(req, res, {'verb': 'notfound', 'msg':'The resource does not have the item #' + key}, 404);
					replied = true;
					return;
				}
				parent = item;
				item = parent[key];
			} if(item && (typeof item === 'object')) {
				if(item[key] === undefined) {
					do_failure(req, res, {'verb': 'notfound', 'msg':'Resource not found.'}, 404);
					replied = true;
					return;
				}
				parent = item;
				item = parent[key];
				return;
			} else {
				parent = item;
				item = undefined;
			}

		});

		if(!replied) {
			if(item === undefined) {
				do_failure(req, res, {'verb': 'notfound', 'msg':'Resource not found.'}, 404);
			} else {
				do_success(req, res, item);
			}
		}
	}

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
