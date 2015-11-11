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

module.exports = ConstructorTokenizer;

var STATES = {
	ILLEGAL: -1,
	NO: 0,
	IDENTIFIER: 1,
	FUNCTION: 2,
	PARENTHESES_OPEN: 3,
	PARENTHESES_CLOSE: 4,
	COMMA: 5,
	END: 6
};
ConstructorTokenizer.STATES = STATES;

var KEYWORDS = {
	FUNCTION: 'function'
};

var WHITESPACE_TEST = /^\s$/,
	IDENTIFIER_TEST = /^[\$\w]$/;

function ConstructorTokenizer(constructorSource) {
	this._source = String(constructorSource || '');
}

/**
 * Current source code of constructor.
 * @type {string}
 * @private
 */
ConstructorTokenizer.prototype._source = '';

/**
 * Current index in source code.
 * @type {number}
 * @private
 */
ConstructorTokenizer.prototype._currentIndex = 0;

/**
 * Current index in source code.
 * @type {number}
 * @private
 */
ConstructorTokenizer.prototype._currentEnd = 0;

/**
 * Current state.
 * @type {number}
 * @private
 */
ConstructorTokenizer.prototype._currentState = STATES.NO;

/**
 * Gets next token in source.
 * @returns {{state: (number), start: number, end: number}} Token descriptor.
 */
ConstructorTokenizer.prototype.next = function () {
	if (this._currentState === STATES.ILLEGAL ||
		this._currentState === STATES.END) {
		return {
			state: this._currentState,
			start: this._currentIndex,
			end: this._currentIndex + 1
		};
	}

	var start = this._currentIndex,
		state = this._currentState;

	switch (this._currentState) {
		case STATES.PARENTHESES_OPEN:
			this.parenthesesOpenState();
			break;
		case STATES.PARENTHESES_CLOSE:
			this.parenthesesCloseState();
			break;
		case STATES.IDENTIFIER:
			this.identifierState();
			break;
		case STATES.COMMA:
			this.commaState();
			break;
		case STATES.FUNCTION:
			this.functionState();
			break;
		default:
			this.skipWhitespace();
			var expected = this._source.substr(
				this._currentIndex, KEYWORDS.FUNCTION.length
			);
			if (expected === KEYWORDS.FUNCTION) {
				this._currentState = STATES.FUNCTION;
				return this.next();
			}

			state = STATES.ILLEGAL;
	}

	return {
		state: state,
		start: start,
		end: this._currentEnd
	};
};

/**
 * Skips all whitespace characters.
 */
ConstructorTokenizer.prototype.skipWhitespace = function () {
	while (
		this._currentIndex < this._source.length &&
		WHITESPACE_TEST.test(this._source[this._currentIndex])) {
		this._currentIndex++;
	}
};

/**
 * Describes PARENTHESES_OPEN state of machine.
 */
ConstructorTokenizer.prototype.parenthesesOpenState = function () {
	this._currentIndex++;
	this._currentEnd = this._currentIndex;

	this.skipWhitespace();
	if (IDENTIFIER_TEST.test(this._source[this._currentIndex])) {
		this._currentState = STATES.IDENTIFIER;
	} else if (this._source[this._currentIndex] === ')') {
		this._currentState = STATES.PARENTHESES_CLOSE;
	} else {
		this._currentState = STATES.ILLEGAL;
	}
};

/**
 * Describes PARENTHESES_CLOSE state of machine.
 */
ConstructorTokenizer.prototype.parenthesesCloseState = function () {
	this._currentIndex++;
	this._currentEnd = this._currentIndex;
	this._currentState = STATES.END;
};

/**
 * Describes FUNCTION state of machine.
 */
ConstructorTokenizer.prototype.functionState = function () {
	this._currentIndex += KEYWORDS.FUNCTION.length;
	this._currentEnd = this._currentIndex;

	this.skipWhitespace();

	if (this._source[this._currentIndex] === '(') {
		this._currentState = STATES.PARENTHESES_OPEN;
	} else if (IDENTIFIER_TEST.test(this._source[this._currentIndex])) {
		this._currentState = STATES.IDENTIFIER;
	} else {
		this._currentState = STATES.ILLEGAL;
	}
};

/**
 * Describes IDENTIFIER state of machine.
 */
ConstructorTokenizer.prototype.identifierState = function () {
	while (
		this._currentIndex < this._source.length &&
		IDENTIFIER_TEST.test(this._source[this._currentIndex])) {
		this._currentIndex++;
	}

	this._currentEnd = this._currentIndex;

	this.skipWhitespace();
	if (this._source[this._currentIndex] === '(') {
		this._currentState = STATES.PARENTHESES_OPEN;
	} else if (this._source[this._currentIndex] === ')') {
		this._currentState = STATES.PARENTHESES_CLOSE;
	} else if (this._source[this._currentIndex] === ',') {
		this._currentState = STATES.COMMA;
	} else {
		this._currentState = STATES.ILLEGAL;
	}
};

/**
 * Describes COMMA state of machine.
 */
ConstructorTokenizer.prototype.commaState = function () {
	this._currentIndex++;
	this._currentEnd = this._currentIndex;

	this.skipWhitespace();
	if (IDENTIFIER_TEST.test(this._source[this._currentIndex])) {
		this._currentState = STATES.IDENTIFIER;
		return;
	}
	this._currentState = STATES.ILLEGAL;
};