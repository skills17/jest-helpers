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
import * as NodeConfig from '@skills17/task-config';
import * as Printer from '@skills17/test-result-printer';
import uniqid from 'uniqid';

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-assignment
const TaskConfig = ((NodeConfig as any).default).default;
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-assignment
const TestResultPrinter = ((Printer as any).default).default;

export default class Skills17JestReporter implements Reporter {
	public testRun?: TestRun;
	protected _globalConfig: Config.GlobalConfig;
	private readonly isJson: boolean;
	private readonly config: NodeConfig.default;

	constructor(globalConfig: Config.GlobalConfig, options?: any) {
		this._globalConfig = globalConfig;
		this.isJson = Boolean(options.json);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
		this.config = new TaskConfig();
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
		const isExtra = test.path.includes('/extra/');
		for (const result of testResult.testResults) {
			this.testRun?.recordTest(
				`${result.ancestorTitles.join(' > ')} > ${result.title}`,
				result.title,
				isExtra,
				result.status === 'passed',
			);
		}
	}

	onRunComplete(_test?: Set<TestContext>, _runResults?: AggregatedResult): Promise<void> | void {
		if (this.isJson) {
			console.log(JSON.stringify(this.testRun?.toJSON(), null, 2));
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
			const printer: Printer.default = new TestResultPrinter(this.testRun);
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

	private storeTestRun(config: NodeConfig.default, testRun: TestRun): void {
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
