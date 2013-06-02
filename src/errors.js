/* Custom errors */

var util = require('util');

/** */
function HTTPError(obj, constr) {
	var self = this;
	Error.captureStackTrace(self, constr || self);
	Object.keys(obj).forEach(function(key) {
		self[key] = obj[key];
	});
	if(!self.message) {
		if(obj.desc) {
			self.message = (obj.code ? [obj.code, obj.desc] : [obj.desc]).join(' - ');
		} else {
			self.message = JSON.stringify(obj);
		}
	}
}
util.inherits(HTTPError, Error);
HTTPError.prototype.name = 'HTTP Error';

// Exports
var mod = module.exports = {};
mod.HTTPError = HTTPError;

/* EOF */
