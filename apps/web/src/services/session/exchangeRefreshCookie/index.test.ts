import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { RefreshResultKind } from '../constants';
import { exchangeRefreshCookie } from './index';

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const fetchMock = vi.fn<typeof fetch>();

describe('exchangeRefreshCookie', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to the refresh path and returns the tokens', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(TOKENS), { status: 200 }));

    await expect(exchangeRefreshCookie(API_PATHS.refresh)).resolves.toEqual({
      kind: RefreshResultKind.Tokens,
      tokens: TOKENS,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.refresh,
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    );
  });

  it('is rejected on 401', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(exchangeRefreshCookie(API_PATHS.refresh)).resolves.toEqual({
      kind: RefreshResultKind.Rejected,
    });
  });

  it.each(['not json', '{"accessToken":"x"}'])(
    'is rejected for the malformed 200 body %s',
    async (body) => {
      fetchMock.mockResolvedValue(new Response(body, { status: 200 }));

      await expect(exchangeRefreshCookie(API_PATHS.refresh)).resolves.toEqual({
        kind: RefreshResultKind.Rejected,
      });
    },
  );

  it('is unavailable on a server error', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(exchangeRefreshCookie(API_PATHS.refresh)).resolves.toEqual({
      kind: RefreshResultKind.Unavailable,
    });
  });

  it('is unavailable when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'));

    await expect(exchangeRefreshCookie(API_PATHS.refresh)).resolves.toEqual({
      kind: RefreshResultKind.Unavailable,
    });
  });
});
