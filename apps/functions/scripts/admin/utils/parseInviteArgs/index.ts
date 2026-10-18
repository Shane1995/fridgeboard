import { parseArgs, type ParsedArgs } from '../parseArgs/index.ts';

export const parseInviteArgs = (argv: string[]): ParsedArgs => {
  const args = parseArgs(argv);
  if (args.app === (args.household !== undefined)) {
    throw new Error('Invite needs exactly one of --app or --household <id>');
  }
  if (args.admin && !args.app) {
    throw new Error('--admin is only valid with --app');
  }
  return args;
};
