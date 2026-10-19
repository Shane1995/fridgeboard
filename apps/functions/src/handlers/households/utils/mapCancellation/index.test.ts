import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { mapCancellation } from './index.ts';

const cancelled = (...codes: string[]): TransactionCanceledException =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

describe('mapCancellation', () => {
  it('maps a failed profile check to 403 not-allowed', () => {
    const result = mapCancellation(cancelled('ConditionalCheckFailed', 'None', 'None', 'None'));

    expect(result?.statusCode).toBe(403);
    expect(JSON.parse(result?.body ?? '')).toEqual({ reason: 'not-allowed' });
  });

  it('maps a failed owned-household guard to 409 household-exists', () => {
    const result = mapCancellation(cancelled('None', 'None', 'None', 'ConditionalCheckFailed'));

    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? '')).toEqual({ reason: 'household-exists' });
  });

  it('returns undefined for other cancellations and errors', () => {
    expect(mapCancellation(cancelled('None', 'None', 'None', 'None'))).toBeUndefined();
    expect(mapCancellation(new Error('boom'))).toBeUndefined();
  });
});
