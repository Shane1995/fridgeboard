import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { cancellationCodeAt } from './index.ts';

const cancelled = (codes: string[]) =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

describe('cancellationCodeAt', () => {
  it('returns the reason DynamoDB gave for the item at that position', () => {
    const error = cancelled(['None', 'ConditionalCheckFailed']);

    expect(cancellationCodeAt({ error, index: 0 })).toBe('None');
    expect(cancellationCodeAt({ error, index: 1 })).toBe('ConditionalCheckFailed');
  });

  it('has no code for a position past the reasons', () => {
    expect(cancellationCodeAt({ error: cancelled(['None']), index: 3 })).toBeUndefined();
  });

  it('has no code for an error that is not a cancelled transaction', () => {
    expect(cancellationCodeAt({ error: new Error('boom'), index: 0 })).toBeUndefined();
  });
});
