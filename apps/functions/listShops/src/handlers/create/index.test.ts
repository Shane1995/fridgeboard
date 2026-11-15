import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { putShopOp } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { createListShop } from './index.ts';

const queryShops = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/shops/index.ts')>()),
  queryShops,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));
vi.mock('@fridgeboard/lambda-kit/utils/newId/index.ts', () => ({ newId: () => 's-new' }));

describe('createListShop', () => {
  beforeEach(() => {
    queryShops.mockReset().mockResolvedValue([]);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('creates the first shop at order 0 and answers 201', async () => {
    const context = buildListContext({ body: { name: ' Aldi ', color: 'sky' } });
    const shop = { id: 's-new', name: 'Aldi', color: 'sky', order: 0 } as const;

    const result = await createListShop(context);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body ?? '')).toEqual(shop);
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'shop', id: 's-new' }],
      items: [putShopOp({ scope: TEST_SCOPE, shop })],
    });
  });

  it('puts a new shop after the highest order', async () => {
    queryShops.mockResolvedValue([
      { id: 'a', name: 'A', color: 'sky', order: 0 },
      { id: 'b', name: 'B', color: 'sky', order: 4 },
    ]);

    const result = await createListShop(buildListContext({ body: { name: 'C', color: 'mint' } }));

    expect(JSON.parse(result.body ?? '').order).toBe(5);
  });

  it.each([{ color: 'sky' }, { name: ' ', color: 'sky' }, { name: 3, color: 'sky' }, 'nope'])(
    'refuses an invalid name %j',
    async (body) => {
      const result = await createListShop(buildListContext({ body }));

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-name' });
      expect(recordChange).not.toHaveBeenCalled();
    },
  );

  it('refuses an unknown color', async () => {
    const result = await createListShop(
      buildListContext({ body: { name: 'Aldi', color: 'beige' } }),
    );

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-color' });
    expect(recordChange).not.toHaveBeenCalled();
  });
});
