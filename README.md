# skills17/jest-helpers

This package provides Jest helpers for usage in a skills competition environment. It includes:

- Custom output formatter

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Grouping](#grouping)
  - [Extra tests](#extra-tests)
- [License](#license)

## Installation

**Requirements:**

- Node `22` or greater
- Jest `30` or greater

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

### Grouping

A core concept is test groups. You usually don't want to test everything for one criterion in one
test function but instead split it into multiple ones for a cleaner test class and a better overview.

In JS, tests are grouped by a test name prefix defined in the `config.yaml` file.

All `describe`s are concatenated with the actual test names before evaluation.

For example, the following test will have the name `Countries > Overview > lists all countries`:

```typescript
describe('Countries', () => {
  describe('Overview', () => {
    it('lists all countries', () => {
      // ...
    });
  });
});
```

To catch and group all tests within the `Overview` description, the group matcher can be set to
`Countries > Overview > .+` for example. Each of the tests within that group will now award 1 point
to the group.

### Extra tests

To prevent cheating, extra tests can be used.
They are not available to the competitors and should test the same things as the normal tests do,
but with different values.

For example, if your normal test contains a check to search the list of all countries by 'Sw*', copy
the test into an extra test and change the search string to 'Ca*'.
Since the competitors will not know the extra test, it would detect statically returned values that
were returned to satisfy the 'Sw*' tests instead of actually implement the search logic.

Extra tests are detected by their `describe`, which should equal `'Extra'` or `'extra'`. That means
that you can wrap your test in an additional extra `describe` like shown below. The other
`describe`s and test names should equal the ones from the normal tests. If they don't, a warning
will be displayed.

```typescript
describe('Extra', () => {    // <-- only this describe has to be added
  describe('Countries', () => {
    it('lists all countries', () => {
      // ...
    });
  });
});
```

It usually makes sense to move the extra tests in a separate folder, so the folder can be deleted
before the tasks are distributed to the competitors.
Nothing else needs to be done or configured.

If an extra test fails while the corresponding normal test passes, a warning will be displayed that
a manual review of that test is required since it detected possible cheating.
The penalty then has to be decided manually from case to case, the points visible in the output
assumed that the test passed and there was no cheating.

## License

[MIT](https://github.com/skills17/jest-helpers/blob/master/LICENSE)
