import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { TABLE_NAME } from '../clients/constants.ts';
import { queryAll } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

const INPUT = {
  KeyConditionExpression: 'PK = :pk',
  ExpressionAttributeValues: { ':pk': 'USER#u1' },
};

describe('queryAll', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('returns the items of a single page', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [{ PK: 'USER#u1', SK: 'PROFILE' }] });

    await expect(queryAll(INPUT)).resolves.toEqual([{ PK: 'USER#u1', SK: 'PROFILE' }]);
    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toEqual({
      ...INPUT,
      TableName: TABLE_NAME,
      ExclusiveStartKey: undefined,
    });
  });

  it('follows LastEvaluatedKey across pages', async () => {
    const last = { PK: 'USER#u1', SK: 'A' };
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({ Items: [{ SK: 'A' }], LastEvaluatedKey: last })
      .resolvesOnce({ Items: [{ SK: 'B' }] });

    await expect(queryAll(INPUT)).resolves.toEqual([{ SK: 'A' }, { SK: 'B' }]);
    expect(ddbMock.commandCalls(QueryCommand)[1]?.args[0].input.ExclusiveStartKey).toEqual(last);
  });
});
