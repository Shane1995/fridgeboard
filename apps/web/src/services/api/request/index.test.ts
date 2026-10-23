import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { request } from './index';

const endpoint = (path: string, timeoutMs = 10_000) => ({ path, timeoutMs });

const fetchMock = vi.fn<typeof fetch>();

const headersOf = (): Headers => new Headers(fetchMock.mock.calls[0]?.[1]?.headers);

describe('request', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds the bearer token, a JSON content type and same-origin credentials', async () => {
    await request(endpoint(API_PATHS.me), { method: 'GET' }, 'token-1');

    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.me,
      expect.objectContaining({ method: 'GET', credentials: 'same-origin' }),
    );
    expect(headersOf().get('Authorization')).toBe('Bearer token-1');
    expect(headersOf().get('Content-Type')).toBe('application/json');
  });

  it('omits the authorization header without a token', async () => {
    await request(endpoint(API_PATHS.start), { method: 'POST' });

    expect(headersOf().has('Authorization')).toBe(false);
  });

  it('keeps a caller-provided content type', async () => {
    await request(endpoint(API_PATHS.me), { headers: { 'Content-Type': 'text/plain' } });

    expect(headersOf().get('Content-Type')).toBe('text/plain');
  });

  it('refuses paths outside the same-origin api', async () => {
    await expect(
      request(endpoint('https://evil.example/api/v1/me'), {}, 'token-1'),
    ).rejects.toThrow();
    await expect(request(endpoint('//evil.example/api/v1/me'), {}, 'token-1')).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('aborts the request after the endpoint timeout', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_path, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );

    const pending = request(endpoint(API_PATHS.me, 1_000));
    const assertion = expect(pending).rejects.toMatchObject({ name: 'TimeoutError' });
    await vi.advanceTimersByTimeAsync(1_000);
    await assertion;
    vi.useRealTimers();
  });
});
