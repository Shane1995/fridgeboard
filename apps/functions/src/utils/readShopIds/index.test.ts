import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../table/index.ts';
import { readShopIds } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const scope = { householdId: 'hh-1', listId: 'main' };
const SHOP = { id: 's1', name: 'Aldi', color: 'sky', order: 0 };

const read = (fields: Record<string, unknown>) => readShopIds({ fields, table, scope });

describe('readShopIds', () => {
  beforeEach(() => {
    ddbMock.reset();
    ddbMock.on(GetCommand).callsFake(({ Key }) => ({
      Item: ['SHOP#main#s1', 'SHOP#main#s2'].includes(Key.SK) ? SHOP : undefined,
    }));
  });

  it('is absent when the request names no shops', async () => {
    expect(await read({ name: 'Milk' })).toEqual({ status: 'absent' });
  });

  it('accepts a list of known shops, once each', async () => {
    expect(await read({ shopIds: ['s1', 's2', 's1'] })).toEqual({
      status: 'ok',
      shopIds: ['s1', 's2'],
    });
  });

  it('treats an empty list and the General id as no shop', async () => {
    expect(await read({ shopIds: [] })).toEqual({ status: 'ok', shopIds: [] });
    expect(await read({ shopIds: ['unsorted'] })).toEqual({ status: 'ok', shopIds: [] });
  });

  it('no longer reads the single shop an older build sent', async () => {
    expect(await read({ shopId: 's1' })).toEqual({ status: 'absent' });
  });

  it.each([
    ['an unknown shop', { shopIds: ['nope'] }],
    ['not a list', { shopIds: 's1' }],
    ['a non-text id', { shopIds: [5] }],
    ['too many shops', { shopIds: Array.from({ length: 11 }, (_, index) => `s${index}`) }],
  ])('refuses %s', async (_name, fields) => {
    expect(await read(fields)).toEqual({ status: 'invalid' });
  });
});
