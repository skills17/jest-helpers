module.exports = {
	maxWorkers: 1,
	testEnvironment: 'node',
	testRegex: String.raw`.+\/tests\/integration\/.*\.test.ts$`,
	testPathIgnorePatterns: ['/node_modules/'],
};
