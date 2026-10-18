import { KNOWN_FLAGS, USAGE } from './constants.ts';
import type { ParsedArgs } from './types.ts';

export type { ParsedArgs } from './types.ts';

export const parseArgs = (argv: string[]): ParsedArgs => {
  const flags = argv.filter((arg) => arg.startsWith('--'));
  const unknown = flags.find((flag) => !KNOWN_FLAGS.includes(flag));
  if (unknown) {
    throw new Error(`Unknown flag ${unknown}. ${USAGE}`);
  }
  const positional = argv.filter((arg) => !arg.startsWith('--'));
  const [email] = positional;
  if (!email || positional.length !== 1) {
    throw new Error(USAGE);
  }
  return {
    email,
    app: flags.includes('--app'),
    admin: flags.includes('--admin'),
    yes: flags.includes('--yes'),
  };
};
