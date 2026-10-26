import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { createTable } from '../../../../utils/table/index.ts';
import { readItemChanges } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const scope = { householdId: 'hh-1', listId: 'main' };
const SHOP = { id: 's1', name: 'Aldi', color: 'sky', order: 0 };

const read = (fields: Record<string, unknown>) => readItemChanges({ fields, table, scope });

describe('readItemChanges', () => {
  beforeEach(() => {
    ddbMock.reset();
    ddbMock.on(GetCommand).callsFake(({ Key }) => ({
      Item: Key.SK === 'SHOP#main#s1' ? SHOP : undefined,
    }));
  });

  it('reads the name, shops and tick that were sent, and nothing else', async () => {
    expect(await read({ name: ' Milk ', shopIds: ['s1'], checked: true, other: 1 })).toEqual({
      status: 'ok',
      set: { name: 'Milk', shopIds: ['s1'], checked: true },
      shopsChanged: true,
    });
  });

  it('says the shops did not change when the request names none', async () => {
    expect(await read({ checked: false })).toEqual({
      status: 'ok',
      set: { checked: false },
      shopsChanged: false,
    });
  });

  it.each([
    ['a blank name', { name: ' ' }, 'invalid-name'],
    ['a shop that does not exist', { shopIds: ['nope'] }, 'invalid-shop'],
    ['a tick that is not a boolean', { checked: 'yes' }, 'invalid-request'],
    ['no change at all', {}, 'invalid-request'],
    ['only unknown fields', { colour: 'red' }, 'invalid-request'],
  ])('refuses %s', async (_name, fields, reason) => {
    expect(await read(fields)).toEqual({ status: 'invalid', reason });
  });
});
