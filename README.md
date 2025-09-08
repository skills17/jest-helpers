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
"test": "skills17-jest run",
"test:json": "skills17-jest run --json"
},
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

### CLI

As seen in the installation instructions, the `skills17-jest` command is available.

It is a thin wrapper around the `jest` command.

All arguments to the command will be forwarded to `jest` so Jest can be used exactly the same way if this package
wouldn't be installed.

Additionally, the following new arguments are available:

- `--json` output the test result with scored points in json to standard out

## License

[MIT](https://github.com/skills17/jest-helpers/blob/master/LICENSE)
