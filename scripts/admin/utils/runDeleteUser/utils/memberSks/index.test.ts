import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { memberSks } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('memberSks', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('returns the sort keys of the household members', async () => {
    ddbMock
      .on(QueryCommand, {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': 'HH#h1', ':sk': 'MEMBER#' },
      })
      .resolves({ Items: [{ SK: 'MEMBER#u1' }, { SK: 'MEMBER#u2' }, { SK: 1 }] });

    await expect(memberSks('h1')).resolves.toEqual(['MEMBER#u1', 'MEMBER#u2']);
  });
});
