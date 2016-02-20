/*
 * catberry-locator
 *
 * Copyright (c) 2014 Denis Rechkunov and project contributors.
 *
 * catberry-locator's license follows:
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This license applies to all parts of catberry-locator that are not externally
 * maintained libraries.
 */

'use strict';

const util = require('util');

const DEPENDENCY_REGEXP = /^\$\w+/;

/**
 * Implements a Service Locator pattern.
 */
class ServiceLocator {

	/**
	 * Creates a new instance of the service locator class.
	 */
	constructor() {

		/**
		 * Current type registrations.
		 * @type {Map}
		 * @private
		 */
		this._registrations = new Map();
	}

	/**
	 * Registers a new type name in the service locator.
	 * @param {string} type The type name used as a key for resolving instances.
	 * @param {Function} implementation The implementation (constructor or class)
	 * which creates instances of the specified type name.
	 * @param {boolean?} isSingleton If true then the only instance will
	 * be created on the first "resolve" call and next calls will
	 * return this instance.
	 */
	register(type, implementation, isSingleton) {
		this._throwIfNotFunction(type, implementation);
		this._throwIfNotString(type);

		this._initializeRegistration(type);

		this._registrations.get(type).unshift({
			Implementation: implementation,
			isSingleton: Boolean(isSingleton),
			singleInstance: null
		});
	}

	/**
	 * Registers a single instance for the specified type.
	 * @param {string} type The type name for resolving the instance.
	 * @param {Object} instance The instance to register.
	 */
	registerInstance(type, instance) {
		this._throwIfNotString(type);
		this._initializeRegistration(type, this);

		this._registrations.get(type).unshift({
			Implementation: instance.constructor,
			isSingleton: true,
			singleInstance: instance
		});
	}

	/**
	 * Resolves the last registered implementation by the type name.
	 * @param {string} type The type name to resolve.
	 * @returns {Object} The instance of the specified type name.
	 */
	resolve(type) {
		this._throwIfNotString(type);
		this._throwIfNoType(type);
		const firstRegistration = this._registrations.get(type)[0];
		return this._createInstance(firstRegistration);
	}

	/**
	 * Resolves all registered implementations by the type name.
	 * @param {string} type The type name for resolving instances.
	 * @returns {Array} The list of instances of the specified type name.
	 */
	resolveAll(type) {
		this._throwIfNotString(type);
		this._throwIfNoType(type);
		return this._registrations
			.get(type)
			.map(registration => this._createInstance(registration));
	}

	/**
	 * Unregisters all registrations of the specified type name.
	 * @param {string} type The type name for deleting the registrations.
	 */
	unregister(type) {
		this._throwIfNotString(type);
		this._registrations.set(type, []);
	}

	/**
	 * Creates an instance for the specified registration descriptor.
	 * @param {Object} registration The registration descriptor object.
	 * @returns {Object} The instance of the implementation found in
	 * the specified registration descriptor.
	 */
	_createInstance(registration) {
		if (registration.isSingleton && registration.singleInstance !== null) {
			return registration.singleInstance;
		}

		// inject Service Locator as the only argument of the costructor.
		const instance = new registration.Implementation(this);

		if (registration.isSingleton) {
			registration.singleInstance = instance;
		}

		return instance;
	}

	/**
	 * Initializes a registration list for the specified type name.
	 * @param {string} type The type name for the registration list.
	 * @private
	 */
	_initializeRegistration(type) {
		if (this._registrations.has(type)) {
			return;
		}
		this._registrations.set(type, []);
	}

	/**
	 * Throws an error if the specified registration is not found.
	 * @param {string} type The type name to check.
	 * @private
	 */
	_throwIfNoType(type) {
		if (this._registrations.has(type) &&
			this._registrations.get(type).length > 0) {
			return;
		}
		throw new Error(`Type "${type}" not registered`);
	}

	/**
	 * Throws an error if the specified implementation is not a function.
	 * @param {string} type The type name of the implementation.
	 * @param {Function} Implementation The implementation to check.
	 * @private
	 */
	_throwIfNotFunction(type, Implementation) {
		if (Implementation instanceof Function) {
			return;
		}

		throw new Error(`Constructor for type ${type} should be a function`);
	}

	/**
	 * Throws an error if the specified type name is not a string.
	 * @param {string} type Type name to check.
	 */
	_throwIfNotString(type) {
		if (typeof (type) === 'string') {
			return;
		}

		throw new Error(`Type name "${type}" should be a string`);
	}
}

module.exports = ServiceLocator;
