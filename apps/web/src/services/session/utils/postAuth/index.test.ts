import { postAuth } from './index';

const fetchMock = vi.fn<typeof fetch>();

describe('postAuth', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts JSON with same-origin credentials', async () => {
    await postAuth('/api/v1/auth/start', { email: 'jess@example.com' });

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/start', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":"jess@example.com"}',
    });
  });

  it('sends no body when none is given', async () => {
    await postAuth('/api/v1/auth/refresh');

    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty('body');
  });
});
