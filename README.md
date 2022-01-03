# Service Locator for Catberry Framework

[![Build Status](https://travis-ci.org/catberry/catberry-locator.svg?branch=master)](https://travis-ci.org/catberry/catberry-locator) [![codecov.io](http://codecov.io/github/catberry/catberry-locator/coverage.svg?branch=master)](http://codecov.io/github/catberry/catberry-locator?branch=master)

## Description

The entire architecture of the [Catberry Framework](https://github.com/catberry/catberry)
is based on [Service Locator pattern](http://en.wikipedia.org/wiki/Service_locator_pattern).
It means that there is only one Service Locator (module registry)
in a Catberry application and all application's and framework's modules are
resolved from the locator when you start the application.

In case of Catberry Framework, starting an application means to
call `getMiddleware` method in `server.js` or `startWhenReady`
in `browser.js`. Before that moment feel free to register your own
modules-services into Service Locator.

## Usage

### Registering your Implementations

For example, you have a class that implement something:

```javascript
class Cat {
	// constructor always has the only argument – the Service Locator.
	constructor(locator) {
		this.berry = locator.resolve('berry');
	}
}
```

And you might have an "old style" class definition using constructor and prototype:

```javascript
// constructor always has the only argument – the Service Locator.
function Berry(locator) {
	// config is always registered in a Catberry application.
	this.berryType = locator.resolve('config').berryType;
}
```

So, you need to register these implementations into the locator
before starting an application.

Registering in `browser.js` script:

```javascript
const catberry = require('catberry');
const config = require('./browser-config');
const cat = catberry.create(config);

// when you have created an instance of the Catberry application
// you can register your modules in the Service Locator.
cat.locator.register('cat', Cat);
cat.locator.register('berry', Berry);

// you can register services only before the cat.startWhenReady() method is called
cat.startWhenReady();
```

Registering in `server.js` script:

```javascript
const catberry = require('catberry');
const config = require('./server-config');
const cat = catberry.create(config);
const connect = require('connect');
const http = require('http');
const app = connect();

// when you have created an instance of the Catberry application
// you can register your modules in the Service Locator.
cat.locator.register('cat', Cat);
cat.locator.register('berry', Berry);

// you can register services only before cat.getMiddleware() method is called
app.use(cat.getMiddleware());
app.use(connect.errorHandler());
http
	.createServer(app)
	.listen(config.server.port || 3000);

```

All cat-components and stores in a Catberry application are registered
automatically into the Service Locator. So, you don't need to do that on your own.

### Using Implementations

As far as every module's constructor has the only argument – the Service Locator,
you can resolve all modules-dependencies while creating new instances of these
modules using `locator` argument:

```javascript
class Cat {
	// constructor always has the only argument – the Service Locator.
	constructor(locator) {
		// you custom modules
		this.berry = locator.resolve('berry');
		// Catberry's modules
		this.config = locator.resolve('config');
		this.logger = locator.resolve('logger');
	}
}
```

Also, you can share the same instance across all modules in the application:

```javascript
cat.locator.register('cat', Cat);
// Berry will be a singleton
cat.locator.register('berry', Berry, true);

const cat1 = cat.locator.resolve('cat');
const cat2 = cat.locator.resolve('cat');

console.log(cat1.berry === cat2.berry); // true
```

Or if you have an instance itself instead of its constructor you can do following:

```javascript
cat.locator.register('cat', Cat);
// Berry is registered as an instance
cat.locator.registerInstance('berry', {berryType: 'black'});

const cat1 = cat.locator.resolve('cat');
const cat2 = cat.locator.resolve('cat');

console.log(cat1.berry === cat2.berry); // true
```

Another possible options is to register a list of implementations and to resolve
all the instances as a list:

```javascript
cat.locator.register('cat', BlackCat);
cat.locator.register('cat', WhiteCat);
cat.locator.register('cat', OrangeCat);

const allTheCats = cat.locator.resolveAll('cat');

console.log(allTheCats[0] instanceof OrangeCat); // true
console.log(allTheCats[1] instanceof WhiteCat); // true
console.log(allTheCats[2] instanceof BlackCat); // true
```

Please keep in mind that the last registered implementation will be the first in
the resolved list.

### Interface

Catberry's Service Locator implementation has following methods:

```javascript
/**
 * Implements a Service Locator pattern.
 */
class ServiceLocator {
	/**
	 * Registers a new type name in the service locator.
	 * @param {string} type The type name used as a key for resolving instances.
	 * @param {Function} implementation The implementation (constructor or class)
	 * which creates instances of the specified type name.
	 * @param {boolean?} isSingleton If true then the only instance will
	 * be created on the first "resolve" call and next calls will
	 * return this instance.
	 */
	register(type, implementation, isSingleton) {}

	/**
	 * Registers a single instance for the specified type.
	 * @param {string} type The type name for resolving the instance.
	 * @param {Object} instance The instance to register.
	 */
	registerInstance(type, instance) {}

	/**
	 * Resolves the last registered implementation by the type name.
	 * @param {string} type The type name to resolve.
	 * @returns {Object} The instance of the specified type name.
	 */
	resolve(type) {}

	/**
	 * Resolves all registered implementations by the type name.
	 * @param {string} type The type name for resolving instances.
	 * @returns {Array} The list of instances of the specified type name.
	 */
	resolveAll(type) {}

	/**
	 * Unregisters all registrations of the specified type name.
	 * @param {string} type The type name for deleting the registrations.
	 */
	unregister(type) {}
}
```

## Contributing

There are a lot of ways to contribute:

* Give it a star
* Join the [Gitter](https://gitter.im/catberry/catberry) room and leave a feedback or help with answering users' questions
* [Submit a bug or a feature request](https://github.com/catberry/catberry-locator/issues)
* [Submit a PR](https://github.com/catberry/catberry-locator/blob/develop/CONTRIBUTING.md)

Denis Rechkunov <denis@rdner.de>
