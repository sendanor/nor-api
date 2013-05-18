
/* Checks for types */

var is = module.exports = {};

/** Returns true if object is an object */
is.obj = function is_obj(o) {
	return (o && (typeof o === 'object')) ? true : false;
};

/** Returns true if object is an array */
is.array = function is_array(o) {
	return (is.obj(o) && (o instanceof Array)) ? true : false;
};

/** Returns true if object is a function */
is.fun = function is_fun(o) {
	if(is.obj(o) && (o instanceof Function) ) { return true; }
	return (o && (typeof o === 'function')) ? true : false;
};

/* EOF */
