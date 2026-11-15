import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { getListItem } from './index.ts';

const getItem = vi.hoisted(() => vi.fn());
const queryShops = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/items/index.ts', () => ({ getItem }));
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', () => ({ queryShops }));

const context = buildListContext({ pathParameters: { itemId: 'i1' } });
const SHOP = { id: 's1', name: 'Aldi', color: 'sky', order: 0 };

describe('getListItem', () => {
  beforeEach(() => {
    getItem.mockReset();
    queryShops.mockReset().mockResolvedValue([SHOP]);
  });

  it('returns the item without its keys', async () => {
    getItem.mockResolvedValue({
      PK: 'HH#hh-1',
      SK: 'ITEM#main#i1',
      id: 'i1',
      name: 'Milk',
      shopIds: ['s1'],
      checked: true,
      createdAt: 1,
      addedBy: 'sub-1',
    });

    const result = await getListItem(context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({
      id: 'i1',
      name: 'Milk',
      shops: [SHOP],
      checked: true,
      createdAt: 1,
      addedBy: 'sub-1',
    });
    expect(getItem).toHaveBeenCalledWith(
      expect.objectContaining({ scope: TEST_SCOPE, itemId: 'i1' }),
    );
  });

  it('answers 404 when there is no such item', async () => {
    getItem.mockResolvedValue(undefined);

    const result = await getListItem(context);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-found' });
  });
});
