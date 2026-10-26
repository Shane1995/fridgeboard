import { CONDITION_FAILED } from '../cancellationCodeAt/constants.ts';

export const RETRYABLE_REV_CODES: readonly string[] = [CONDITION_FAILED, 'TransactionConflict'];
