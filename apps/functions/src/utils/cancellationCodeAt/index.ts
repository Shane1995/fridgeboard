import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import type { CancellationCodeAtOptions } from './types.ts';

export const cancellationCodeAt = ({
  error,
  index,
}: CancellationCodeAtOptions): string | undefined =>
  error instanceof TransactionCanceledException
    ? error.CancellationReasons?.[index]?.Code
    : undefined;
