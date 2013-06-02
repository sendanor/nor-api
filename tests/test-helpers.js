"use strict";

var coverage = require('./coverage.js');
var helpers = coverage.require('helpers.js');
var vows = require('vows');
var assert = require('assert');

/* */
vows.describe('Testing helpers').addBatch({
	"helpers": {
		topic: helpers,
		'is object': function(obj) { assert.isObject(obj); },
		'.stringify is function': function(obj) { assert.isFunction(obj.stringify); },
		"test stringify({'foo':'bar', 'fun':function() {}})": {
			topic: function(helpers) {
				return helpers.stringify({'foo':'bar', 'fun':function() {}});
			},
			'is string': function(obj) { assert.isString(obj); },
			'equals': function(obj) { assert.strictEqual(obj, '{"foo":"bar","fun":{}}'); }
		},
		"test stringify({'foo':'bar'})": {
			topic: function(helpers) {
				return helpers.stringify({'foo':'bar'});
			},
			'is string': function(obj) { assert.isString(obj); },
			'equals': function(obj) { assert.strictEqual(obj, '{"foo":"bar"}'); }
		},
		"test stringify([1,2,3,4])": {
			topic: function(helpers) {
				return helpers.stringify([1,2,3,4]);
			},
			'is string': function(obj) { assert.isString(obj); },
			'equals': function(obj) { assert.strictEqual(obj, '[1,2,3,4]'); }
		},
		'test stringify("Hello world")': {
			topic: function(helpers) {
				return helpers.stringify("Hello world");
			},
			'is string': function(obj) { assert.isString(obj); },
			'equals': function(obj) { assert.strictEqual(obj, '"Hello world"'); }
		}
	}
}).export(module);

/* EOF */
