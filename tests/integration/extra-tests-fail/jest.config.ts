import process from 'node:process';
import {type JestConfigWithTsJest} from 'ts-jest';

const jsonOnlyReport = Boolean(process.env.SKILLS17_JSON);

const config: JestConfigWithTsJest = {
	clearMocks: true,
	reporters: jsonOnlyReport
		? [['../../../lib/skills17-reporter', {json: jsonOnlyReport}]]
		: ['../../../lib/skills17-reporter'],
	testEnvironment: 'node',
};

export default config;
