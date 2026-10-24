import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { fetchMemberships } from './index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('fetchMemberships', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('queries GSI1 for the user and follows pagination', async () => {
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({ Items: [{ GSI1SK: 'HH#h1' }], LastEvaluatedKey: { PK: 'HH#h1' } })
      .resolvesOnce({ Items: [{ GSI1SK: 'HH#h2' }] });

    const items = await fetchMemberships(client, 'fridgeboard', 'sub-1');

    expect(items).toEqual([{ GSI1SK: 'HH#h1' }, { GSI1SK: 'HH#h2' }]);
    const queries = ddbMock.commandCalls(QueryCommand);
    expect(queries[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': 'USER#sub-1' },
    });
    expect(queries[1]?.args[0].input.ExclusiveStartKey).toEqual({ PK: 'HH#h1' });
  });

  it('returns an empty list when nothing matches', async () => {
    ddbMock.on(QueryCommand).resolves({});

    expect(await fetchMemberships(client, 'fridgeboard', 'sub-1')).toEqual([]);
  });
});
