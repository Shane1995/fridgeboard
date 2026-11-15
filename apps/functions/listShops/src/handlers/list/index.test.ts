import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { listListShops } from './index.ts';

const queryShops = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', () => ({ queryShops }));

describe('listListShops', () => {
  beforeEach(() => {
    queryShops.mockReset();
  });

  it('lists the list’s shops', async () => {
    const shops = [{ id: 'a', name: 'Aldi', color: 'sky', order: 0 }];
    queryShops.mockResolvedValue(shops);

    const result = await listListShops(buildListContext());

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ shops });
    expect(queryShops).toHaveBeenCalledWith(expect.objectContaining({ scope: TEST_SCOPE }));
  });
});
