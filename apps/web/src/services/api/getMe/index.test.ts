import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { getMe } from './index';

const ME: IMeResponse = {
  sub: 'sub-1',
  email: 'jess@example.com',
  username: null,
  isAdmin: false,
  canCreateHousehold: true,
  households: [],
};

describe('getMe', () => {
  it('returns the /me body fetched from the path', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(ME), { status: 200 }));

    await expect(getMe(API_PATHS.me, fetcher)).resolves.toEqual(ME);
    expect(fetcher).toHaveBeenCalledWith(API_PATHS.me);
  });

  it('throws with the status as the cause when the request fails', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 404 }));

    await expect(getMe(API_PATHS.me, fetcher)).rejects.toMatchObject({ cause: 404 });
  });
});
