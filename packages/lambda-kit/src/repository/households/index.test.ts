import { DynamoDBClient, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../../utils/table/index.ts';
import {
  createHouseholdRecord,
  getHouseholdRev,
  getUsernames,
  queryChanges,
  queryMemberships,
  reserveInvite,
} from './index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const table = createTable(client, 'fridgeboard');
const ddbMock = mockClient(DynamoDBDocumentClient);

const cancelled = (...codes: string[]) =>
  new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => ({ Code })),
  });

const transactItems = () =>
  ddbMock.commandCalls(TransactWriteCommand)[0]?.args[0].input.TransactItems ?? [];

describe('households repository', () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.stubEnv('TABLE_NAME', 'fridgeboard');
  });

  describe('queryMemberships', () => {
    it('reads every member row of the household', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [{ PK: 'HH#hh-1', SK: 'MEMBER#u1', role: 'owner' }],
      });

      const members = await queryMemberships({ table, householdId: 'hh-1' });

      expect(members).toMatchObject([{ SK: 'MEMBER#u1', role: 'owner' }]);
      expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: { ':pk': 'HH#hh-1', ':prefix': 'MEMBER#' },
      });
    });
  });

  describe('getUsernames', () => {
    it('maps each sub to its username', async () => {
      ddbMock.on(BatchGetCommand).resolves({
        Responses: {
          fridgeboard: [
            { PK: 'USER#u1', SK: 'PROFILE', username: 'amy' },
            { PK: 'USER#u2', SK: 'PROFILE' },
          ],
        },
      });

      const usernames = await getUsernames({ table, subs: ['u1', 'u2'] });

      expect(usernames.get('u1')).toBe('amy');
      expect(usernames.get('u2')).toBeUndefined();
    });

    it('makes no call for no subs', async () => {
      expect((await getUsernames({ table, subs: [] })).size).toBe(0);
      expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(0);
    });
  });

  describe('getHouseholdRev', () => {
    it('reads the revision from the household meta row', async () => {
      ddbMock
        .on(GetCommand)
        .resolves({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home', rev: 7 } });

      expect(await getHouseholdRev({ table, householdId: 'hh-1' })).toBe(7);
    });

    it('is 0 for a household that has no revision yet', async () => {
      ddbMock.on(GetCommand).resolves({ Item: { PK: 'HH#hh-1', SK: 'META', name: 'Home' } });

      expect(await getHouseholdRev({ table, householdId: 'hh-1' })).toBe(0);
    });

    it('is 0 when there is no meta row', async () => {
      ddbMock.on(GetCommand).resolves({});

      expect(await getHouseholdRev({ table, householdId: 'hh-1' })).toBe(0);
    });
  });

  describe('queryChanges', () => {
    it('reads the change rows from one revision to another with a consistent read', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [{ PK: 'HH#hh-1', SK: 'CHG#0000000004', rev: 4, type: 'item', id: 'i1' }],
      });

      const rows = await queryChanges({ table, householdId: 'hh-1', from: 4, to: 6 });

      expect(rows).toMatchObject([{ rev: 4, type: 'item', id: 'i1' }]);
      expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
        ConsistentRead: true,
        KeyConditionExpression: 'PK = :pk AND SK BETWEEN :from AND :to',
        ExpressionAttributeValues: {
          ':pk': 'HH#hh-1',
          ':from': 'CHG#0000000004',
          ':to': 'CHG#0000000006',
        },
      });
    });
  });

  describe('createHouseholdRecord', () => {
    const create = () =>
      createHouseholdRecord({
        client,
        id: 'hh-1',
        sub: 'u1',
        name: 'Home',
        isAdmin: false,
        now: '2026-11-15T00:00:00.000Z',
      });

    it('writes the household, its owner membership and the owner guard in one transaction', async () => {
      ddbMock.on(TransactWriteCommand).resolves({});

      const result = await create();

      expect(result).toBe('created');
      const items = transactItems();
      expect(items).toHaveLength(4);
      expect(items[1]?.Put?.Item).toMatchObject({ PK: 'HH#hh-1', name: 'Home', ownerSub: 'u1' });
      expect(items[2]?.Put?.Item).toMatchObject({ SK: 'MEMBER#u1', role: 'owner' });
    });

    it('reports a caller who may not create a household', async () => {
      ddbMock
        .on(TransactWriteCommand)
        .rejects(cancelled('ConditionalCheckFailed', 'None', 'None', 'None'));

      expect(await create()).toBe('not-allowed');
    });

    it('reports a caller who already owns a household', async () => {
      ddbMock
        .on(TransactWriteCommand)
        .rejects(cancelled('None', 'None', 'None', 'ConditionalCheckFailed'));

      expect(await create()).toBe('household-exists');
    });

    it('rethrows a cancellation it does not know and any other failure', async () => {
      ddbMock
        .on(TransactWriteCommand)
        .rejectsOnce(cancelled('None', 'None', 'None', 'None'))
        .rejects(new Error('boom'));

      await expect(create()).rejects.toThrow(TransactionCanceledException);
      await expect(create()).rejects.toThrow('boom');
    });
  });

  describe('reserveInvite', () => {
    const reserve = () =>
      reserveInvite({ client, householdId: 'hh-1', sub: 'u1', email: 'a@x.com', now: 1000 });

    it('checks membership, takes an invite slot and writes the invite in one transaction', async () => {
      ddbMock.on(TransactWriteCommand).resolves({});

      const result = await reserve();

      expect(result).toBe('reserved');
      const items = transactItems();
      expect(items).toHaveLength(3);
      expect(items[0]?.ConditionCheck?.Key).toMatchObject({ PK: 'HH#hh-1', SK: 'MEMBER#u1' });
      expect(items[1]?.Update).toMatchObject({
        Key: { PK: 'HH#hh-1', SK: 'META' },
        UpdateExpression: 'ADD invitesUsed :one',
      });
      expect(items[2]?.Put?.Item).toMatchObject({ hhId: 'hh-1', invitedBy: 'u1' });
    });

    it.each([
      ['the caller is not a member', ['ConditionalCheckFailed', 'None', 'None'], 'not-found'],
      [
        'the household has no invites left',
        ['None', 'ConditionalCheckFailed', 'None'],
        'limit-reached',
      ],
      [
        'the email already has a live invite',
        ['None', 'None', 'ConditionalCheckFailed'],
        'already-invited',
      ],
    ])('reports when %s', async (_name, codes, expected) => {
      ddbMock.on(TransactWriteCommand).rejects(cancelled(...codes));

      expect(await reserve()).toBe(expected);
    });

    it('rethrows a cancellation it does not know and any other failure', async () => {
      ddbMock
        .on(TransactWriteCommand)
        .rejectsOnce(cancelled('None', 'None', 'None'))
        .rejects(new Error('boom'));

      await expect(reserve()).rejects.toThrow(TransactionCanceledException);
      await expect(reserve()).rejects.toThrow('boom');
    });
  });
});
