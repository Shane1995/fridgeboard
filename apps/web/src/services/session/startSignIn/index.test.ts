import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { startSignIn } from './index';

const fetchMock = vi.fn<typeof fetch>();

describe('startSignIn', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the email and resolves ok on 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(startSignIn('jess@example.com')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(API_PATHS.start, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jess@example.com' }),
    });
  });

  it.each(['no-invite', 'verify-email', 'forbidden'])('returns the %s reason', async (reason) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ reason }), { status: 403 }));

    await expect(startSignIn('jess@example.com')).resolves.toEqual({ ok: false, reason });
  });

  it('returns unknown when the error has no body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    await expect(startSignIn('nope')).resolves.toEqual({ ok: false, reason: 'unknown' });
  });
});
