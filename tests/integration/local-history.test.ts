import path from 'node:path';
import fs from 'node:fs';
import {executeJest} from './utils.ts';

const historyDir = path.resolve(__dirname, 'local-history', '.history');
const disabledHistoryDir = path.resolve(__dirname, 'local-history-disabled', '.history');

describe('local history', () => {
	beforeEach(() => {
		if (fs.existsSync(historyDir)) {
			fs.rmSync(historyDir, {recursive: true});
		}
	});

	it('stores a history file for a test run', async () => {
		expect(fs.existsSync(historyDir)).toEqual(false);

		// Execute jest in the subdirectory
		await executeJest('local-history');

		expect(fs.existsSync(historyDir)).toEqual(true);

		const historyFiles = fs.readdirSync(historyDir);

		expect(historyFiles).toHaveLength(1);

		for (const file of historyFiles) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const history: any = JSON.parse(fs.readFileSync(path.resolve(historyDir, file)).toString());

			expect(typeof history.time).toEqual('number');
			expect(history.testResults).toStrictEqual([
				{
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					group: history.testResults[0].group,
					points: 1,
					maxPoints: 1,
					strategy: 'add',
					manualCheck: false,
					tests: [
						{
							name: 'adds 1 + 2 to equal 3',
							points: 1,
							maxPoints: 1,
							successful: true,
							required: false,
							manualCheck: false,
						},
					],
				},
			]);
		}
	}, 60_000);

	it('is disabled by default', async () => {
		expect(fs.existsSync(disabledHistoryDir)).toEqual(false);

		// Execute newman in the subdirectory
		await executeJest('local-history-disabled', 'run');

		expect(fs.existsSync(disabledHistoryDir)).toEqual(false);
	}, 60_000);
});
