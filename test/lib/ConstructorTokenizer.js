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

var assert = require('assert'),
	ConstructorTokenizer = require('../../lib/ConstructorTokenizer');

describe('ConstructorTokenizer', function () {
	describe('#next', function () {
		it('should properly return ILLEGAL on empty source', function () {
			var tokenizer = new ConstructorTokenizer(''),
				token = tokenizer.next();

			assert.strictEqual(token.start, 0);
			assert.strictEqual(token.end, 0);
			assert.strictEqual(
				token.state, ConstructorTokenizer.STATES.ILLEGAL
			);
		});

		it('should properly return ILLEGAL on token after function',
			function () {
				var source = '   function   {',
					tokenizer = new ConstructorTokenizer(source),
					token = {
						state: ConstructorTokenizer.STATES.NO,
						start: 0,
						end: 0
					},
					expectedTokens = [
						{
							state: ConstructorTokenizer.STATES.FUNCTION,
							start: 3,
							end: 11
						},
						{
							state: ConstructorTokenizer.STATES.ILLEGAL,
							start: 14,
							end: 15
						}
					],
					tokens = [];

				while (
					token.state !== ConstructorTokenizer.STATES.END &&
					token.state !== ConstructorTokenizer.STATES.ILLEGAL
					) {
					token = tokenizer.next();
					tokens.push(token);
				}

				areTokensEqual(tokens, expectedTokens);
			});

		it('should properly return ILLEGAL on token after open parentheses',
			function () {
				var source = '   function   ( {',
					tokenizer = new ConstructorTokenizer(source),
					token = {
						state: ConstructorTokenizer.STATES.NO,
						start: 0,
						end: 0
					},
					expectedTokens = [
						{
							state: ConstructorTokenizer.STATES.FUNCTION,
							start: 3,
							end: 11
						},
						{
							state: ConstructorTokenizer.STATES.PARENTHESES_OPEN,
							start: 14,
							end: 15
						},
						{
							state: ConstructorTokenizer.STATES.ILLEGAL,
							start: 16,
							end: 17
						}
					],
					tokens = [];

				while (
					token.state !== ConstructorTokenizer.STATES.END &&
					token.state !== ConstructorTokenizer.STATES.ILLEGAL
					) {
					token = tokenizer.next();
					tokens.push(token);
				}

				areTokensEqual(tokens, expectedTokens);
			});

		it('should properly return ILLEGAL on token after identifier',
			function () {
				var source = '   function   Some {',
					tokenizer = new ConstructorTokenizer(source),
					token = {
						state: ConstructorTokenizer.STATES.NO,
						start: 0,
						end: 0
					},
					expectedTokens = [
						{
							state: ConstructorTokenizer.STATES.FUNCTION,
							start: 3,
							end: 11
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 14,
							end: 18
						},
						{
							state: ConstructorTokenizer.STATES.ILLEGAL,
							start: 19,
							end: 20
						}
					],
					tokens = [];

				while (
					token.state !== ConstructorTokenizer.STATES.END &&
					token.state !== ConstructorTokenizer.STATES.ILLEGAL
					) {
					token = tokenizer.next();
					tokens.push(token);
				}

				areTokensEqual(tokens, expectedTokens);
			});

		it('should properly return ILLEGAL on token after comma',
			function () {
				var source = '   function   ( param, {',
					tokenizer = new ConstructorTokenizer(source),
					token = {
						state: ConstructorTokenizer.STATES.NO,
						start: 0,
						end: 0
					},
					expectedTokens = [
						{
							state: ConstructorTokenizer.STATES.FUNCTION,
							start: 3,
							end: 11
						},
						{
							state: ConstructorTokenizer.STATES.PARENTHESES_OPEN,
							start: 14,
							end: 15
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 16,
							end: 21
						},
						{
							state: ConstructorTokenizer.STATES.COMMA,
							start: 21,
							end: 22
						},
						{
							state: ConstructorTokenizer.STATES.ILLEGAL,
							start: 23,
							end: 24
						}
					],
					tokens = [];

				while (
					token.state !== ConstructorTokenizer.STATES.END &&
					token.state !== ConstructorTokenizer.STATES.ILLEGAL
					) {
					token = tokenizer.next();
					tokens.push(token);
				}

				areTokensEqual(tokens, expectedTokens);
			});

		it('should properly return tokens on right constructor with name',
			function () {
				var source = '   function   SomeModuleName    \n' +
						'    (     $first   ,  \n   second,third \n, $fourth \n' +
						'){   }',
					tokenizer = new ConstructorTokenizer(source),
					token = {
						state: ConstructorTokenizer.STATES.NO,
						start: 0,
						end: 0
					},
					expectedTokens = [
						{
							state: ConstructorTokenizer.STATES.FUNCTION,
							start: 3,
							end: 11
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 14,
							end: 28
						},
						{
							state: ConstructorTokenizer.STATES.PARENTHESES_OPEN,
							start: 37,
							end: 38
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 43,
							end: 49
						},
						{
							state: ConstructorTokenizer.STATES.COMMA,
							start: 52,
							end: 53
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 59,
							end: 65
						},
						{
							state: ConstructorTokenizer.STATES.COMMA,
							start: 65,
							end: 66
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 66,
							end: 71
						},
						{
							state: ConstructorTokenizer.STATES.COMMA,
							start: 73,
							end: 74
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 75,
							end: 82
						},
						{
							state: ConstructorTokenizer.STATES.PARENTHESES_CLOSE,
							start: 84,
							end: 85
						},
						{
							state: ConstructorTokenizer.STATES.END,
							start: 85,
							end: 86
						}
					],
					tokens = [];

				while (token.state !== ConstructorTokenizer.STATES.END) {
					token = tokenizer.next();
					assert.notStrictEqual(
						token.state, ConstructorTokenizer.STATES.ILLEGAL
					);
					tokens.push(token);
				}

				areTokensEqual(tokens, expectedTokens);
			});
		it('should properly return tokens on right constructor without name',
			function () {
				var source = '   function       \n' +
						'    (     $first   ,  \n   second\n' +
						'){   }',
					tokenizer = new ConstructorTokenizer(source),
					token = {
						state: ConstructorTokenizer.STATES.NO,
						start: 0,
						end: 0
					},
					expectedTokens = [
						{
							state: ConstructorTokenizer.STATES.FUNCTION,
							start: 3,
							end: 11
						},
						{
							state: ConstructorTokenizer.STATES.PARENTHESES_OPEN,
							start: 23,
							end: 24
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 29,
							end: 35
						},
						{
							state: ConstructorTokenizer.STATES.COMMA,
							start: 38,
							end: 39
						},
						{
							state: ConstructorTokenizer.STATES.IDENTIFIER,
							start: 45,
							end: 51
						},
						{
							state: ConstructorTokenizer.STATES.PARENTHESES_CLOSE,
							start: 52,
							end: 53
						},
						{
							state: ConstructorTokenizer.STATES.END,
							start: 53,
							end: 54
						}
					],
					tokens = [];

				while (token.state !== ConstructorTokenizer.STATES.END) {
					token = tokenizer.next();
					assert.notStrictEqual(
						token.state, ConstructorTokenizer.STATES.ILLEGAL
					);
					tokens.push(token);
				}

				areTokensEqual(tokens, expectedTokens);
			});

		it('should properly return tokens on constructor without arguments',
			function () {
				var source = '   function       \n' +
						'    (     \n' +
						'){   }',
					tokenizer = new ConstructorTokenizer(source),
					token = {
						state: ConstructorTokenizer.STATES.NO,
						start: 0,
						end: 0
					},
					expectedTokens = [
						{
							state: ConstructorTokenizer.STATES.FUNCTION,
							start: 3,
							end: 11
						},
						{
							state: ConstructorTokenizer.STATES.PARENTHESES_OPEN,
							start: 23,
							end: 24
						},
						{
							state: ConstructorTokenizer.STATES.PARENTHESES_CLOSE,
							start: 30,
							end: 31
						},
						{
							state: ConstructorTokenizer.STATES.END,
							start: 31,
							end: 32
						}
					],
					tokens = [];

				while (token.state !== ConstructorTokenizer.STATES.END) {
					token = tokenizer.next();
					assert.notStrictEqual(
						token.state, ConstructorTokenizer.STATES.ILLEGAL
					);
					tokens.push(token);
				}

				areTokensEqual(tokens, expectedTokens);
			});
	});
});

function areTokensEqual(actual, expected) {
	assert.strictEqual(actual.length, expected.length);
	for (var i = 0; i < actual.length; i++) {
		assert.strictEqual(
			actual[i].state, expected[i].state
		);
		assert.strictEqual(
			actual[i].start, expected[i].start
		);
		assert.strictEqual(actual[i].end, expected[i].end);

	}
}