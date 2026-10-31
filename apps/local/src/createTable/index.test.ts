import {
  CreateTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  UpdateTimeToLiveCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from './index.ts';

const ddbMock = mockClient(DynamoDBClient);

describe('createTable', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('creates the table with GSI1 and enables the ttl attribute', async () => {
    ddbMock.on(CreateTableCommand).resolves({});
    ddbMock.on(UpdateTimeToLiveCommand).resolves({});

    await createTable(new DynamoDBClient({}), 'fridgeboard');

    expect(ddbMock.commandCalls(CreateTableCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      GlobalSecondaryIndexes: [{ IndexName: 'GSI1' }],
    });
    expect(ddbMock.commandCalls(UpdateTimeToLiveCommand)).toHaveLength(1);
  });

  it('does nothing more when the table already exists', async () => {
    ddbMock
      .on(CreateTableCommand)
      .rejects(new ResourceInUseException({ message: 'exists', $metadata: {} }));

    await createTable(new DynamoDBClient({}), 'fridgeboard');

    expect(ddbMock.commandCalls(UpdateTimeToLiveCommand)).toHaveLength(0);
  });

  it('rethrows other errors', async () => {
    ddbMock.on(CreateTableCommand).rejects(new Error('boom'));

    await expect(createTable(new DynamoDBClient({}), 'fridgeboard')).rejects.toThrow('boom');
  });
});
