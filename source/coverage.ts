import { build } from './build';
import { cleanCoverageDirectory } from './clean';
import { executeCommand, log, wasCalledFromCLI } from './helpers';

export function coverageTypescriptBuild() {
    log(`Checking coverage of TypeScript unit tests.`);

    executeCommand('nyc', [
        'mocha',
        '--recursive',
        '"./build/**/*.spec.js"'
    ]);
}

export function coverage() {
    cleanCoverageDirectory();
    build();
    coverageTypescriptBuild();
}

if (wasCalledFromCLI(module)) {
    coverage();
}
