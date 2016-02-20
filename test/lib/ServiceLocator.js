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

const assert = require('assert');
const ServiceLocator = require('../../lib/ServiceLocator');

/* eslint prefer-arrow-callback:0 */
/* eslint max-nested-callbacks:0 */
/* eslint require-jsdoc:0 */
describe('ServiceLocator', function() {
	var locator;
	beforeEach(function() {
		locator = new ServiceLocator();
	});

	describe('#register', function() {
		it('should throw an error if the specified type name is not a string', function() {
			assert.throws(() => {
				locator.register(null, function() {});
			});
		});

		it('should throw an error if the specified implementation is not a function', function() {
			assert.throws(() => {
				locator.register('typeName', null);
			});
		});
	});

	describe('#unregister', function() {
		it('should remove all registration of the specified type name', function() {
			locator.register('type', function() {});
			locator.registerInstance('type', {});
			locator.unregister('type');

			assert.throws(() => {
				locator.resolve('type');
			});
		});
	});

	describe('#registerInstance', function() {
		it('should register a single instance for the type name', function() {
			const instance1 = {};
			const instance2 = {};

			locator.registerInstance('type', instance1);
			locator.registerInstance('type', instance2);

			const resolved1 = locator.resolve('type');
			const resolved2 = locator.resolve('type');

			assert.strictEqual(resolved1, instance2);
			assert.strictEqual(resolved2, instance2);

			const resolvedList = locator.resolveAll('type');

			assert.strictEqual(resolvedList.length, 2);
			assert.strictEqual(resolvedList[0], instance2);
			assert.strictEqual(resolvedList[1], instance1);
		});
	});

	describe('#resolve', function() {
		it('should properly resolve an instance of the registered class implementation', function() {
			class Implementation {
				constructor(locator) {
					this.locator = locator;
				}
			}

			locator.register('test', Implementation);
			const instance = locator.resolve('test');
			assert.strictEqual(instance instanceof Implementation, true);
			assert.strictEqual(instance.locator, locator);
		});

		it('should properly resolve an instance of the registered constructor/prototype implementation', function() {
			function Implementation(locator) {
				this.locator = locator;
			}

			locator.register('test', Implementation);
			const instance = locator.resolve('test');
			assert.strictEqual(instance instanceof Implementation, true);
			assert.strictEqual(instance.locator, locator);
		});

		it('should throw an error if the specified type name was not found', function() {
			assert.throws(function() {
				locator.resolve('not exists');
			});
		});

		it('should throw an error if the specified type name is not a string', function() {
			assert.throws(function() {
				locator.resolve(null);
			});
		});

		it('should return different instances every time', function() {
			locator.register('type', function() {});

			const instance1 = locator.resolve('type');
			const instance2 = locator.resolve('type');

			assert.notEqual(instance1, instance2);
		});

		it('should return the same instance every time if it is a singleton', function() {
			locator.register('type', function() {}, true);

			const instance1 = locator.resolve('type');
			const instance2 = locator.resolve('type');

			assert.equal(instance1, instance2);
		});
	});

	describe('#resolveAll', function() {
		it('should resolve all registered implementations of the type name', function() {
			class Implementation1 { }
			function Implementation2() { }
			class Implementation3 { }
			function AnotherImplementation() { }

			locator.register('type', Implementation1);
			locator.register('type', Implementation2);
			locator.register('type', Implementation3);
			locator.register('anotherType', AnotherImplementation);

			var instances = locator.resolveAll('type');
			assert.strictEqual(instances.length, 3);
			assert.strictEqual(instances[0] instanceof Implementation3, true);
			assert.strictEqual(instances[1] instanceof Implementation2, true);
			assert.strictEqual(instances[2] instanceof Implementation1, true);
		});

		it('should throw an error if the specified type was not found', function() {
			assert.throws(() => {
				locator.resolveAll('not exists');
			});
		});

		it('should throw an error if the specified type is not a string', function() {
			assert.throws(() => {
				locator.resolveAll(null);
			});
		});
	});
});
