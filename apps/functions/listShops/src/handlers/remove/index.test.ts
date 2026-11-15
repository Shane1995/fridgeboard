import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { setItemShopsOp } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { deleteShopOp } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { removeListShop } from './index.ts';

const getShop = vi.hoisted(() => vi.fn());
const queryItems = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/shops/index.ts')>()),
  getShop,
}));
vi.mock('@fridgeboard/lambda-kit/repository/items/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/items/index.ts')>()),
  queryItems,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const context = buildListContext({ pathParameters: { shopId: 'a' } });
const item = (id: string, shopIds?: string[]) => ({
  id,
  name: id,
  checked: false,
  createdAt: 1,
  addedBy: 'sub-1',
  ...(shopIds === undefined ? {} : { shopIds }),
});

describe('removeListShop', () => {
  beforeEach(() => {
    getShop.mockReset().mockResolvedValue({ id: 'a' });
    queryItems.mockReset().mockResolvedValue([]);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('deletes a shop nothing uses with a single shop change', async () => {
    const result = await removeListShop(context);

    expect(result).toEqual({ statusCode: 204 });
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'shop', id: 'a' }],
      items: [deleteShopOp({ scope: TEST_SCOPE, shopId: 'a' })],
    });
  });

  it('takes the shop off the items that use it and records an item change too', async () => {
    queryItems.mockResolvedValue([item('i1', ['a', 'b']), item('i2', ['b']), item('i3')]);

    await removeListShop(context);

    expect(recordChange.mock.calls[0]?.[0].changes).toEqual([
      { type: 'shop', id: 'a' },
      { type: 'item', id: 'a' },
    ]);
    expect(recordChange.mock.calls[0]?.[0].items).toEqual([
      setItemShopsOp({ scope: TEST_SCOPE, itemId: 'i1', shopIds: ['b'] }),
      deleteShopOp({ scope: TEST_SCOPE, shopId: 'a' }),
    ]);
  });

  it('answers 404 when there is no such shop', async () => {
    getShop.mockResolvedValue(undefined);

    const result = await removeListShop(context);

    expect(result.statusCode).toBe(404);
    expect(queryItems).not.toHaveBeenCalled();
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('refuses to remove a shop that more than 97 items use', async () => {
    queryItems.mockResolvedValue(
      Array.from({ length: 98 }, (_, index) => item(`i${index}`, ['a'])),
    );

    const result = await removeListShop(context);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'too-many-items' });
    expect(recordChange).not.toHaveBeenCalled();
  });
});
