import {
  CreateTableCommand,
  DynamoDBClient,
  UpdateTimeToLiveCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { client } from '../client/index.ts';
import { ensureSeeded } from './index.ts';

const rawMock = mockClient(DynamoDBClient);
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('ensureSeeded', () => {
  beforeEach(() => {
    rawMock.reset();
    ddbMock.reset();
    rawMock.on(CreateTableCommand).resolves({});
    rawMock.on(UpdateTimeToLiveCommand).resolves({});
    ddbMock.on(PutCommand).resolves({});
  });

  it('seeds when the admin profile is missing', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await ensureSeeded(new DynamoDBClient({}), client)).toBe(true);
    expect(ddbMock.commandCalls(PutCommand)).toHaveLength(7);
  });

  it('keeps existing data when the admin profile exists', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { PK: 'p' } });

    expect(await ensureSeeded(new DynamoDBClient({}), client)).toBe(false);
    expect(ddbMock.commandCalls(PutCommand)).toHaveLength(0);
  });
});
