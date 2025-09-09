import sum from './example.js';

/* eslint-disable no-undef */
describe('example', () => {
	test('adds 1 + 2 to equal 3', () => {
		expect(sum(1, 2)).toBe(3);
	});
});
/* eslint-enable no-undef */
