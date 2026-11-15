import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { setShopOrderOp } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { reorderListShops } from './index.ts';

const queryShops = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/shops/index.ts')>()),
  queryShops,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const shop = (id: string, order: number) => ({ id, name: id, color: 'sky', order });

describe('reorderListShops', () => {
  beforeEach(() => {
    queryShops.mockReset().mockResolvedValue([shop('a', 0), shop('b', 1), shop('c', 2)]);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('puts the named shops first, in that order, and writes only the ones that moved', async () => {
    const context = buildListContext({ body: { ids: ['a', 'c'] } });

    const result = await reorderListShops(context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '').shops.map(({ id }: { id: string }) => id)).toEqual([
      'a',
      'c',
      'b',
    ]);
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'shop', id: 'order' }],
      items: [
        setShopOrderOp({ scope: TEST_SCOPE, shopId: 'c', order: 1 }),
        setShopOrderOp({ scope: TEST_SCOPE, shopId: 'b', order: 2 }),
      ],
    });
  });

  it('writes nothing when the order does not change', async () => {
    const result = await reorderListShops(buildListContext({ body: { ids: ['a', 'b', 'c'] } }));

    expect(result.statusCode).toBe(200);
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each([{}, { ids: 'a' }, { ids: [1] }, 'nope'])('refuses ids that are %j', async (body) => {
    const result = await reorderListShops(buildListContext({ body }));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-request' });
  });

  it('refuses a shop that does not exist', async () => {
    const result = await reorderListShops(buildListContext({ body: { ids: ['nope'] } }));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-shop' });
    expect(recordChange).not.toHaveBeenCalled();
  });
});
