import type { AuthenticationResponseJSON } from '@simplewebauthn/browser';
import { verifyPasskey } from '.';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const CREDENTIAL: AuthenticationResponseJSON = {
  id: 'cred-1',
  rawId: 'cred-1',
  type: 'public-key',
  response: { clientDataJSON: 'cd', authenticatorData: 'ad', signature: 'sig' },
  clientExtensionResults: {},
};

describe('verifyPasskey', () => {
  afterEach(() => vi.unstubAllGlobals());

  const respond = (response: Response) => {
    const fetchMock = vi.fn(async () => response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  it('posts the credential and returns the tokens', async () => {
    const fetchMock = respond(json(200, { accessToken: 'access-1', expiresIn: 900 }));

    await expect(verifyPasskey('/api/v1/auth/passkey/verify', CREDENTIAL)).resolves.toEqual({
      ok: true,
      tokens: { accessToken: 'access-1', expiresIn: 900 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/passkey/verify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ credential: CREDENTIAL }),
      }),
    );
  });

  it('maps a failure to its reason', async () => {
    respond(json(400, { reason: 'passkey-failed' }));

    await expect(verifyPasskey('/api/v1/auth/passkey/verify', CREDENTIAL)).resolves.toEqual({
      ok: false,
      reason: 'passkey-failed',
    });
  });

  it('rejects a success body without tokens', async () => {
    respond(json(200, { nope: true }));

    await expect(verifyPasskey('/api/v1/auth/passkey/verify', CREDENTIAL)).resolves.toEqual({
      ok: false,
      reason: 'unknown',
    });
  });
});
