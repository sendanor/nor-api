/* Index */

var mod = module.exports = {};
var IS = require('./is.js');

/** */
mod.stringify = function(obj) {
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
};

/* EOF */
