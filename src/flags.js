/* api flags */

var api = module.exports = {};

// api.replySent -- returned if reply was sent already
api.replySent = {'type':'replySent'};
api.replySent.toString = function() { return this.type; };

// api.notFound -- Returned if resource was not found
api.notFound = {'type':'notFound'};
api.notFound.toString = function() { return this.type; };

/* EOF */
