import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { listListItems } from './index.ts';

const queryItems = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/items/index.ts', () => ({ queryItems }));

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
  });

  it('lists the list’s items oldest first, without their keys', async () => {
    queryItems.mockResolvedValue([row('b', 2), row('a', 1)]);

    const result = await listListItems(buildListContext());

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({
      items: [
        { id: 'a', name: 'a', shopIds: [], checked: false, createdAt: 1, addedBy: 'sub-1' },
        { id: 'b', name: 'b', shopIds: [], checked: false, createdAt: 2, addedBy: 'sub-1' },
      ],
    });
    expect(queryItems).toHaveBeenCalledWith(expect.objectContaining({ scope: TEST_SCOPE }));
  });

  it('lists nothing for an empty list', async () => {
    queryItems.mockResolvedValue([]);

    const result = await listListItems(buildListContext());

    expect(JSON.parse(result.body ?? '')).toEqual({ items: [] });
  });
});
