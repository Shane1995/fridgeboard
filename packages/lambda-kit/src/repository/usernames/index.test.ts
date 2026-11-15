import { DynamoDBClient, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { claimUsername } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const cancelled = (...codes: string[]) =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

const claim = () => claimUsername({ client, sub: 'sub-1', username: 'jess' });

describe('claimUsername', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  it('claims the username and sets it on the profile in one transaction', async () => {
    ddbMock.on(TransactWriteCommand).resolves({});

    expect(await claim()).toBe('claimed');

    const items = ddbMock.commandCalls(TransactWriteCommand)[0]?.args[0].input.TransactItems;
    expect(items).toHaveLength(2);
    expect(items?.[0]?.Put?.Item).toMatchObject({ sub: 'sub-1' });
    expect(items?.[1]?.Update).toMatchObject({
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
      ExpressionAttributeValues: { ':username': 'jess' },
    });
  });

  it('reports a profile that already has a different username', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('None', 'ConditionalCheckFailed'));

    expect(await claim()).toBe('username-set');
  });

  it('reports a username somebody else has taken', async () => {
    ddbMock.on(TransactWriteCommand).rejects(cancelled('ConditionalCheckFailed', 'None'));

    expect(await claim()).toBe('username-taken');
  });

  it('rethrows any other failure', async () => {
    ddbMock.on(TransactWriteCommand).rejects(new Error('boom'));

    await expect(claim()).rejects.toThrow('boom');
  });
});
