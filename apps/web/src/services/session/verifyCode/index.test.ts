import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';

vi.mock('../../configuration', async () => {
  const { API_PATHS } = await import('@fridgeboard/contract/auth/constants');
  return { getServicePath: (service: keyof typeof API_PATHS) => API_PATHS[service] };
});

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const respond = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const fetchMock = vi.fn<typeof fetch>();

const loadSession = async () => {
  vi.resetModules();
  const { verifyCode } = await import('./index');
  const { getAccessToken } = await import('../getAccessToken');
  const { getSessionStatus } = await import('../getSessionStatus');
  return { verifyCode, getAccessToken, getSessionStatus };
};

describe('verifyCode', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores the access token in memory only', async () => {
    fetchMock.mockResolvedValue(respond(200, TOKENS));
    const { verifyCode, getAccessToken, getSessionStatus } = await loadSession();

    await expect(verifyCode('12345678')).resolves.toEqual({ ok: true });

    expect(getAccessToken()).toBe('token-1');
    expect(getSessionStatus()).toBe('signed-in');
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
    expect(document.cookie).toBe('');
  });

  it('posts the code as JSON with same-origin credentials', async () => {
    fetchMock.mockResolvedValue(respond(200, TOKENS));
    const { verifyCode } = await loadSession();

    await verifyCode('123456');

    expect(fetchMock).toHaveBeenCalledWith(API_PATHS.verify, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '123456' }),
    });
  });

  it('returns next enter-code on 202 without signing in', async () => {
    fetchMock.mockResolvedValue(respond(202, { next: 'enter-code' }));
    const { verifyCode, getAccessToken } = await loadSession();

    await expect(verifyCode('123456')).resolves.toEqual({ ok: false, next: 'enter-code' });

    expect(getAccessToken()).toBeUndefined();
  });

  it('returns the reason from an error response', async () => {
    fetchMock.mockResolvedValue(respond(400, { reason: 'bad-code' }));
    const { verifyCode, getAccessToken } = await loadSession();

    await expect(verifyCode('000000')).resolves.toEqual({ ok: false, reason: 'bad-code' });

    expect(getAccessToken()).toBeUndefined();
  });

  it.each([
    [200, 'not json'],
    [200, '{"accessToken":42}'],
    [202, 'not json'],
    [202, '{"next":"elsewhere"}'],
  ])('returns unknown for a malformed %i body', async (status, body) => {
    fetchMock.mockResolvedValue(new Response(body, { status }));
    const { verifyCode, getAccessToken } = await loadSession();

    await expect(verifyCode('123456')).resolves.toEqual({ ok: false, reason: 'unknown' });
    expect(getAccessToken()).toBeUndefined();
  });
});
