import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../table/index.ts';
import { isMember } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');

describe('isMember', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads the membership by its table key only, not the index attributes', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { GSI1SK: 'HH#hh-1', role: 'member' } });

    expect(await isMember({ table, householdId: 'hh-1', sub: 'sub-1' })).toBe(true);
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual({
      PK: 'HH#hh-1',
      SK: 'MEMBER#sub-1',
    });
  });

  it('is false when there is no membership', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await isMember({ table, householdId: 'hh-1', sub: 'sub-1' })).toBe(false);
  });
});
