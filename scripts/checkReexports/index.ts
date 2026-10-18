import { REEXPORT_ERROR, ROOTS } from './constants.ts';
import { findReexports } from './findReexports/index.ts';

const offenders = findReexports(ROOTS);

if (offenders.length > 0) {
  console.error(`${REEXPORT_ERROR}\n${offenders.join('\n')}`);
  process.exitCode = 1;
}
