import path from 'node:path';
import fs from 'node:fs';
import {
	type AggregatedResult,
	type Config,
	type Reporter,
	type ReporterOnStartOptions,
	type Test,
	type TestResult,
} from '@jest/reporters';
import {type TestContext} from '@jest/test-result';
import {type TestRun} from '@skills17/test-result';
import NodeConfig from '@skills17/task-config';
import Printer from '@skills17/test-result-printer';
import uniqid from 'uniqid';

export default class Skills17Reporter implements Reporter {
	public testRun?: TestRun;
	protected _globalConfig: Config.GlobalConfig;
	private readonly isJson: boolean;
	private readonly config: NodeConfig;

	constructor(globalConfig: Config.GlobalConfig, options?: any) {
		this._globalConfig = globalConfig;
		this.isJson = Boolean(options.json);

		this.config = new NodeConfig();
		this.config.loadFromFileSync();
	}

	log(message: string): void {
		if (!this.isJson) {
			console.log(`[LOG] ${message}`);
		}
	}

	onRunStart(_aggregatedResults: AggregatedResult, _options: ReporterOnStartOptions): void {
		this.testRun = this.config.createTestRun();
	}

	onTestStart(_test?: Test): void {
		// Nop
	}

	onTestResult(test: Test, testResult: TestResult, _aggregatedResults: AggregatedResult): void {
		const isExtraPath = test.path.includes('/extra/');
		for (const result of testResult.testResults) {
			const isExtra = isExtraPath || result.ancestorTitles.map(title => title.toLowerCase()).includes('extra');
			this.testRun?.recordTest(
				`${result.ancestorTitles.filter(title => title.toLowerCase() !== 'extra').join(' > ')} > ${result.title}`,
				result.title,
				isExtra,
				result.status === 'passed',
			);
		}
	}

	onRunComplete(_test?: Set<TestContext>, _runResults?: AggregatedResult): Promise<void> | void {
		if (!this.testRun) {
			throw new Error('Test run failed: testRun is undefined');
		}

		if (this.isJson) {
			console.log();
			console.log(JSON.stringify(this.testRun.toJSON(), null, 2));
		} else {
			const printer = new Printer(this.testRun);
			console.log();
			printer.print({
				printFooter: true,
				printPoints: this.config.arePointsDisplayed(),
			});
		}

		if (this.config.isLocalHistoryEnabled() && this.testRun) {
			this.storeTestRun(this.config, this.testRun);
		}
	}

	private storeTestRun(config: NodeConfig, testRun: TestRun): void {
		const historyDir = path.resolve(config.getProjectRoot(), '.history');
		const historyFile = path.resolve(historyDir, `${uniqid()}.json`);

		// Create history dir if it doesn't exist
		if (!fs.existsSync(historyDir)) {
			fs.mkdirSync(historyDir);
		}

		// Write history file
		fs.writeFileSync(
			historyFile,
			JSON.stringify(
				{time: Math.round(Date.now() / 1000), ...testRun.toJSON()},
				undefined,
				2,
			),
		);
	}
}
