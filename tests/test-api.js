"use strict";

var config = require('nor-config').from(__dirname);
config._def('port', 8080);

var coverage = require('./coverage.js');
var vows = require('vows');
var assert = require('assert');

/* Wrapper to test Q promises */
function q_test(p, fn) {
	assert.isObject(p);
	assert.isFunction(fn);
	assert.isFunction(p.then);
	p.then(function(data) {
		fn(undefined, data);
	}).fail(function(err) {
		fn(err);
	}).done();
}

/* */
vows.describe('Testing server api').addBatch({
	"api": {
		topic: coverage.require('index.js'),
		'is object': function(obj) { assert.isObject(obj); },
		'.createServer is function': function(obj) { assert.isFunction(obj.createServer); },
		'.first is function': function(obj) { assert.isFunction(obj.first); },
		".createServer(config, {'hello': 'world'})": {
			topic: function(api) {
				return api.createServer(config, {'hello': 'world'});
			},
			'is object': function(obj) { assert.isObject(obj); },
			"HTTP response": {
				topic: function(server, api) {
					try {
						q_test(api.request('http://localhost:'+config.port+'/'), this.callback);
					} catch(e) {
						this.callback(e);
					}
				},
				'is object': function(obj) { assert.isObject(obj); },
				'Object.keys(obj) are hello,version,$': function(obj) { assert.strictEqual(Object.keys(obj).toString(), 'hello,version,$'); },
				'.hello is "world"': function(obj) { assert.strictEqual(obj.hello, 'world'); },
				'.version is "{}"': function(obj) { assert.strictEqual(JSON.stringify(obj.version), '{}'); },
				'.$ is object': function(obj) { assert.isObject(obj.$); },
			}
		}
	}
}).export(module);

/* EOF */
