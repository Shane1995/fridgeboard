import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { signOut } from './index';

const fetchMock = vi.fn<typeof fetch>();

describe('signOut', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to the sign-out path with same-origin credentials', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await signOut(API_PATHS.signOut);

    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.signOut,
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    );
  });

  it('resolves when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'));

    await expect(signOut(API_PATHS.signOut)).resolves.toBeUndefined();
  });
});
