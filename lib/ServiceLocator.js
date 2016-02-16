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
const ConstructorTokenizer = require('./ConstructorTokenizer');

const DEPENDENCY_REGEXP = /^\$\w+/;

class ServiceLocator {

	/**
	 * Creates new instance of service locator.
	 * @constructor
	 */
	constructor() {

		/**
		 * Current type registrations.
		 * @type {Object}
		 * @private
		 */
		this._registrations = Object.create(null);
	}

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
	register(type, constructor, parameters, isSingleton) {
		this._throwIfNotFunction(constructor);
		this._throwIfNotString(type);

		this._initializeRegistration(type, this);
		const parameterNames = this._getParameterNames(constructor);

		this._registrations[type].unshift({
			constructor,
			parameterNames,
			parameters: parameters || {},
			isSingleton: Boolean(isSingleton),
			singleInstance: null
		});
	}

	/**
	 * Registers single instance for specified type.
	 * @param {string} type Type name.
	 * @param {Object} instance Instance to register.
	 */
	registerInstance(type, instance) {
		this._throwIfNotString(type);
		this._initializeRegistration(type, this);

		this._registrations[type].unshift({
			constructor: instance.constructor,
			parameters: {},
			parameterNames: [],
			isSingleton: true,
			singleInstance: instance
		});
	}

	/**
	 * Resolves last registered implementation by type name
	 * including all its dependencies recursively.
	 * @param {string} type Type name.
	 * @returns {Object} Instance of specified type.
	 */
	resolve(type) {
		this._throwIfNotString(type);
		this._throwIfNoType(type);
		const firstRegistration = this._registrations[type][0];
		return this._createInstance(firstRegistration);
	}

	/**
	 * Resolves all registered implementations by type name
	 * including all dependencies recursively.
	 * @param {string} type Type name.
	 * @returns {Array} Array of instances specified type.
	 */
	resolveAll(type) {
		this._throwIfNotString(type);
		try {
			this._throwIfNoType(type);
		} catch (e) {
			return [];
		}
		return this._registrations[type]
			.map(registration => this._createInstance(registration, this));
	}

	/**
	 * Resolves instance of specified constructor including dependencies.
	 * @param {Function} constructor Constructor for instance creation.
	 * @param {Object?} parameters Set of its parameters values.
	 * @returns {Object} Instance of specified constructor.
	 */
	resolveInstance(constructor, parameters) {
		return this._createInstance({
			constructor,
			parameters: parameters || {},
			parameterNames: this._getParameterNames(constructor),
			isSingleton: false,
			singleInstance: null
		});
	}

	/**
	 * Unregisters all registrations of specified type.
	 * @param {string} type Type name.
	 */
	unregister(type) {
		this._throwIfNotString(type);
		delete this._registrations[type];
	}

	/**
	 * Creates instance of type specified and parameters in registration.
	 * @param {Object} registration Specified registration of type.
	 * @returns {Object} Instance of type specified in registration.
	 */
	_createInstance(registration) {
		if (registration.isSingleton && registration.singleInstance !== null) {
			return registration.singleInstance;
		}

		const instanceParameters = this._getParameters(registration);
		const instance = new registration.constructor(...instanceParameters);

		if (registration.isSingleton) {
			registration.singleInstance = instance;
		}

		return instance;
	}

	/**
	 * Gets constructor parameters specified in type constructor.
	 * @param {Object} registration Type registration.
	 * @returns {Array} Array of resolved dependencies to inject.
	 */
	_getParameters(registration) {
		return registration.parameterNames
			.map(parameterName => {
				const dependencyName = this._getDependencyName(parameterName);
				return dependencyName === null ?
					registration.parameters[parameterName] :
					this.resolve(dependencyName);
			});
	}

	/**
	 * Initializes registration array for specified type.
	 * @param {string} type Type name.
	 * @private
	 */
	_initializeRegistration(type) {
		if (!(type in this._registrations)) {
			this._registrations[type] = [];
		}
	}

	/**
	 * Throws error if specified registration is not found.
	 * @param {string} type Type to check.
	 * @private
	 */
	_throwIfNoType(type) {
		if (!(type in this._registrations) ||
			this._registrations[type].length === 0) {
			throw new Error(`Type "${type}" not registered`);
		}
	}

	/**
	 * Throws error if specified constructor is not a function.
	 * @param {Function} constructor Constructor to check.
	 * @private
	 */
	_throwIfNotFunction(constructor) {
		if (constructor instanceof Function) {
			return;
		}

		throw new Error('Constructor should be a function');
	}

	/**
	 * Throws error if specified type name is not a string.
	 * @param {string} type Type name to check.
	 */
	_throwIfNotString(type) {
		if (typeof (type) === 'string') {
			return;
		}

		throw new Error(`Type name "${type}" should be a string`);
	}

	/**
	 * Gets name of dependency type.
	 * @param {string} parameterName Name of constructor parameter.
	 * @returns {string|null} Name of dependency type.
	 */
	_getDependencyName(parameterName) {
		if (!DEPENDENCY_REGEXP.test(parameterName)) {
			return null;
		}

		return parameterName.substring(1);
	}

	/**
	 * Gets all parameter names used in constructor function.
	 * @param {Function} constructor Constructor function.
	 * @returns {Array<string>} Array of parameter names.
	 */
	_getParameterNames(constructor) {
		const source = constructor.toString();
		const tokenizer = new ConstructorTokenizer(source);
		const result = [];
		var token = {
			state: ConstructorTokenizer.STATES.NO,
			start: 0,
			end: 0
		};
		var areParametersStarted = false;

		while (
			token.state !== ConstructorTokenizer.STATES.END &&
			token.state !== ConstructorTokenizer.STATES.ILLEGAL) {
			token = tokenizer.next();
			if (token.state === ConstructorTokenizer.STATES.PARENTHESES_OPEN) {
				areParametersStarted = true;
			}

			if (areParametersStarted &&
				token.state === ConstructorTokenizer.STATES.IDENTIFIER) {
				result.push(source.substring(token.start, token.end));
			}
		}
		return result;
	}
}

module.exports = ServiceLocator;
