import { DynamoDBClient, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { joinHousehold } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const invite = { PK: 'INVITE#jess@example.com', SK: 'INVITE' };

const cancelled = (...codes: string[]): TransactionCanceledException =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

describe('joinHousehold', () => {
  beforeEach(() => {
    ddbMock.reset();
    ddbMock.on(TransactWriteCommand).resolves({});
  });

  it('checks the household exists, adds the member and consumes the invite atomically', async () => {
    await joinHousehold(client, 'fridgeboard', { hhId: 'hh-1', sub: 'sub-1', invite });

    const items = ddbMock.commandCalls(TransactWriteCommand)[0]?.args[0].input.TransactItems;
    expect(items).toHaveLength(3);
    expect(items?.[0]?.ConditionCheck).toMatchObject({
      TableName: 'fridgeboard',
      Key: { PK: 'HH#hh-1', SK: 'META' },
      ConditionExpression: 'attribute_exists(PK)',
    });
    expect(items?.[1]?.Put).toMatchObject({
      Item: {
        PK: 'HH#hh-1',
        SK: 'MEMBER#sub-1',
        GSI1PK: 'USER#sub-1',
        GSI1SK: 'HH#hh-1',
        role: 'member',
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    });
    expect(items?.[2]?.Delete).toMatchObject({ TableName: 'fridgeboard', Key: invite });
  });

  it('is a no-op that still consumes the invite when the membership already exists', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('None', 'ConditionalCheckFailed', 'None'));

    await expect(
      joinHousehold(client, 'fridgeboard', { hhId: 'hh-1', sub: 'sub-1', invite }),
    ).resolves.toBeUndefined();
    expect(ddbMock.commandCalls(DeleteCommand)[0]?.args[0].input).toMatchObject({ Key: invite });
  });

  it('throws and keeps the invite when the household no longer exists', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('ConditionalCheckFailed', 'None', 'None'));

    await expect(
      joinHousehold(client, 'fridgeboard', { hhId: 'hh-1', sub: 'sub-1', invite }),
    ).rejects.toThrow('HOUSEHOLD_NOT_FOUND');
    expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(0);
  });

  it('rethrows other errors', async () => {
    ddbMock.on(TransactWriteCommand).rejects(new Error('boom'));

    await expect(
      joinHousehold(client, 'fridgeboard', { hhId: 'hh-1', sub: 'sub-1', invite }),
    ).rejects.toThrow('boom');
  });
});
