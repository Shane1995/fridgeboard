import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { isConditionFailedAt } from './index.ts';

const cancelled = (codes: string[]) =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

describe('isConditionFailedAt', () => {
  it('is true when the condition of the item at that position failed', () => {
    expect(
      isConditionFailedAt({ error: cancelled(['ConditionalCheckFailed', 'None']), index: 0 }),
    ).toBe(true);
  });

  it('is false when another item failed or the failure was something else', () => {
    expect(
      isConditionFailedAt({ error: cancelled(['None', 'ConditionalCheckFailed']), index: 0 }),
    ).toBe(false);
    expect(isConditionFailedAt({ error: cancelled(['TransactionConflict']), index: 0 })).toBe(
      false,
    );
    expect(isConditionFailedAt({ error: new Error('boom'), index: 0 })).toBe(false);
  });
});
