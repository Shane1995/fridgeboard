import { DynamoDBClient, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../table/index.ts';
import { commitChange } from './index.ts';

vi.mock('../sleep/index.ts', () => ({ sleep: vi.fn().mockResolvedValue(undefined) }));

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const ITEM_PUT = { PK: 'HH#hh-1', SK: 'ITEM#main#abc', name: 'Milk' };
const OPTIONS = {
  table,
  householdId: 'hh-1',
  type: 'item' as const,
  id: 'abc',
  items: [{ put: ITEM_PUT }],
};

const clash = () =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: [{ Code: 'None' }, { Code: 'ConditionalCheckFailed' }, { Code: 'None' }],
  });

const sent = () => ddbMock.commandCalls(TransactWriteCommand).map((call) => call.args[0].input);

describe('commitChange', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('takes rev 1 for a household that has none and writes the change in the same transaction', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home' } });
    ddbMock.on(TransactWriteCommand).resolves({});

    const change = await commitChange(OPTIONS);

    expect(change).toEqual({ id: 'abc', rev: 1, type: 'item' });
    const [input] = sent();
    expect(input?.TransactItems).toEqual([
      { Put: { TableName: 'fridgeboard', Item: ITEM_PUT } },
      {
        Update: {
          TableName: 'fridgeboard',
          Key: { PK: 'HH#hh-1', SK: 'META' },
          UpdateExpression: 'SET #a0 = :v0',
          ConditionExpression: 'attribute_exists(PK) AND attribute_not_exists(#rev)',
          ExpressionAttributeNames: { '#a0': 'rev', '#rev': 'rev' },
          ExpressionAttributeValues: { ':v0': 1 },
        },
      },
      {
        Put: {
          TableName: 'fridgeboard',
          Item: {
            PK: 'HH#hh-1',
            SK: 'CHG#0000000001',
            rev: 1,
            type: 'item',
            id: 'abc',
            ttl: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          },
        },
      },
    ]);
  });

  it('moves on from the rev it read and requires it to be unchanged', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home', rev: 41 } });
    ddbMock.on(TransactWriteCommand).resolves({});

    const change = await commitChange(OPTIONS);

    expect(change.rev).toBe(42);
    const update = sent()[0]?.TransactItems?.[1]?.Update;
    expect(update?.ConditionExpression).toBe('#rev = :current');
    expect(update?.ExpressionAttributeValues).toEqual({ ':v0': 42, ':current': 41 });
  });

  it('reads again and takes the next rev when another writer got there first', async () => {
    ddbMock
      .on(GetCommand)
      .resolvesOnce({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home', rev: 41 } })
      .resolvesOnce({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home', rev: 42 } });
    ddbMock.on(TransactWriteCommand).rejectsOnce(clash()).resolves({});

    const change = await commitChange(OPTIONS);

    expect(change.rev).toBe(43);
    expect(sent()).toHaveLength(2);
  });

  it('gives up after ten clashes', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home', rev: 5 } });
    ddbMock.on(TransactWriteCommand).rejects(clash());

    await expect(commitChange(OPTIONS)).rejects.toThrow('REV_CONFLICT');
    expect(sent()).toHaveLength(10);
  });

  it('does not retry a failure that is not a rev clash', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home' } });
    ddbMock.on(TransactWriteCommand).rejects(new Error('throttled'));

    await expect(commitChange(OPTIONS)).rejects.toThrow('throttled');
    expect(sent()).toHaveLength(1);
  });

  it('does not retry when the caller own condition failed instead of the rev', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home' } });
    ddbMock.on(TransactWriteCommand).rejects(
      new TransactionCanceledException({
        message: 'cancelled',
        $metadata: {},
        CancellationReasons: [
          { Code: 'ConditionalCheckFailed' },
          { Code: 'None' },
          { Code: 'None' },
        ],
      }),
    );

    await expect(commitChange(OPTIONS)).rejects.toBeInstanceOf(TransactionCanceledException);
    expect(sent()).toHaveLength(1);
  });

  it('stops at once when the household does not exist', async () => {
    ddbMock.on(GetCommand).resolves({});

    await expect(commitChange(OPTIONS)).rejects.toThrow('HOUSEHOLD_MISSING');
    expect(sent()).toHaveLength(0);
  });
});
