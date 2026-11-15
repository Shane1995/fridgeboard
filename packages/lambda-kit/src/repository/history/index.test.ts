import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { historyKey } from '../../utils/keys/historyKey/index.ts';
import { createTable } from '../../utils/table/index.ts';
import { countHistoryOp, getHistoryEntry, queryHistory, setHistoryShopsOp } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const scope = { householdId: 'hh-1', listId: 'main' };
const key = historyKey({ ...scope, name: 'Milk' });

describe('queryHistory', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads every history entry under the list’s prefix', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ ...key, name: 'Milk', count: 2 }],
    });

    const entries = await queryHistory({ table, scope });

    expect(entries).toMatchObject([{ name: 'Milk', count: 2 }]);
    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': 'HH#hh-1', ':prefix': 'HIST#main#' },
    });
  });
});

describe('getHistoryEntry', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads the entry for a name, whatever its case', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { ...key, name: 'Milk', count: 2 } });

    const entry = await getHistoryEntry({ table, scope, name: ' MILK ' });

    expect(entry).toMatchObject({ name: 'Milk' });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual(key);
  });

  it('is undefined when the name has no entry', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(await getHistoryEntry({ table, scope, name: 'Milk' })).toBeUndefined();
  });
});

describe('history writes', () => {
  it('counts a use of a name and remembers its shops', () => {
    expect(countHistoryOp({ scope, name: 'Milk', shopIds: ['s1'] })).toEqual({
      update: key,
      parts: { set: { name: 'Milk', shopIds: ['s1'] }, add: { count: 1 } },
    });
  });

  it('moves an existing entry to new shops', () => {
    expect(setHistoryShopsOp({ scope, name: 'Milk', shopIds: ['s2'] })).toEqual({
      update: key,
      parts: { set: { shopIds: ['s2'] } },
      condition: { expression: 'attribute_exists(PK)' },
    });
  });
});
