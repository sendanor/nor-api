[![Build Status](https://secure.travis-ci.org/Sendanor/nor-api.png?branch=master)](http://travis-ci.org/Sendanor/nor-api#readme)

nor-api -- Simple API library for Node.js
=========================================

**Warning!** This code is experimental and in state of preliminary development. Use at your own risk.

License
-------

It's under MIT-style open source license -- see [LICENSE.txt](https://github.com/Sendanor/nor-api/blob/master/LICENSE.txt).

Installation
------------

You can install it simply from NPM:

	npm install nor-api

Usage
-----

Here's an example HTTP service:

```javascript
var config = require('nor-config').from(__dirname);
config._def('port', 3000);
var api = require('nor-api');
api.createServer(config, {
	'hello': 'world',
	'date': function() {
		return ''+new Date();
	}
});
```

It has resources at locations: 

* http://localhost:3000/        -- The index page which returns an object describing the resources.
* http://localhost:3000/hello   -- Returns "world"
* http://localhost:3000/date    -- Returns current date
* http://localhost:3000/version -- Automatically prepared object giving version information

Once running, the HTTP service will be available at http://localhost:3000.

See also [nor-config](http://github.com/Sendanor/nor-config#readme) for more details about the configuration.
