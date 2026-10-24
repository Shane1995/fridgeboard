import { startAuthentication } from '@simplewebauthn/browser';
import { act, renderHook } from '@testing-library/react';
import { FailureReason, SessionStatus } from '../../../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../../../testUtils/createSession';
import { SIGN_IN_COPY } from '../../../../constants';
import { usePasskeyStep } from './index';

vi.mock('@simplewebauthn/browser', () => ({ startAuthentication: vi.fn() }));

const setup = () => {
  const fixture = createSession(SessionStatus.SignedOut);
  const onFallback = vi.fn();
  const { result } = renderHook(() => usePasskeyStep({ email: 'jess@example.com', onFallback }), {
    wrapper: createProvidersWrapper(fixture.session),
  });
  return { result, onFallback, ...fixture };
};

describe('usePasskeyStep', () => {
  beforeEach(() => vi.resetAllMocks());

  it('falls back to the email code when the server has no passkey', async () => {
    const { result, startPasskeySignIn, onFallback } = setup();
    startPasskeySignIn.mockResolvedValue({ ok: false, reason: FailureReason.Fallback });

    await act(async () => result.current.handleSignIn());

    expect(onFallback).toHaveBeenCalled();
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('shows a message when the person cancels the prompt', async () => {
    const { result, startPasskeySignIn } = setup();
    startPasskeySignIn.mockResolvedValue({ ok: true, options: { challenge: 'c' } });
    vi.mocked(startAuthentication).mockRejectedValue(new Error('NotAllowedError'));

    await act(async () => result.current.handleSignIn());

    expect(result.current.errorMessage).toBe(SIGN_IN_COPY.reasons[FailureReason.Cancelled]);
  });

  it('shows the reason when verification fails', async () => {
    const { result, startPasskeySignIn, verifyPasskey } = setup();
    startPasskeySignIn.mockResolvedValue({ ok: true, options: { challenge: 'c' } });
    vi.mocked(startAuthentication).mockResolvedValue({
      id: 'c',
      rawId: 'c',
      type: 'public-key',
      response: { clientDataJSON: 'a', authenticatorData: 'b', signature: 'c' },
      clientExtensionResults: {},
    });
    verifyPasskey.mockResolvedValue({ ok: false, reason: FailureReason.PasskeyFailed });

    await act(async () => result.current.handleSignIn());

    expect(result.current.errorMessage).toBe(SIGN_IN_COPY.reasons[FailureReason.PasskeyFailed]);
  });

  it('shows the generic message when the request throws', async () => {
    const { result, startPasskeySignIn } = setup();
    startPasskeySignIn.mockRejectedValue(new Error('network'));

    await act(async () => result.current.handleSignIn());

    expect(result.current.errorMessage).toBe(SIGN_IN_COPY.reasons[FailureReason.Unknown]);
  });
});
