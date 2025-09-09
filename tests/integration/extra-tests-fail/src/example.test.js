import sum from './example.js';

/* eslint-disable no-undef */
describe('example', () => {
	test('adds 1 + 2 to equal 3', () => {
		expect(sum(1, 2)).toBe(3);
	});
});

describe('extra', () => {
	describe('example', () => {
		test('adds 1 + 2 to equal 3', () => {
			expect(sum(0, 0)).toBe(1);
		});
	});
});
/* eslint-enable no-undef */
