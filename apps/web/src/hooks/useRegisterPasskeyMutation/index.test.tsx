import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { startRegistration, type RegistrationResponseJSON } from '@simplewebauthn/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { SessionContext } from '../../Context/Session';
import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { useRegisterPasskeyMutation } from './index';

vi.mock('@simplewebauthn/browser', () => ({ startRegistration: vi.fn() }));

const OPTIONS = { challenge: 'abc', user: { id: 'u' } };
const CREDENTIAL: RegistrationResponseJSON = {
  id: 'cred-1',
  rawId: 'cred-1',
  type: 'public-key',
  response: { clientDataJSON: 'cd', attestationObject: 'ao' },
  clientExtensionResults: {},
};

const { session, apiFetch } = createSession(SessionStatus.SignedIn);

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
    </RemoteConfigContext.Provider>
  </QueryClientProvider>
);

const register = async () => {
  const { result } = renderHook(() => useRegisterPasskeyMutation(), { wrapper });
  let outcome: unknown;
  await act(async () => {
    outcome = await result.current.mutateAsync();
  });
  return outcome;
};

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

describe('useRegisterPasskeyMutation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    apiFetch.mockImplementation(async (path: string) =>
      path.endsWith('/start') ? respond(200, { options: OPTIONS }) : respond(204),
    );
    vi.mocked(startRegistration).mockResolvedValue(CREDENTIAL);
  });

  it('starts registration, prompts Face ID and completes with the credential', async () => {
    await expect(register()).resolves.toEqual({ ok: true });

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/api/v1/auth/passkeys/start', { method: 'POST' });
    expect(startRegistration).toHaveBeenCalledWith({ optionsJSON: OPTIONS });
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/api/v1/auth/passkeys/complete', {
      method: 'POST',
      body: JSON.stringify({ credential: CREDENTIAL }),
    });
  });

  it('passes the recent-code requirement through without prompting', async () => {
    apiFetch.mockResolvedValue(respond(403, { reason: 'recent-code-required' }));

    await expect(register()).resolves.toEqual({ ok: false, reason: 'recent-code-required' });
    expect(startRegistration).not.toHaveBeenCalled();
  });

  it('reports cancelled when the person dismisses the prompt', async () => {
    vi.mocked(startRegistration).mockRejectedValue(new Error('NotAllowedError'));

    await expect(register()).resolves.toEqual({ ok: false, reason: 'cancelled' });
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('passes a completion failure reason through', async () => {
    apiFetch.mockImplementation(async (path: string) =>
      path.endsWith('/start')
        ? respond(200, { options: OPTIONS })
        : respond(400, { reason: 'passkey-failed' }),
    );

    await expect(register()).resolves.toEqual({ ok: false, reason: 'passkey-failed' });
  });

  it('registers under its mutation name', async () => {
    await register();

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual([
      MutationName.registerPasskey,
    ]);
  });
});
