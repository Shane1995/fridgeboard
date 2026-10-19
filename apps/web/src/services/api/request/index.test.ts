import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { request } from './index';

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
    await request(API_PATHS.me, { method: 'GET' }, 'token-1');

    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.me,
      expect.objectContaining({ method: 'GET', credentials: 'same-origin' }),
    );
    expect(headersOf().get('Authorization')).toBe('Bearer token-1');
    expect(headersOf().get('Content-Type')).toBe('application/json');
  });

  it('omits the authorization header without a token', async () => {
    await request(API_PATHS.start, { method: 'POST' });

    expect(headersOf().has('Authorization')).toBe(false);
  });

  it('keeps a caller-provided content type', async () => {
    await request(API_PATHS.me, { headers: { 'Content-Type': 'text/plain' } });

    expect(headersOf().get('Content-Type')).toBe('text/plain');
  });

  it('refuses paths outside the same-origin api', async () => {
    await expect(request('https://evil.example/api/v1/me', {}, 'token-1')).rejects.toThrow();
    await expect(request('//evil.example/api/v1/me', {}, 'token-1')).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
