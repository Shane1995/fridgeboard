import { MutationName } from '../../services/configuration/schema/constants';
import { startAuthentication, type AuthenticationResponseJSON } from '@simplewebauthn/browser';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { createSessionWrapper } from '../../testUtils/createSessionWrapper';
import { useSignInWithPasskeyMutation } from './index';

vi.mock('@simplewebauthn/browser', () => ({ startAuthentication: vi.fn() }));

const OPTIONS = { challenge: 'abc', rpId: 'fridgeboard.uk' };
const CREDENTIAL: AuthenticationResponseJSON = {
  id: 'cred-1',
  rawId: 'cred-1',
  type: 'public-key',
  response: { clientDataJSON: 'cd', authenticatorData: 'ad', signature: 'sig' },
  clientExtensionResults: {},
};

const { session, startPasskeySignIn, verifyPasskey } = createSession(SessionStatus.SignedOut);

const client = new QueryClient();
const wrapper = createSessionWrapper(session, client);

const signIn = async (email = 'jess@example.com') => {
  const { result } = renderHook(() => useSignInWithPasskeyMutation(), { wrapper });
  let outcome: unknown;
  await act(async () => {
    outcome = await result.current.mutateAsync(email);
  });
  return outcome;
};

describe('useSignInWithPasskeyMutation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    startPasskeySignIn.mockResolvedValue({ ok: true, options: OPTIONS });
    vi.mocked(startAuthentication).mockResolvedValue(CREDENTIAL);
    verifyPasskey.mockResolvedValue({ ok: true });
  });

  it('asks for options, prompts Face ID and verifies the credential', async () => {
    await expect(signIn()).resolves.toEqual({ ok: true });

    expect(startPasskeySignIn).toHaveBeenCalledWith('jess@example.com');
    expect(startAuthentication).toHaveBeenCalledWith({ optionsJSON: OPTIONS });
    expect(verifyPasskey).toHaveBeenCalledWith(CREDENTIAL);
  });

  it('falls back to the email code when the server has no passkey for the account', async () => {
    startPasskeySignIn.mockResolvedValue({ ok: false, fallback: true });

    await expect(signIn()).resolves.toEqual({ ok: false, reason: 'fallback' });
    expect(startAuthentication).not.toHaveBeenCalled();
  });

  it('passes a start failure reason through', async () => {
    startPasskeySignIn.mockResolvedValue({ ok: false, reason: 'forbidden' });

    await expect(signIn()).resolves.toEqual({ ok: false, reason: 'forbidden' });
  });

  it('reports cancelled when the person dismisses the Face ID prompt', async () => {
    vi.mocked(startAuthentication).mockRejectedValue(new Error('NotAllowedError'));

    await expect(signIn()).resolves.toEqual({ ok: false, reason: 'cancelled' });
    expect(verifyPasskey).not.toHaveBeenCalled();
  });

  it('passes a verify failure reason through, and maps an unexpected next step to unknown', async () => {
    verifyPasskey.mockResolvedValue({ ok: false, reason: 'passkey-failed' });
    await expect(signIn()).resolves.toEqual({ ok: false, reason: 'passkey-failed' });

    verifyPasskey.mockResolvedValue({ ok: false, next: 'enter-code' });
    await expect(signIn()).resolves.toEqual({ ok: false, reason: 'unknown' });
  });

  it('registers under its mutation name', async () => {
    await signIn();

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual([
      MutationName.signInWithPasskey,
    ]);
  });
});
