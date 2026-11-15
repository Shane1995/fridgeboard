import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../../utils/table/index.ts';
import { deleteInvite, getInvite, getInviteExpiry } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const KEY = { PK: 'INVITE#jess@example.com', SK: 'INVITE' };

describe('invites repository', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('getInvite', () => {
    it('reads the invite for a normalised email', async () => {
      ddbMock.on(GetCommand).resolves({ Item: { ...KEY, type: 'household', hhId: 'hh-1' } });

      const invite = await getInvite({ table, email: ' Jess@Example.com' });

      expect(invite).toMatchObject({ type: 'household', hhId: 'hh-1' });
      expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual(KEY);
    });

    it('is undefined when there is no invite', async () => {
      ddbMock.on(GetCommand).resolves({});

      expect(await getInvite({ table, email: 'jess@example.com' })).toBeUndefined();
    });
  });

  describe('getInviteExpiry', () => {
    it('reads when the invite expires', async () => {
      ddbMock.on(GetCommand).resolves({ Item: { expiresAt: 1234 } });

      expect(await getInviteExpiry({ table, email: 'jess@example.com' })).toBe(1234);
    });

    it.each([
      ['no invite', {}],
      ['an expiry that is not a number', { Item: { expiresAt: 'soon' } }],
    ])('is undefined for %s', async (_name, response) => {
      ddbMock.on(GetCommand).resolves(response);

      expect(await getInviteExpiry({ table, email: 'jess@example.com' })).toBeUndefined();
    });
  });

  describe('deleteInvite', () => {
    it('deletes the invite by its key', async () => {
      ddbMock.on(DeleteCommand).resolves({});

      await deleteInvite({ table, email: 'Jess@Example.com' });

      expect(ddbMock.commandCalls(DeleteCommand)[0]?.args[0].input).toMatchObject({
        TableName: 'fridgeboard',
        Key: KEY,
      });
    });
  });
});
