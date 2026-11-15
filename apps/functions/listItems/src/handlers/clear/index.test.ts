import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { itemKey } from '@fridgeboard/lambda-kit/utils/keys/itemKey/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import { mockClient } from 'aws-sdk-client-mock';
import { clearListItems } from './index.ts';

const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const scope = { householdId: 'hh-1', listId: 'main' };

const row = (id: string, checked: boolean) => ({
  ...itemKey({ ...scope, itemId: id }),
  id,
  name: id,
  checked,
  createdAt: 1,
  addedBy: 'sub-1',
});

const manyRows = (count: number) =>
  Array.from({ length: count }, (_, index) => row(`i${index}`, true));

const contextFor = (clearby?: string) =>
  ({
    user: {
      event: { queryStringParameters: clearby === undefined ? undefined : { clearby } },
      claims: {},
      sub: 'sub-1',
    },
    table,
    scope,
  }) as unknown as ListRouteContext;

describe('clearListItems', () => {
  beforeEach(() => {
    ddbMock.reset();
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('deletes every item for clearby=all in one change for the list', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [row('a', false), row('b', true)] });

    const result = await clearListItems(contextFor('all'));

    expect(result).toEqual({ statusCode: 204 });
    expect(recordChange).toHaveBeenCalledWith({
      table,
      householdId: 'hh-1',
      changes: [{ type: 'item', id: 'main' }],
      items: [
        { delete: itemKey({ ...scope, itemId: 'a' }) },
        { delete: itemKey({ ...scope, itemId: 'b' }) },
      ],
    });
  });

  it('deletes only the checked items for clearby=checked', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [row('a', false), row('b', true)] });

    await clearListItems(contextFor('checked'));

    expect(recordChange.mock.calls[0]?.[0].items).toEqual([
      { delete: itemKey({ ...scope, itemId: 'b' }) },
    ]);
  });

  it('answers 204 and records nothing when no item matches', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [row('a', false)] });

    expect(await clearListItems(contextFor('checked'))).toEqual({ statusCode: 204 });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each([
    ['a missing clearby', undefined],
    ['an unknown clearby', 'everything'],
  ])('refuses %s without reading the list', async (_name, clearby) => {
    const result = await clearListItems(contextFor(clearby));

    expect(result).toMatchObject({ statusCode: 400 });
    expect(ddbMock.commandCalls(QueryCommand)).toHaveLength(0);
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('refuses to clear more than 98 items at once', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: manyRows(99) });

    expect(await clearListItems(contextFor('all'))).toMatchObject({ statusCode: 409 });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('clears exactly 98 items', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: manyRows(98) });

    expect(await clearListItems(contextFor('all'))).toEqual({ statusCode: 204 });
    expect(recordChange).toHaveBeenCalledOnce();
  });
});
