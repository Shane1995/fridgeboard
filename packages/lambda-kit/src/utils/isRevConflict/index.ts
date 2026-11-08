import { cancellationCodeAt } from '../cancellationCodeAt/index.ts';
import { RETRYABLE_REV_CODES } from './constants.ts';
import type { IsRevConflictOptions } from './types.ts';

export const isRevConflict = (options: IsRevConflictOptions): boolean =>
  RETRYABLE_REV_CODES.includes(cancellationCodeAt(options) ?? '');
