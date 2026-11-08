import { DEFAULT_KIND, LAMBDA_KINDS, NAME_PATTERN, USAGE } from '../constants.ts';
import type { LambdaKind } from '../types.ts';
import type { ScaffoldArgs } from './types.ts';

const isLambdaKind = (value: string): value is LambdaKind =>
  LAMBDA_KINDS.some((kind) => kind === value);

export const parseScaffoldArgs = (argv: string[]): ScaffoldArgs => {
  const [name, kind = DEFAULT_KIND] = argv;

  if (name === undefined || !NAME_PATTERN.test(name) || !isLambdaKind(kind)) {
    throw new Error(USAGE);
  }

  return { name, kind };
};
