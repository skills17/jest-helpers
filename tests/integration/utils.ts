import path from 'node:path';
import {exec} from 'node:child_process';
import process from 'node:process';

export async function executeJest(
	testName: string,
	args = '',
	env?: Record<string, string>,
): Promise<{exitCode: number; output: string}> {
	return new Promise(resolve => {
		const bin = path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'jest');

		// Execute jest in the subdirectory
		const cmd = exec(`${bin} ${args}`, {
			cwd: path.resolve(__dirname, testName),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			env: {...process.env, FORCE_COLOR: '0', ...env},
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
