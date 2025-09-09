import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {executeJest} from './utils.ts';

describe('integration tests', () => {
	// Get all integration tests
	const integrationTests = fs.readdirSync(__dirname).filter(file => {
		const fileInfo = fs.statSync(path.resolve(__dirname, file));
		return fileInfo.isDirectory();
	});

	it.each(integrationTests)(
		'%s - console reporter',
		async test => {
			// Execute jest in the subdirectory
			const {output} = await executeJest(test);
			const resultOutput = output
				.slice(Math.max(0, output.indexOf('------------       RESULT       ------------')))
				.trim();

			// Update expected output if required
			if (process.env.UPDATE_EXPECTED_OUTPUT === '1') {
				fs.writeFileSync(path.resolve(__dirname, test, 'expected.txt'), resultOutput);
			}

			// Read expected output
			const expectedOutput = fs.readFileSync(path.resolve(__dirname, test, 'expected.txt'));

			expect(resultOutput).toEqual(expectedOutput.toString().trim());
		},
		60_000,
	);

	it.each(integrationTests)(
		'%s - json reporter',
		async test => {
			// Execute jest in the subdirectory
			process.env.SKILLS17_JSON = 'true';
			const {output} = await executeJest(test);
			const resultOutput = output
				.slice(Math.max(0, output.indexOf('------------       RESULT       ------------')))
				.trim();

			// Update expected output if required
			if (process.env.UPDATE_EXPECTED_OUTPUT === '1') {
				fs.writeFileSync(path.resolve(__dirname, test, 'expected.json'), resultOutput);
			}

			// Read expected output
			const expectedOutput = fs.readFileSync(path.resolve(__dirname, test, 'expected.json'));

			expect(resultOutput).toEqual(expectedOutput.toString().trim());
		},
		60_000,
	);
});
