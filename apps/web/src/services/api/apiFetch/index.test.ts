import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';

const respond = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const tokens = (accessToken: string): ITokenResponse => ({ accessToken, expiresIn: 900 });

const fetchMock = vi.fn<typeof fetch>();

const loadApi = async () => {
  vi.resetModules();
  const { apiFetch } = await import('./index');
  const { refreshSession } = await import('../../session/refreshSession');
  return { apiFetch, refreshSession };
};

const headersOf = (call: number): Headers => new Headers(fetchMock.mock.calls[call]?.[1]?.headers);

describe('apiFetch', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds the bearer token, a JSON content type and same-origin credentials', async () => {
    fetchMock.mockResolvedValueOnce(respond(200, tokens('token-1')));
    fetchMock.mockResolvedValueOnce(respond(200, {}));
    const { apiFetch, refreshSession } = await loadApi();
    await refreshSession();

    await apiFetch(API_PATHS.me);

    expect(fetchMock).toHaveBeenLastCalledWith(
      API_PATHS.me,
      expect.objectContaining({ credentials: 'same-origin' }),
    );
    expect(headersOf(1).get('Authorization')).toBe('Bearer token-1');
    expect(headersOf(1).get('Content-Type')).toBe('application/json');
  });

  it('retries once after refreshing on 401', async () => {
    fetchMock
      .mockResolvedValueOnce(respond(401))
      .mockResolvedValueOnce(respond(200, tokens('token-2')))
      .mockResolvedValueOnce(respond(200, { ok: true }));
    const { apiFetch } = await loadApi();

    const response = await apiFetch(API_PATHS.me);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(API_PATHS.refresh);
    expect(headersOf(2).get('Authorization')).toBe('Bearer token-2');
  });

  it('returns the second 401 without refreshing again', async () => {
    fetchMock
      .mockResolvedValueOnce(respond(401))
      .mockResolvedValueOnce(respond(200, tokens('token-2')))
      .mockResolvedValueOnce(respond(401));
    const { apiFetch } = await loadApi();

    const response = await apiFetch(API_PATHS.me);

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('returns the 401 without retrying when the refresh fails', async () => {
    fetchMock.mockResolvedValueOnce(respond(401)).mockResolvedValueOnce(respond(401));
    const { apiFetch } = await loadApi();

    const response = await apiFetch(API_PATHS.me);

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('refuses paths outside the same-origin api', async () => {
    const { apiFetch } = await loadApi();

    await expect(apiFetch('https://evil.example/api/v1/me')).rejects.toThrow();
    await expect(apiFetch('//evil.example/api/v1/me')).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
