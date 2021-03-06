
/* Router for requests */

var Q = require('q');
var IS = require('./is.js');
var errors = require('./errors.js');
var flags = require('./flags.js');

/** Internal target resolver
 * @param routes Object prepresenting routes to resources.
 * @param path Path to the resource as an array of keys.
 */
function _resolve(routes, path, req, res) {
	return Q.fcall(function() {

		path = path || [];

		var obj = routes;
		
		// Resolve promises first
		if(IS.obj(obj) && IS.fun(obj.then)) {
			var p = obj.then(function(ret) {
				return _resolve(ret, path, req, res);
			});
			return p;
		}

		// Resolve functions first
		if(IS.fun(obj)) {
			var p2 = Q.when(obj(req, res)).then(function(ret) {
				return _resolve(ret, path, req, res);
			});
			return p2;
		}
		
		// If the resource is undefined, return flags.notFound (resulting to a HTTP error 404).
		if(obj === undefined) {
			return flags.notFound;
		}
		
		// If path is at the end, then return the current resource.
		if(path.length === 0) {
			return obj;
		}
		
		// Handle arrays
		if(IS.array(obj)) {
			var k = path[0],
			    n = parseInt(path.shift(), 10);
			if(k === "length") {
				return _resolve(obj.length, path.shift(), req, res);
			}
			if(k !== ""+n) {
				return Q.fcall(function() { throw new errors.HTTPError({'code':400, 'desc':'Bad Request'}); });
			}
			return _resolve(obj[n], path.shift(), req, res);
		}
		
		// Handle objects
		if(IS.obj(obj)) {
			var k2 = path[0];
			if(obj[k2] === undefined) {
				return flags.notFound;
			}
			if(!obj.hasOwnProperty(k2)) {
				return Q.fcall(function() { throw new errors.HTTPError({'code':403, 'desc':'Forbidden'}); });
			}
			return _resolve(obj[path.shift()], path, req, res);
		}
		
		// Returns notFound because we still have keys in the path but nowhere to go.
		return flags.notFound;
	});
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
