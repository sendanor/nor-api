
/* Router for requests */

/** Returns true if object is an object */
function is_obj(o) {
	return (o && (typeof o === 'object')) ? true : false;
}

/** Returns true if object is an array */
function is_array(o) {
	return (is_obj(o) && (o instanceof Array)) ? true : false;
}

/** Returns true if object is a function */
function is_fun(o) {
	if(is_obj(o) && (o instanceof Function) ) return true;
	return (o && (typeof o === 'function')) ? true : false;
}


/** Internal target resolver
 * @param routes Object prepresenting routes to resources.
 * @param path Path to the resource as an array of keys.
 */
function _resolve(routes, path, req, res) {

	console.log(__filename + ': DEBUG: _resolve(routes = '+"'" + routes + "', path='" + path + "') called!");
	
	var obj = routes;
	
	// Resolve functions first
	while(is_fun(obj)) {
		obj = obj(req, res);
	}

	// If the resource is undefined, return undefined instantly (resulting to HTTP error 404).
	if(obj === undefined) {
		return;
	}

	// If path is at the end, then return the current resource.
	if(path.length === 0) {
		return obj;
	}

	// Handle arrays
	if(is_array(obj)) {
		return _resolve(obj[parseInt(path.shift(), 10)], path, req, res);
	}

	// Handle objects
	if(is_obj(obj)) {
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
	return require('url').parse(url).pathname.replace(/[^a-zA-Z0-9_\-\+]+/g, ".").replace(/^\.+/, "").split(".");
}

/** Resolve target URL to an object using routes */
Router.prototype.resolve = function(req, res) {
	return _resolve(this._routes, do_parse_url(req.url), req, res);
};

// Exports
module.exports = Router;

/* EOF */
