import fs from 'node:fs';
import path from 'node:path';
import uniqid from 'uniqid';
import type TaskConfig from '@skills17/task-config';
import {type TestRun} from '@skills17/test-result';

/**
 * Store a test run in a history file
 */
export default function storeTestRun(config: TaskConfig, testRun: TestRun): void {
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
