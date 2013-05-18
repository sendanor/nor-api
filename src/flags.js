/* api flags */

var api = module.exports = {};

// api.replySent -- returned if reply was sent already
api.replySent = {};
api.replySent.toString = function() { return 'replySent'; };

// api.notFound -- Returned if resource was not found
api.notFound = {};
api.notFound.toString = function() { return 'notFound'; };

/* EOF */
