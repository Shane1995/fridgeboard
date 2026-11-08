import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { TABLE_NAME } from '../../../clients/constants.ts';
import { deleteKey } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('deleteKey', () => {
  beforeEach(() => {
    ddbMock.reset();
    ddbMock.on(DeleteCommand).resolves({});
  });

  it('deletes only the PK and SK of the item', async () => {
    await deleteKey({ PK: 'USER#u1', SK: 'PROFILE', name: 'Jess' });

    expect(ddbMock.commandCalls(DeleteCommand)[0]?.args[0].input).toEqual({
      TableName: TABLE_NAME,
      Key: { PK: 'USER#u1', SK: 'PROFILE' },
    });
  });
});
