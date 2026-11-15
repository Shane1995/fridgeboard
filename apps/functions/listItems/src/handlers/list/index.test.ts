import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { listListItems } from './index.ts';

const queryItems = vi.hoisted(() => vi.fn());
const queryShops = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/items/index.ts', () => ({ queryItems }));
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', () => ({ queryShops }));

const row = (id: string, createdAt: number) => ({
  PK: 'HH#hh-1',
  SK: `ITEM#main#${id}`,
  id,
  name: id,
  checked: false,
  createdAt,
  addedBy: 'sub-1',
});

describe('listListItems', () => {
  beforeEach(() => {
    queryItems.mockReset();
    queryShops.mockReset().mockResolvedValue([]);
  });

  it('lists the list’s items oldest first, without their keys', async () => {
    queryItems.mockResolvedValue([row('b', 2), row('a', 1)]);

    const result = await listListItems(buildListContext());

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({
      items: [
        { id: 'a', name: 'a', shops: [], checked: false, createdAt: 1, addedBy: 'sub-1' },
        { id: 'b', name: 'b', shops: [], checked: false, createdAt: 2, addedBy: 'sub-1' },
      ],
    });
    expect(queryItems).toHaveBeenCalledWith(expect.objectContaining({ scope: TEST_SCOPE }));
  });

  it('carries each item’s shops with it, in one read of the shops', async () => {
    const aldi = { id: 's1', name: 'Aldi', color: 'sky', order: 0 };
    queryShops.mockResolvedValue([aldi, { id: 's2', name: 'Lidl', color: 'mint', order: 1 }]);
    queryItems.mockResolvedValue([{ ...row('a', 1), shopIds: ['s1'] }, row('b', 2)]);

    const result = await listListItems(buildListContext());

    expect(
      JSON.parse(result.body ?? '').items.map(({ shops }: { shops: unknown }) => shops),
    ).toEqual([[aldi], []]);
    expect(queryShops).toHaveBeenCalledOnce();
  });

  it('lists nothing for an empty list', async () => {
    queryItems.mockResolvedValue([]);

    const result = await listListItems(buildListContext());

    expect(JSON.parse(result.body ?? '')).toEqual({ items: [] });
  });
});
