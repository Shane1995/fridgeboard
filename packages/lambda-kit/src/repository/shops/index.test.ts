import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { shopKey } from '../../utils/keys/shopKey/index.ts';
import { createTable } from '../../utils/table/index.ts';
import {
  deleteShopOp,
  getShop,
  putShopOp,
  queryShops,
  setShopOrderOp,
  toShop,
  updateShopOp,
} from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const scope = { householdId: 'hh-1', listId: 'main' };

const row = (id: string, order: number) => ({
  ...shopKey({ ...scope, shopId: id }),
  id,
  name: `Shop ${id}`,
  color: 'sky',
  order,
});

describe('toShop', () => {
  it('keeps only the fields of a shop', () => {
    expect(toShop(row('a', 2))).toEqual({ id: 'a', name: 'Shop a', color: 'sky', order: 2 });
  });
});

describe('queryShops', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('returns the list’s shops in order', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [row('c', 2), row('a', 0), row('b', 1)] });

    const shops = await queryShops({ table, scope });

    expect(shops.map(({ id }) => id)).toEqual(['a', 'b', 'c']);
    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': 'HH#hh-1', ':prefix': 'SHOP#main#' },
    });
  });

  it('is empty when the list has no shops', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    expect(await queryShops({ table, scope })).toEqual([]);
  });
});

describe('getShop', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads the shop by its key', async () => {
    ddbMock.on(GetCommand).resolves({ Item: row('a', 0) });

    const shop = await getShop({ table, scope, shopId: 'a' });

    expect(shop).toMatchObject({ id: 'a' });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual(
      shopKey({ ...scope, shopId: 'a' }),
    );
  });

  it('is undefined when there is no such shop', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await getShop({ table, scope, shopId: 'missing' })).toBeUndefined();
  });
});

describe('shop writes', () => {
  const key = shopKey({ ...scope, shopId: 'a' });

  it('puts the shop under its own key', () => {
    const shop = { id: 'a', name: 'Aldi', color: 'sky', order: 0 } as const;

    expect(putShopOp({ scope, shop })).toEqual({ put: { ...key, ...shop } });
  });

  it('updates a shop that must already exist', () => {
    expect(updateShopOp({ scope, shopId: 'a', set: { name: 'Lidl' } })).toEqual({
      update: key,
      parts: { set: { name: 'Lidl' } },
      condition: { expression: 'attribute_exists(PK)' },
    });
  });

  it('sets a shop’s order', () => {
    expect(setShopOrderOp({ scope, shopId: 'a', order: 3 })).toEqual({
      update: key,
      parts: { set: { order: 3 } },
    });
  });

  it('deletes a shop by its key', () => {
    expect(deleteShopOp({ scope, shopId: 'a' })).toEqual({ delete: key });
  });
});
