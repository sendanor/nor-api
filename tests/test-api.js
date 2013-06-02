"use strict";

var config = require('nor-config').from(__dirname + '/testconfig1');
config._def('port', 8080);

var config2 = require('nor-config').from(__dirname + '/testconfig2');
config2._def('host', 'localhost');
config2._def('port', 8081);

var coverage = require('./coverage.js');
var vows = require('vows');
var assert = require('assert');
var api = coverage.require('index.js');

/* Wrapper to test Q promises */
function q_test(p, fn) {
	try {
		assert.isObject(p);
		assert.isFunction(fn);
		assert.isFunction(p.then);
		p.then(function(data) {
			fn(undefined, data);
		}).fail(function(err) {
			fn(err);
		}).done();
	} catch(e) {
		fn(e);
	}
}

/* Wrapper to test Q promises */
function q_test_errors(p, fn) {
	try {
		assert.isObject(p);
		assert.isFunction(fn);
		assert.isFunction(p.then);
		p.then(function(data) {
			fn(data);
		}).fail(function(err) {
			fn(undefined, err);
		}).done();
	} catch(e) {
		fn(undefined, e);
	}
}

/* */
function isNotError(type) {
	type = type || Error;
	return function(obj) {
		if(obj instanceof type) {
			console.error('Got exception: ' + obj);
			if(obj.stack) {
				console.error('----------- stack -------------\n'
					+ obj.stack + "\n"
					+ '-------- end of stack ---------'
				);
			}
		} 
		assert.isFalse(obj instanceof type);
	};
}

/* */
function isError(type, message) {
	type = type || Error;
	return function(obj) {
		var valid = ( (obj instanceof type) && (obj.message === message) ) ? true : false;
		if(!valid) {
			console.error('Got unexpected result: ' + obj);
			if(obj.stack) {
				console.error('----------- stack -------------\n'
					+ obj.stack + "\n"
					+ '-------- end of stack ---------'
				);
			}
			console.error('Expected result to be instance of ' + type.name + ' with message "' + message + '".');
			console.error('Instead was instance of ' + obj.name + ' with message "' + obj.message + '".');
		} 
		assert.isTrue(valid);
	};
}

/* */
vows.describe('Testing server api').addBatch({
	"api": {
		topic: api,
		'is object': function(obj) { assert.isObject(obj); },
		'.createServer is function': function(obj) { assert.isFunction(obj.createServer); },
		//'.first is function': function(obj) { assert.isFunction(obj.first); },
		".createServer(config, {'hello': 'world'})": {
			topic: function(api) {
				return api.createServer(config, {'hello': 'world', 'echo': function(req, res) { return require('url').parse(req.url, true).query; }});
			},
			'is not Error': isNotError(Error),
			'is object': function(obj) { assert.isObject(obj); },
			"GET /": {
				topic: function(server, api) {
					q_test(api.request('http://localhost:'+config.port+'/'), this.callback);
				},
				'is not Error': isNotError(Error),
				'is object': function(obj) { assert.isObject(obj); },
				'Object.keys(obj) are hello,echo,version,$': function(obj) { assert.strictEqual(Object.keys(obj).toString(), 'hello,echo,version,$'); },
				'.echo is object': function(obj) { assert.isObject(obj.echo); },
				'.hello is "world"': function(obj) { assert.strictEqual(obj.hello, 'world'); },
				'.version is {"api":"0.0.3"}': function(obj) { assert.strictEqual(JSON.stringify(obj.version), '{"api":"0.0.3"}'); },
				'.$ is object': function(obj) { assert.isObject(obj.$); },
			},
			"GET /version": {
				topic: function(server, api) {
					q_test(api.request('http://localhost:'+config.port+'/version'), this.callback);
				},
				'is not Error': isNotError(Error),
				'is object': function(obj) { assert.isObject(obj); },
				'Object.keys(obj) are self': function(obj) { assert.strictEqual(Object.keys(obj).toString(), 'api,$'); },
				'.api is "0.0.3"': function(obj) { assert.strictEqual(obj.api, '0.0.3'); },
				'.$ is object': function(obj) { assert.isObject(obj.$); },
			},
			"GET /hello": {
				topic: function(server, api) {
					q_test(api.request('http://localhost:'+config.port+'/hello'), this.callback);
				},
				'is not Error': isNotError(Error),
				'is string': function(obj) { assert.isString(obj); },
				'is "world"': function(obj) { assert.strictEqual(obj, 'world'); }
			},
			"GET /echo?foo=bar": {
				topic: function(server, api) {
					q_test(api.request('http://localhost:'+config.port+'/echo?foo=bar'), this.callback);
				},
				'is not Error': isNotError(Error),
				'is object': function(obj) { assert.isObject(obj); },
				'Object.keys(obj) are self': function(obj) { assert.strictEqual(Object.keys(obj).toString(), 'foo,$'); },
				'.foo is "bar"': function(obj) { assert.strictEqual(obj.foo, 'bar'); },
				'.$ is object': function(obj) { assert.isObject(obj.$); },
			},
			"GET /foobar": {
				topic: function(server, api) {
					q_test_errors(api.request('http://localhost:'+config.port+'/foobar'), this.callback);
				},
				'is HTTPError 404': isError(api.errors.HTTPError, '404 - The requested resource could not be found.')
			}
		},
		".createServer(config2, {'apple': 'green','version':'0.2'})": {
			topic: function(api) {
				var s = api.createServer(config2, {
					'apple': 'green',
					'version':'0.2',
					'echo': function(req, res) {
						res.writeHead(200, {'Content-Type':'text/plain'} );
						res.end("Test");
						return api.replySent;
					}
				});
				return s;
			},
			'is not Error': isNotError(Error),
			'is object': function(obj) { assert.isObject(obj); },
			"GET /": {
				topic: function(server, api) {
					q_test(api.request('http://'+config2.host+':'+config2.port+'/'), this.callback);
				},
				'is not Error': isNotError(Error),
				'is object': function(obj) { assert.isObject(obj); },
				'Object.keys(obj) are apple,version,echo,$': function(obj) { assert.strictEqual(Object.keys(obj).toString(), 'apple,version,echo,$'); },
				'.echo is object': function(obj) { assert.isObject(obj.echo); },
				'.apple is "green"': function(obj) { assert.strictEqual(obj.apple, 'green'); },
				'.version is {"api":"0.0.3"}': function(obj) { assert.strictEqual(JSON.stringify(obj.version), '{"self":"0.2","api":"0.0.3"}'); },
				'.$ is object': function(obj) { assert.isObject(obj.$); },
			},
			"GET /version": {
				topic: function(server, api) {
					q_test(api.request('http://'+config2.host+':'+config2.port+'/version'), this.callback);
				},
				'is not Error': isNotError(Error),
				'is object': function(obj) { assert.isObject(obj); },
				'Object.keys(obj) are self': function(obj) { assert.strictEqual(Object.keys(obj).toString(), 'self,api,$'); },
				'.api is "0.0.3"': function(obj) { assert.strictEqual(obj.api, '0.0.3'); },
				'.$ is object': function(obj) { assert.isObject(obj.$); },
			},
			"GET /apple": {
				topic: function(server, api) {
					q_test(api.request('http://'+config2.host+':'+config2.port+'/apple'), this.callback);
				},
				'is not Error': isNotError(Error),
				'is string': function(obj) { assert.isString(obj); },
				'is "green"': function(obj) { assert.strictEqual(obj, 'green'); }
			},
			"GET /echo?foo2=bar2": {
				topic: function(server, api) {
					q_test(api.request('http://'+config2.host+':'+config2.port+'/echo?foo2=bar2'), this.callback);
				},
				'is not Error': isNotError(Error),
				'is string': function(obj) { assert.isString(obj); },
				'is "Test"': function(obj) { assert.strictEqual(obj, 'Test'); }
			},
			"GET /foobar": {
				topic: function(server, api) {
					q_test_errors(api.request('http://'+config2.host+':'+config2.port+'/foobar'), this.callback);
				},
				'is HTTPError 404': isError(api.errors.HTTPError, '404 - The requested resource could not be found.')
			}
		}
	}
}).export(module);

/* EOF */
