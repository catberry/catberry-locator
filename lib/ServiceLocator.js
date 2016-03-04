'use strict';

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
		 * @type {Object}
		 * @private
		 */
		this._registrations = Object.create(null);
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

		this._registrations[type].unshift({
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

		this._registrations[type].unshift({
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
		const firstRegistration = this._registrations[type][0];
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
		return this._registrations[type]
			.map(registration => this._createInstance(registration));
	}

	/**
	 * Unregisters all registrations of the specified type name.
	 * @param {string} type The type name for deleting the registrations.
	 */
	unregister(type) {
		this._throwIfNotString(type);
		this._registrations[type] = [];
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
		if (type in this._registrations) {
			return;
		}
		this._registrations[type] = [];
	}

	/**
	 * Throws an error if the specified registration is not found.
	 * @param {string} type The type name to check.
	 * @private
	 */
	_throwIfNoType(type) {
		if (type in this._registrations &&
			this._registrations[type].length > 0) {
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
