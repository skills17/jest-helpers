import spawn from 'cross-spawn';
import { npmRunPathEnv } from 'npm-run-path';
import TaskConfig from '@skills17/task-config';
import path from 'path';
import fs from 'fs';
import TestResultPrinter from '@skills17/test-result-printer';
import ReportReader from './ReportReader';
import storeTestRun from './LocalHistory';

export default class CommandWrapper {
  private readonly config: TaskConfig;

  private readonly reportReader: ReportReader;

  constructor(private readonly argv: string[]) {
    this.config = new TaskConfig();
    this.config.loadFromFileSync();
    this.reportReader = new ReportReader(this.config);
  }

  /**
   * Processes the command
   */
  public async process(): Promise<void> {
    // load config
    await this.config.loadFromFile();

    if (!this.isJson()) {
      console.log('Starting Jest...'); // eslint-disable-line no-console
    }

    // remove old reports
    const mutationReportsDir = path.resolve(this.config.getProjectRoot(), 'reports');
    if (fs.existsSync(mutationReportsDir)) {
      fs.rmSync(mutationReportsDir, { recursive: true });
    }

    // run jest
    const exitCode = await this.runJest().then((newExitCode) => {
      this.reportReader.readTestReport();
      return newExitCode;
    });

    if (this.isJson()) {
      console.log(JSON.stringify(this.reportReader.testRun.toJSON(), null, 2)); // eslint-disable-line no-console
    } else {
      const printer = new TestResultPrinter(this.reportReader.testRun);
      console.log(); // eslint-disable-line no-console
      printer.print({
        printFooter: true,
        printPoints: this.config.arePointsDisplayed(),
      });
    }

    if (this.config.isLocalHistoryEnabled()) {
      storeTestRun(this.config, this.reportReader.testRun);
    }

    process.exit(exitCode);
  }

  private runJest(): Promise<number> {
    return new Promise((resolve) => {
      const jest = spawn('jest', this.buildJestArgs(), {
        cwd: this.config.getProjectRoot(),
        env: {
          ...npmRunPathEnv({ env: process.env }),
        },
      });

      jest.on('exit', (code) => resolve(code ?? 1));
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
    const args = this.argv.filter((arg) => arg !== '--json');

    // add json reporter
    if (!args.includes('--reporters') && args.length > 0) {
      if (this.isJson()) {
        args.push('--reporters', 'json');
      } else {
        args.push('--reporters', 'clear-text,html,json');
      }
    }

    // avoid any info logs
    args.push('--logLevel', 'warn');

    return args;
  }
}
