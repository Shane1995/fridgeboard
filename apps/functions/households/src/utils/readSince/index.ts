import { SINCE_PATTERN } from './constants.ts';
import type { ReadSinceOptions, SinceResult } from './types.ts';

export const readSince = ({ value }: ReadSinceOptions): SinceResult => {
  if (value === undefined) {
    return { status: 'none' };
  }
  return SINCE_PATTERN.test(value) ? { status: 'ok', since: Number(value) } : { status: 'invalid' };
};
