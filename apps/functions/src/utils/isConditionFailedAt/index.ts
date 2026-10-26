import { cancellationCodeAt } from '../cancellationCodeAt/index.ts';
import { CONDITION_FAILED } from '../cancellationCodeAt/constants.ts';
import type { CancellationCodeAtOptions } from '../cancellationCodeAt/types.ts';

export const isConditionFailedAt = (options: CancellationCodeAtOptions): boolean =>
  cancellationCodeAt(options) === CONDITION_FAILED;
