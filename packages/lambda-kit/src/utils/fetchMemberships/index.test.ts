import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../table/index.ts';
import { fetchMemberships } from './index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const table = createTable(client, 'fridgeboard');
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('fetchMemberships', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('queries GSI1 for the user and follows pagination', async () => {
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({
        Items: [{ GSI1SK: 'HH#h1', role: 'owner' }],
        LastEvaluatedKey: { PK: 'HH#h1' },
      })
      .resolvesOnce({ Items: [{ GSI1SK: 'HH#h2', role: 'member' }] });

    const items = await fetchMemberships(table, 'sub-1');

    expect(items).toEqual([
      { GSI1SK: 'HH#h1', role: 'owner' },
      { GSI1SK: 'HH#h2', role: 'member' },
    ]);
    const queries = ddbMock.commandCalls(QueryCommand);
    expect(queries[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': 'USER#sub-1' },
    });
    expect(queries[1]?.args[0].input.ExclusiveStartKey).toEqual({ PK: 'HH#h1' });
  });

  it('leaves out items that are not memberships', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [{ role: 'owner' }, { GSI1SK: 'HH#h1' }] });

    expect(await fetchMemberships(table, 'sub-1')).toEqual([]);
  });

  it('returns an empty list when nothing matches', async () => {
    ddbMock.on(QueryCommand).resolves({});

    expect(await fetchMemberships(table, 'sub-1')).toEqual([]);
  });
});
