# skills17/jest-helpers

This package provides Jest helpers for usage in a skills competition environment. It includes:

- Custom output formatter

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Installation

**Requirements:**

- Node `22` or greater

To install this package, run the following command:

```bash
npm install @skills17/jest-helpers
```

It is suggested to add the following npm scripts:

```json
"scripts": {
"test": "jest",
"test:json": "cross-env SKILLS17_JSON=true jest"
},
```

`jest.config.ts`:

```typescript
import { JestConfigWithTsJest } from "ts-jest";

const jsonOnlyReport = !!process.env["SKILLS17_JSON"];

const config: JestConfigWithTsJest = {
  reporters: jsonOnlyReport
    ? [["@skills17/jest-helpers", { json: jsonOnlyReport }]]
    : ["default", "@skills17/jest-helpers"],
};

export default config;
```

This will provide the following commands:

- `npm test` - Run all tests once and show a nice output with the awarded points (useful for the competitors to see
  their points)
- `npm run test:json` - Run all tests once and get a json output (useful for automated marking scripts)

## Usage

A `config.yaml` file needs to be created that contains some information about the task. It should be placed in the root
folder of your task, next to the `package.json` file.

See the [`@skills17/task-config`](https://github.com/skills17/task-config#configuration) package for a detailed
description of all available properties in the `config.yaml` file.

## License

[MIT](https://github.com/skills17/jest-helpers/blob/master/LICENSE)
