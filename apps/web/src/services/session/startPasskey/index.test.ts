import { endpoint } from '../../../testUtils/endpoint';
import { startPasskey } from '.';
import { FailureReason } from '../constants';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('startPasskey', () => {
  afterEach(() => vi.unstubAllGlobals());

  const respond = (response: Response) => {
    const fetchMock = vi.fn(async () => response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  it('posts the email and returns the request options', async () => {
    const fetchMock = respond(json(200, { options: { challenge: 'abc', rpId: 'fridgeboard.uk' } }));

    await expect(
      startPasskey(endpoint('/api/v1/auth/passkey/start'), 'jess@example.com'),
    ).resolves.toEqual({
      ok: true,
      options: { challenge: 'abc', rpId: 'fridgeboard.uk' },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/passkey/start',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'jess@example.com' }),
      }),
    );
  });

  it('falls back to the email code when the server says so', async () => {
    respond(json(200, { next: 'email-code' }));

    await expect(startPasskey(endpoint('/api/v1/auth/passkey/start'), 'a@b.com')).resolves.toEqual({
      ok: false,
      reason: FailureReason.Fallback,
    });
  });

  it('falls back when the options are unusable', async () => {
    respond(json(200, { options: { nope: true } }));

    await expect(startPasskey(endpoint('/api/v1/auth/passkey/start'), 'a@b.com')).resolves.toEqual({
      ok: false,
      reason: FailureReason.Fallback,
    });
  });

  it('maps an error response to its reason', async () => {
    respond(json(403, { reason: 'forbidden' }));

    await expect(startPasskey(endpoint('/api/v1/auth/passkey/start'), 'a@b.com')).resolves.toEqual({
      ok: false,
      reason: 'forbidden',
    });
  });

  it('reports unknown for an unreadable error', async () => {
    respond(new Response('nope', { status: 502 }));

    await expect(startPasskey(endpoint('/api/v1/auth/passkey/start'), 'a@b.com')).resolves.toEqual({
      ok: false,
      reason: 'unknown',
    });
  });
});
