import type { RegistrationResponseJSON } from '@simplewebauthn/browser';
import { endpoint } from '../../../testUtils/endpoint';
import { completePasskeyRegistration } from '.';

const CREDENTIAL: RegistrationResponseJSON = {
  id: 'cred-1',
  rawId: 'cred-1',
  type: 'public-key',
  response: { clientDataJSON: 'cd', attestationObject: 'ao' },
  clientExtensionResults: {},
};

describe('completePasskeyRegistration', () => {
  it('POSTs the credential and reports success', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 204 }));

    await expect(
      completePasskeyRegistration(endpoint('/api/v1/auth/passkeys/complete'), CREDENTIAL, fetcher),
    ).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(endpoint('/api/v1/auth/passkeys/complete'), {
      method: 'POST',
      body: JSON.stringify({ credential: CREDENTIAL }),
    });
  });

  it('maps a rejection to its reason', async () => {
    const fetcher = vi.fn(
      async () => new Response(JSON.stringify({ reason: 'passkey-failed' }), { status: 400 }),
    );

    await expect(completePasskeyRegistration(endpoint('/x'), CREDENTIAL, fetcher)).resolves.toEqual(
      {
        ok: false,
        reason: 'passkey-failed',
      },
    );
  });

  it('reports unknown for an unreadable error', async () => {
    const fetcher = vi.fn(async () => new Response('nope', { status: 502 }));

    await expect(completePasskeyRegistration(endpoint('/x'), CREDENTIAL, fetcher)).resolves.toEqual(
      {
        ok: false,
        reason: 'unknown',
      },
    );
  });
});
