import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import * as z from 'zod/mini';
import { createTable } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const ItemSchema = z.looseObject({ name: z.string() });
const KEY = { PK: 'HH#h1', SK: 'META' };

describe('createTable', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('get', () => {
    it('reads one item with a consistent read and returns it typed', async () => {
      ddbMock.on(GetCommand).resolves({ Item: { ...KEY, name: 'Home' } });

      const item = await table.get(KEY, ItemSchema);

      expect(item?.name).toBe('Home');
      expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input).toEqual({
        TableName: 'fridgeboard',
        Key: KEY,
        ConsistentRead: true,
      });
    });

    it('returns undefined for a missing item or one of another shape', async () => {
      ddbMock
        .on(GetCommand)
        .resolvesOnce({})
        .resolvesOnce({ Item: { name: 1 } });

      expect(await table.get(KEY, ItemSchema)).toBeUndefined();
      expect(await table.get(KEY, ItemSchema)).toBeUndefined();
    });
  });

  describe('query', () => {
    const params = {
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'x' },
    };

    it('follows pagination and keeps only items of the expected shape', async () => {
      ddbMock
        .on(QueryCommand)
        .resolvesOnce({ Items: [{ name: 'a' }, { nope: 1 }], LastEvaluatedKey: { PK: 'p' } })
        .resolvesOnce({ Items: [{ name: 'b' }] });

      const items = await table.query({ ...params, IndexName: 'GSI1' }, ItemSchema);

      expect(items.map(({ name }) => name)).toEqual(['a', 'b']);
      const queries = ddbMock.commandCalls(QueryCommand);
      expect(queries[0]?.args[0].input).toMatchObject({
        TableName: 'fridgeboard',
        IndexName: 'GSI1',
      });
      expect(queries[1]?.args[0].input.ExclusiveStartKey).toEqual({ PK: 'p' });
    });

    it('returns an empty list when nothing matches', async () => {
      ddbMock.on(QueryCommand).resolves({});

      expect(await table.query(params, ItemSchema)).toEqual([]);
    });
  });

  describe('batchGet', () => {
    const keys = (count: number) =>
      Array.from({ length: count }, (_, index) => ({ PK: `HH#h${index}`, SK: 'META' }));

    it('returns nothing without asking when there are no keys', async () => {
      expect(await table.batchGet([], ItemSchema)).toEqual([]);
      expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(0);
    });

    it('chunks at 100 keys', async () => {
      ddbMock.on(BatchGetCommand).resolves({ Responses: { fridgeboard: [] } });

      await table.batchGet(keys(101), ItemSchema);

      expect(
        ddbMock
          .commandCalls(BatchGetCommand)
          .map((call) => call.args[0].input.RequestItems?.fridgeboard?.Keys?.length),
      ).toEqual([100, 1]);
    });

    it('retries unprocessed keys once', async () => {
      ddbMock
        .on(BatchGetCommand)
        .resolvesOnce({
          Responses: { fridgeboard: [] },
          UnprocessedKeys: { fridgeboard: { Keys: [KEY] } },
        })
        .resolvesOnce({ Responses: { fridgeboard: [{ ...KEY, name: 'Home' }] } });

      const items = await table.batchGet([KEY], ItemSchema);

      expect(items.map(({ name }) => name)).toEqual(['Home']);
      expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
    });

    it('throws when keys are still unprocessed after the retry', async () => {
      ddbMock.on(BatchGetCommand).resolves({
        Responses: { fridgeboard: [] },
        UnprocessedKeys: { fridgeboard: { Keys: [KEY] } },
      });

      await expect(table.batchGet([KEY], ItemSchema)).rejects.toThrow('UNPROCESSED_KEYS');
      expect(ddbMock.commandCalls(BatchGetCommand)).toHaveLength(2);
    });
  });

  describe('put', () => {
    it('writes the item to the table', async () => {
      ddbMock.on(PutCommand).resolves({});

      await table.put({ ...KEY, name: 'Home' });

      expect(ddbMock.commandCalls(PutCommand)[0]?.args[0].input).toEqual({
        TableName: 'fridgeboard',
        Item: { ...KEY, name: 'Home' },
      });
    });
  });
});
