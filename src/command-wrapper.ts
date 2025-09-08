#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';
import spawn from 'cross-spawn';
import {npmRunPathEnv} from 'npm-run-path';
import TaskConfig from '@skills17/task-config';

export default class CommandWrapper {
	private readonly config: TaskConfig;

	constructor(private readonly argv: string[]) {
		this.config = new TaskConfig();
		this.config.loadFromFileSync();
	}

	/**
   * Processes the command
   */
	public async process(): Promise<void> {
		// Load config
		await this.config.loadFromFile();

		if (!this.isJson()) {
			console.log('Starting Jest...');
		}

		// Remove old reports
		const mutationReportsDir = path.resolve(this.config.getProjectRoot(), 'reports');
		if (fs.existsSync(mutationReportsDir)) {
			fs.rmSync(mutationReportsDir, {recursive: true});
		}

		// Run jest
		const exitCode = await this.runJest();

		if (this.config.isLocalHistoryEnabled()) {
			// Implement storeTestRun(this.config, this.testRun);
		}

		process.exit(exitCode);
	}

	private async runJest(): Promise<number> {
		return new Promise(resolve => {
			const jest = spawn('jest', this.buildJestArgs(), {
				cwd: this.config.getProjectRoot(),
				env: {
					...npmRunPathEnv({env: process.env}),
				},
			});

			jest.on('exit', code => {
				resolve(code ?? 1);
			});
			jest.stdout?.pipe(process.stdout);
			jest.stderr?.pipe(process.stderr);
		});
	}

	/**
   * Returns whether the output is json or not
   */
	private isJson(): boolean {
		return this.argv.includes('--json');
	}

	/**
   * Builds arguments that will be passed to the jest command
   */
	private buildJestArgs(): string[] {
		const args = this.argv.filter(arg => arg !== '--json');

		// Add json reporter
		if (!args.includes('--reporters') && args.length > 0) {
			if (this.isJson()) {
				args.push('--reporters', 'json');
			} else {
				args.push('--reporters', 'clear-text,html,json');
			}
		}

		// Avoid any info logs
		args.push('--logLevel', 'warn');

		return args;
	}
}
