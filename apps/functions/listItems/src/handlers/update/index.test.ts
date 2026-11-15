import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { setHistoryShopsOp } from '@fridgeboard/lambda-kit/repository/history/index.ts';
import { updateItemOp } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { updateListItem } from './index.ts';

const getItem = vi.hoisted(() => vi.fn());
const getShop = vi.hoisted(() => vi.fn());
const queryShops = vi.hoisted(() => vi.fn());
const getHistoryEntryMock = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/items/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/items/index.ts')>()),
  getItem,
}));
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', () => ({ getShop, queryShops }));
vi.mock('@fridgeboard/lambda-kit/repository/history/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/history/index.ts')>()),
  getHistoryEntry: getHistoryEntryMock,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const CURRENT = {
  id: 'i1',
  name: 'Milk',
  shopIds: [],
  checked: false,
  createdAt: 1,
  addedBy: 'sub-1',
};

const contextFor = (body: unknown) => buildListContext({ body, pathParameters: { itemId: 'i1' } });

describe('updateListItem', () => {
  beforeEach(() => {
    getItem.mockReset().mockResolvedValue(CURRENT);
    getShop.mockReset().mockResolvedValue({ id: 's1' });
    queryShops.mockReset().mockResolvedValue([{ id: 's1', name: 'Aldi', color: 'sky', order: 0 }]);
    getHistoryEntryMock.mockReset().mockResolvedValue(undefined);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('ticks the item and answers with it', async () => {
    const context = contextFor({ checked: true });

    const result = await updateListItem(context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toMatchObject({ id: 'i1', checked: true });
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'item', id: 'i1' }],
      items: [updateItemOp({ scope: TEST_SCOPE, itemId: 'i1', set: { checked: true } })],
    });
  });

  it('answers with the shops the item is now in', async () => {
    const result = await updateListItem(contextFor({ shopIds: ['s1'] }));

    expect(JSON.parse(result.body ?? '').shops).toEqual([
      { id: 's1', name: 'Aldi', color: 'sky', order: 0 },
    ]);
  });

  it('answers 404 when there is no such item', async () => {
    getItem.mockResolvedValue(undefined);

    const result = await updateListItem(contextFor({ checked: true }));

    expect(result.statusCode).toBe(404);
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each([
    ['an empty patch', {}, 'invalid-request'],
    ['a blank name', { name: ' ' }, 'invalid-name'],
    ['a checked that is not a boolean', { checked: 'yes' }, 'invalid-request'],
  ])('refuses %s', async (_name, body, reason) => {
    const result = await updateListItem(contextFor(body));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('refuses a shop that does not exist', async () => {
    getShop.mockResolvedValue(undefined);

    const result = await updateListItem(contextFor({ shopIds: ['nope'] }));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-shop' });
  });

  it('moves the name’s history entry to the new shops when it has one', async () => {
    getHistoryEntryMock.mockResolvedValue({ name: 'Milk', count: 3 });

    await updateListItem(contextFor({ shopIds: ['s1'] }));

    expect(getHistoryEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({ scope: TEST_SCOPE, name: 'Milk' }),
    );
    expect(recordChange.mock.calls[0]?.[0].items).toEqual([
      updateItemOp({ scope: TEST_SCOPE, itemId: 'i1', set: { shopIds: ['s1'] } }),
      setHistoryShopsOp({ scope: TEST_SCOPE, name: 'Milk', shopIds: ['s1'] }),
    ]);
  });

  it('leaves the history alone when the name has no entry or the shops did not change', async () => {
    await updateListItem(contextFor({ shopIds: ['s1'] }));
    await updateListItem(contextFor({ checked: true }));

    expect(recordChange.mock.calls[0]?.[0].items).toHaveLength(1);
    expect(recordChange.mock.calls[1]?.[0].items).toHaveLength(1);
    expect(getHistoryEntryMock).toHaveBeenCalledOnce();
  });

  it('answers 404 when the item was deleted before the write', async () => {
    recordChange.mockRejectedValue(
      new TransactionCanceledException({
        message: 'cancelled',
        $metadata: {},
        CancellationReasons: [{ Code: 'ConditionalCheckFailed' }],
      }),
    );

    const result = await updateListItem(contextFor({ checked: true }));

    expect(result.statusCode).toBe(404);
  });

  it('rethrows any other failure', async () => {
    recordChange.mockRejectedValue(new Error('boom'));

    await expect(updateListItem(contextFor({ checked: true }))).rejects.toThrow('boom');
  });
});
