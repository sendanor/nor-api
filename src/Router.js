
/* Router for requests */

var IS = require('./is.js');

/** Internal target resolver
 * @param routes Object prepresenting routes to resources.
 * @param path Path to the resource as an array of keys.
 */
function _resolve(routes, path, req, res) {

	console.log(__filename + ': DEBUG: _resolve(routes = '+"'" + routes + "', path='" + path + "') called!");
	
	var obj = routes;
	
	// Resolve functions first
	while(IS.fun(obj)) {
		obj = obj(req, res);
	}

	// If the resource is undefined, return undefined instantly (resulting to HTTP error 404).
	if(obj === undefined) {
		return;
	}

	// If path is at the end, then return the current resource.
	if(path.length === 0) {
		/*
		if(IS.obj(obj) && obj.hasOwnProperty('index')) {
			res.writeHead(303, {
				'Content-Type': 'application/json',
				'Location':''
			});
			res.end(JSON.stringify() + '\n');
			return;
		}
		*/
		return obj;
	}

	// Handle arrays
	if(IS.array(obj)) {
		return _resolve(obj[parseInt(path.shift(), 10)], path, req, res);
	}

	// Handle objects
	if(IS.obj(obj)) {
		return _resolve(obj[path.shift()], path, req, res);
	}

	// Handle other... make it 404 because we still have keys in the path but nowhere to go.
	return undefined;
}

/** Constructor */
function Router (routes) {
	this._routes = routes;
}

/** Parse target */
function do_parse_url(url) {
	var s = require('url').parse(url).pathname.replace(/[^a-zA-Z0-9_\-\+\.]+/g, "/").replace(/^\/+/, "");
	if(s.length === 0) { return []; }
	return s.split("/");
}

/** Resolve target URL to an object using routes */
Router.prototype.resolve = function(req, res) {
	return _resolve(this._routes, do_parse_url(req.url), req, res);
};

// Exports
module.exports = Router;

/* EOF */
