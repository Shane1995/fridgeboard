import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { countHistoryOp } from '@fridgeboard/lambda-kit/repository/history/index.ts';
import { putItemOp } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { createListItem } from './index.ts';

const getShop = vi.hoisted(() => vi.fn());
const queryShops = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', () => ({ getShop, queryShops }));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));
vi.mock('@fridgeboard/lambda-kit/utils/newId/index.ts', () => ({ newId: () => 'i-new' }));

const SHOP = { id: 's1', name: 'Aldi', color: 'sky', order: 0 };
const STORED = {
  id: 'i-new',
  name: 'Oat milk',
  shopIds: [],
  checked: false,
  createdAt: 1_000,
  addedBy: 'sub-1',
};

const omitShopIds = ({ shopIds: _shopIds, ...rest }: typeof STORED) => rest;

describe('createListItem', () => {
  beforeEach(() => {
    getShop.mockReset().mockResolvedValue({ id: 's1' });
    queryShops.mockReset().mockResolvedValue([SHOP]);
    recordChange.mockReset().mockResolvedValue([]);
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the item, counts its name in the history and answers 201', async () => {
    const context = buildListContext({ body: { name: '  Oat milk ' } });

    const result = await createListItem(context);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body ?? '')).toEqual({ ...omitShopIds(STORED), shops: [] });
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'item', id: 'i-new' }],
      items: [
        putItemOp({ scope: TEST_SCOPE, item: STORED }),
        countHistoryOp({ scope: TEST_SCOPE, name: 'Oat milk', shopIds: [] }),
      ],
    });
  });

  it('puts the item in the shops it names', async () => {
    const result = await createListItem(
      buildListContext({ body: { name: 'Oat milk', shopIds: ['s1', 's1'] } }),
    );

    expect(JSON.parse(result.body ?? '').shops).toEqual([SHOP]);
  });

  it.each([{}, { name: '' }, { name: '   ' }, { name: 7 }, { name: 'x'.repeat(81) }, 'nope'])(
    'refuses an invalid name %j',
    async (body) => {
      const result = await createListItem(buildListContext({ body }));

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-name' });
      expect(recordChange).not.toHaveBeenCalled();
    },
  );

  it('refuses a shop that does not exist', async () => {
    getShop.mockResolvedValue(undefined);

    const result = await createListItem(
      buildListContext({ body: { name: 'Milk', shopIds: ['nope'] } }),
    );

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-shop' });
    expect(recordChange).not.toHaveBeenCalled();
  });
});
