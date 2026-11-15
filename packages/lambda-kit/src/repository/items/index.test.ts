import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { itemKey } from '../../utils/keys/itemKey/index.ts';
import { createTable } from '../../utils/table/index.ts';
import {
  deleteItemOp,
  getItem,
  putItemOp,
  queryItems,
  setItemShopsOp,
  updateItemOp,
} from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const scope = { householdId: 'hh-1', listId: 'main' };

const row = (id: string) => ({
  ...itemKey({ ...scope, itemId: id }),
  id,
  name: id,
  checked: false,
  createdAt: 1,
  addedBy: 'sub-1',
});

describe('queryItems', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads every item under the list’s prefix in the household partition', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [row('a'), row('b')] });

    const items = await queryItems({ table, scope });

    expect(items.map(({ id }) => id)).toEqual(['a', 'b']);
    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': 'HH#hh-1', ':prefix': 'ITEM#main#' },
    });
  });

  it('is empty when the list has no items', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    expect(await queryItems({ table, scope })).toEqual([]);
  });
});

describe('getItem', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads the item by its key', async () => {
    ddbMock.on(GetCommand).resolves({ Item: row('a') });

    const item = await getItem({ table, scope, itemId: 'a' });

    expect(item).toMatchObject({ id: 'a', name: 'a' });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual(
      itemKey({ ...scope, itemId: 'a' }),
    );
  });

  it('is undefined when there is no such item', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await getItem({ table, scope, itemId: 'missing' })).toBeUndefined();
  });
});

describe('item writes', () => {
  const key = itemKey({ ...scope, itemId: 'a' });

  it('puts the item under its own key', () => {
    expect(putItemOp({ scope, item: row('a') })).toEqual({ put: row('a') });
  });

  it('updates an item that must already exist', () => {
    expect(updateItemOp({ scope, itemId: 'a', set: { checked: true } })).toEqual({
      update: key,
      parts: { set: { checked: true } },
      condition: { expression: 'attribute_exists(PK)' },
    });
  });

  it('sets an item’s shops without requiring it to exist', () => {
    expect(setItemShopsOp({ scope, itemId: 'a', shopIds: ['s1'] })).toEqual({
      update: key,
      parts: { set: { shopIds: ['s1'] } },
    });
  });

  it('deletes an item by its key', () => {
    expect(deleteItemOp({ scope, itemId: 'a' })).toEqual({ delete: key });
  });
});
