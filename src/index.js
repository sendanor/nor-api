/* Index */

var mod = module.exports = {};

/** Sends successful HTTP reply */
function do_success(req, res, msg) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	msg = (typeof msg === 'string') ? msg : JSON.stringify(msg);
	res.end(msg + '\n');
}

/** Builder for generic HTTP Request Handler */
function do_create_req(opts) {
	
	var routes = opts.routes || {};
	
	// FIXME: If routes.version is missing, read it from the package.json of the target application.
	
	/* Inner Request handler */
	function do_req(req, res) {
		var url = require('url').parse(req.url, true);
		
		if(url.path
		//do_success(req, res, {'msg':'Hello World'});
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
	do_create_server(config, do_create_req(opts));
));

// Exports
mod.setup = setup_api;

/* EOF */
