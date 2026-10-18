import { getAccessToken } from '../../../../session/getAccessToken';
import { sendRequest } from './index';

vi.mock('../../../../session/getAccessToken', () => ({ getAccessToken: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

const sentHeaders = (): Headers => new Headers(fetchMock.mock.calls[0]?.[1]?.headers);

describe('sendRequest', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the bearer token when signed in', async () => {
    vi.mocked(getAccessToken).mockReturnValue('token-1');

    await sendRequest('/api/v1/me', { method: 'GET' });

    expect(sentHeaders().get('Authorization')).toBe('Bearer token-1');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'GET',
      credentials: 'same-origin',
    });
  });

  it('omits the Authorization header without a token', async () => {
    vi.mocked(getAccessToken).mockReturnValue(undefined);

    await sendRequest('/api/v1/me', {});

    expect(sentHeaders().has('Authorization')).toBe(false);
    expect(sentHeaders().get('Content-Type')).toBe('application/json');
  });

  it('keeps a caller-supplied content type', async () => {
    vi.mocked(getAccessToken).mockReturnValue(undefined);

    await sendRequest('/api/v1/me', { headers: { 'Content-Type': 'text/plain' } });

    expect(sentHeaders().get('Content-Type')).toBe('text/plain');
  });

  it('cannot be downgraded to send cookies cross-origin', async () => {
    vi.mocked(getAccessToken).mockReturnValue(undefined);

    await sendRequest('/api/v1/me', { credentials: 'include' });

    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe('same-origin');
  });
});
