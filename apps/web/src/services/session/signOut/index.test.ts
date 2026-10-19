import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';

vi.mock('../../configuration', async () => {
  const { API_PATHS } = await import('@fridgeboard/contract/auth/constants');
  return { getServicePath: async (service: keyof typeof API_PATHS) => API_PATHS[service] };
});

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const fetchMock = vi.fn<typeof fetch>();

const loadSession = async () => {
  vi.resetModules();
  const { signOut } = await import('./index');
  const { verifyCode } = await import('../verifyCode');
  const { getAccessToken } = await import('../getAccessToken');
  const { getSessionStatus } = await import('../getSessionStatus');
  const { refreshSession } = await import('../refreshSession');
  return { signOut, verifyCode, refreshSession, getAccessToken, getSessionStatus };
};

describe('signOut', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('revokes the session server-side and forgets the token', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(TOKENS), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { signOut, verifyCode, getAccessToken, getSessionStatus } = await loadSession();
    await verifyCode('123456');

    await signOut();

    expect(fetchMock).toHaveBeenLastCalledWith(
      API_PATHS.signOut,
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    );
    expect(getAccessToken()).toBeUndefined();
    expect(getSessionStatus()).toBe('signed-out');
  });

  it('signs out locally when the network fails', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(TOKENS), { status: 200 }))
      .mockRejectedValueOnce(new TypeError('offline'));
    const { signOut, verifyCode, getAccessToken } = await loadSession();
    await verifyCode('123456');

    await expect(signOut()).resolves.toBeUndefined();

    expect(getAccessToken()).toBeUndefined();
  });

  it('keeps the session signed out when a refresh in flight resolves afterwards', async () => {
    const release: ((response: Response) => void)[] = [];
    const pending = new Promise<Response>((resolve) => release.push(resolve));
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(TOKENS), { status: 200 }))
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { signOut, verifyCode, refreshSession, getAccessToken, getSessionStatus } =
      await loadSession();
    await verifyCode('123456');

    const flight = refreshSession();
    const signingOut = signOut();
    release[0]?.(
      new Response(JSON.stringify({ ...TOKENS, accessToken: 'token-2' }), { status: 200 }),
    );
    await signingOut;

    await expect(flight).resolves.toBe(false);
    expect(getAccessToken()).toBeUndefined();
    expect(getSessionStatus()).toBe('signed-out');
  });

  it('waits for a refresh in flight before posting sign-out', async () => {
    const release: ((response: Response) => void)[] = [];
    const pending = new Promise<Response>((resolve) => release.push(resolve));
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(TOKENS), { status: 200 }))
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { signOut, verifyCode, refreshSession, getAccessToken, getSessionStatus } =
      await loadSession();
    await verifyCode('123456');

    const flight = refreshSession();
    const signingOut = signOut();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    release[0]?.(
      new Response(JSON.stringify({ ...TOKENS, accessToken: 'token-2' }), { status: 200 }),
    );
    await signingOut;
    await flight;

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      API_PATHS.signOut,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(getAccessToken()).toBeUndefined();
    expect(getSessionStatus()).toBe('signed-out');
  });
});
