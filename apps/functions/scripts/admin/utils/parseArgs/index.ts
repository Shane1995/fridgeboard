import {
  ADMIN_FLAG,
  APP_FLAG,
  FLAG_PREFIX,
  HOUSEHOLD_FLAG,
  KNOWN_FLAGS,
  USAGE,
  YES_FLAG,
} from './constants.ts';
import type { ParsedArgs } from './types.ts';

export const parseArgs = (argv: string[]): ParsedArgs => {
  const flags = argv.filter((arg) => arg.startsWith(FLAG_PREFIX));
  const unknown = flags.find((flag) => !KNOWN_FLAGS.includes(flag));
  if (unknown) {
    throw new Error(`Unknown flag ${unknown}. ${USAGE}`);
  }
  const householdIndex = argv.indexOf(HOUSEHOLD_FLAG);
  const household = householdIndex === -1 ? undefined : argv[householdIndex + 1];
  if (householdIndex !== -1 && (!household || household.startsWith(FLAG_PREFIX))) {
    throw new Error(USAGE);
  }
  const positional = argv.filter(
    (arg, index) =>
      !arg.startsWith(FLAG_PREFIX) && (householdIndex === -1 || index !== householdIndex + 1),
  );
  const [email] = positional;
  if (!email || positional.length !== 1) {
    throw new Error(USAGE);
  }
  return {
    email,
    app: flags.includes(APP_FLAG),
    admin: flags.includes(ADMIN_FLAG),
    yes: flags.includes(YES_FLAG),
    household,
  };
};
