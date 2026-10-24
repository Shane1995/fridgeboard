import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../table/index.ts';
import { readProfile } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const table = createTable(client, 'fridgeboard');

describe('readProfile', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('returns undefined when there is no profile', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await readProfile(table, 'sub-1')).toBeUndefined();
  });

  it('maps the stored item and defaults the optional fields', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { email: 'jess@example.com' } });

    expect(await readProfile(table, 'sub-1')).toEqual({
      email: 'jess@example.com',
      username: null,
      canCreateHousehold: false,
    });
  });

  it('reads the username and flag and asks for a consistent read', async () => {
    ddbMock
      .on(GetCommand)
      .resolves({ Item: { email: 'a@x.com', username: 'jess', canCreateHousehold: true } });

    expect(await readProfile(table, 'sub-1')).toMatchObject({
      username: 'jess',
      canCreateHousehold: true,
    });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input).toMatchObject({
      Key: { PK: 'USER#sub-1', SK: 'PROFILE' },
      ConsistentRead: true,
    });
  });
});
