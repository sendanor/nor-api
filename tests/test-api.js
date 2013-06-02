"use strict";

var coverage = require('./coverage.js');
var api = coverage.require('index.js');
var vows = require('vows');
var assert = require('assert');

/* */
vows.describe('Testing api').addBatch({
	"api": {
		topic: api,
		'is object': function(obj) { assert.isObject(obj); },
		'.createServer is function': function(obj) { assert.isFunction(obj.createServer); },
	}
}).export(module);

/* EOF */
