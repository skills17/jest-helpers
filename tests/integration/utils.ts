import path from 'node:path';
import {exec} from 'node:child_process';
import process from 'node:process';

export async function executeJest(
	testName: string,
	args: string,
	env?: Record<string, string>,
): Promise<{exitCode: number; output: string}> {
	return new Promise(resolve => {
		const bin = path.resolve(__dirname, '..', '..', 'bin', 'skills17-jest');

		// Execute jest in the subdirectory
		const cmd = exec(`${bin} ${args}`, {
			cwd: path.resolve(__dirname, testName),
			env: {...process.env, ...env},
		});

		// Catch output
		let output = '';
		cmd.stdout?.on('data', data => {
			output += String(data);
		});
		cmd.stderr?.on('data', data => {
			output += String(data);
		});

		// Wait until the process finishes
		cmd.on('exit', (code: number) => {
			resolve({exitCode: code, output});
		});
	});
}
