import { parseArgs } from '../parseArgs/index.ts';
import type { ParsedArgs } from '../parseArgs/types.ts';
import { ADMIN_SCOPE_ERROR, INVITE_TARGET_ERROR } from './constants.ts';

export const parseInviteArgs = (argv: string[]): ParsedArgs => {
  const args = parseArgs(argv);
  if (args.app === (args.household !== undefined)) {
    throw new Error(INVITE_TARGET_ERROR);
  }
  if (args.admin && !args.app) {
    throw new Error(ADMIN_SCOPE_ERROR);
  }
  return args;
};
