import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { apiFetch } from '../apiFetch';
import { getMe } from './index';

vi.mock('../apiFetch', () => ({ apiFetch: vi.fn() }));

const ME: IMeResponse = {
  sub: 'sub-1',
  email: 'jess@example.com',
  isAdmin: false,
  canCreateHousehold: true,
  households: [],
};

const refresh = vi.fn(async () => true);

describe('getMe', () => {
  it('returns the /me body through apiFetch', async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(JSON.stringify(ME), { status: 200 }));

    await expect(getMe(API_PATHS.me, refresh)).resolves.toEqual(ME);
    expect(apiFetch).toHaveBeenCalledWith(API_PATHS.me, refresh);
  });

  it('throws with the status as the cause when the request fails', async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 404 }));

    await expect(getMe(API_PATHS.me, refresh)).rejects.toMatchObject({ cause: 404 });
  });
});
