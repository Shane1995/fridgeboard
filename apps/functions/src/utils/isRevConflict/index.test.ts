import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { isRevConflict } from './index.ts';

const cancelled = (codes: string[]) =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

describe('isRevConflict', () => {
  it('is true when the condition failed at the rev position', () => {
    expect(isRevConflict({ error: cancelled(['None', 'ConditionalCheckFailed']), index: 1 })).toBe(
      true,
    );
  });

  it('is false when only another item in the transaction failed its condition', () => {
    expect(isRevConflict({ error: cancelled(['ConditionalCheckFailed', 'None']), index: 1 })).toBe(
      false,
    );
  });

  it('is true when another transaction was touching the rev at the same moment', () => {
    expect(isRevConflict({ error: cancelled(['None', 'TransactionConflict']), index: 1 })).toBe(
      true,
    );
  });

  it('is false for a cancellation for another reason at the rev position', () => {
    expect(isRevConflict({ error: cancelled(['None', 'ValidationError']), index: 1 })).toBe(false);
  });

  it('is false for an error that is not a cancelled transaction', () => {
    expect(isRevConflict({ error: new Error('boom'), index: 0 })).toBe(false);
  });
});
