#Service Locator[![Build Status](https://travis-ci.org/catberry/catberry-locator.png?branch=master)](https://travis-ci.org/catberry/catberry-locator)
[![NPM](https://nodei.co/npm/catberry-locator.png)](https://nodei.co/npm/catberry-locator/)

##Description

Whole architecture of [Catberry Framework](https://github.com/catberry/catberry)
is based on [Service Locator pattern]
(http://en.wikipedia.org/wiki/Service_locator_pattern) and 
[Dependency Injection](http://en.wikipedia.org/wiki/Dependency_injection).
It means there is only one service locator in one Catberry application and all 
modules are resolved from this Locator when you use `getMiddleware` method in 
`server.js` or `startWhenReady` in `client.js`.
Before that moment feel free to register your own modules-services to inject 
them into Catberry modules via DI.

In Catberry, definition of type is just a string used like an argument name 
in constructors following `$` character.

For example your Catberry module's constructor can look like this:

```javascript
function Constructor($logger, $uhr, someConfigValue) {
	// here logger and uhr instances will be accessible
	// via dependency injection from service locator
	// someConfigValue will be accessible from startup config object
	// via dependency injection too
}
```

Catberry's Service Locator implementation has following methods:

```javascript
/**
 * Registers new type in service locator.
 * @param {string} type Type name, which will be alias in other constructors.
 * @param {Function} constructor Constructor which
 * initializes instance of specified type.
 * @param {Object?} parameters Set of named parameters
 * which will be also injected.
 * @param {boolean?} isSingleton If true every resolve will return
 * the same instance.
 */
ServiceLocator.prototype.register = function (type, constructor, parameters, isSingleton){ }

/**
 * Registers single instance for specified type.
 * @param {string} type Type name.
 * @param {Object} instance Instance to register.
 */
ServiceLocator.prototype.registerInstance = function (type, instance) { }

/**
 * Resolves last registered implementation by type name
 * including all its dependencies recursively.
 * @param {string} type Type name.
 * @returns {Object} Instance of specified type.
 */
ServiceLocator.prototype.resolve = function (type) { }

/**
 * Resolves all registered implementations by type name
 * including all dependencies recursively.
 * @param {string} type Type name.
 * @returns {Array} Array of instances specified type.
 */
ServiceLocator.prototype.resolveAll = function (type) { }

/**
 * Resolves instance of specified constructor including dependencies.
 * @param {Function} constructor Constructor for instance creation.
 * @param {Object?} parameters Set of its parameters values.
 * @returns {Object} Instance of specified constructor.
 */
ServiceLocator.prototype.resolveInstance = function (constructor, parameters) { }

/**
 * Unregisters all registrations of specified type.
 * @param {string} type Type name.
 */
ServiceLocator.prototype.unregister = function (type) { }
```

##Example

This example demonstrates how to use Service Locator in Catberry Framework.

Using in `client.js` script:

```javascript
var RestApiClient = require('./lib/RestApiClient'),
// create catberry application instance.
	catberry = require('catberry'),
	config = require('./client-config'),
	cat = catberry.create(config);

// then you could register your components to inject into catberry modules.
cat.locator.register('restApiClient', RestApiClient, config, true);

// you can register services only before this method cat.startWhenReady()
// tell catberry to start when HTML document will be ready
cat.startWhenReady();

```

Using in `server.js` script:

```javascript
var catberry = require('catberry'),
	RestApiClient = require('./lib/RestApiClient'),
	connect = require('connect'),
	config = require('./server-config'),
	cat = catberry.create(config),
	app = connect();

// when you have created instance of Catberry application
// you can register in Service Locator everything you want.
cat.locator.register('restApiClient', RestApiClient, config, true);

// you can register services only before this method cat.getMiddleware()
app.use(cat.getMiddleware());
app.use(connect.errorHandler());
http
	.createServer(app)
	.listen(config.server.port || 3000);

```

##Contribution
If you have found a bug, please create pull request with mocha unit-test which 
reproduces it or describe all details in issue if you can not implement test.
If you want to propose some improvements just create issue or pull request but 
please do not forget to use **npm test** to be sure that you code is awesome.

All changes should satisfy this [Code Style Guide]
(https://github.com/catberry/catberry/blob/master/docs/code-style-guide.md).

Also your changes should be covered by unit tests using [mocha]
(https://www.npmjs.org/package/mocha).

Denis Rechkunov <denis.rechkunov@gmail.com>