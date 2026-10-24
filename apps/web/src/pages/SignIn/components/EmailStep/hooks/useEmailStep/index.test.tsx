import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser';
import { act, renderHook } from '@testing-library/react';
import { WebFeatureFlag } from '../../../../../../services/configuration/schema/constants';
import { FailureReason, SessionStatus } from '../../../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../../../testUtils/createSession';
import { TEST_WEB_CONFIGURATION } from '../../../../../../testUtils/webConfiguration';
import { SIGN_IN_COPY } from '../../../../constants';
import { useEmailStep } from './index';

vi.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: vi.fn(),
  startAuthentication: vi.fn(),
}));

const PASSKEYS_ON = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: { ...TEST_WEB_CONFIGURATION.featureFlags, [WebFeatureFlag.ENABLE_PASSKEYS]: true },
};

const submit = { preventDefault: vi.fn() };

const setup = (initialEmail?: string, config = TEST_WEB_CONFIGURATION) => {
  const fixture = createSession(SessionStatus.SignedOut);
  const onCodeSent = vi.fn();
  const { result } = renderHook(() => useEmailStep({ initialEmail, onCodeSent }), {
    wrapper: createProvidersWrapper(fixture.session, config),
  });
  return { result, onCodeSent, ...fixture };
};

describe('useEmailStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(browserSupportsWebAuthn).mockReturnValue(true);
    window.localStorage.clear();
  });

  it('starts with the initial email, or an empty one', () => {
    expect(setup('a@x.com').result.current.email).toBe('a@x.com');
    expect(setup().result.current.email).toBe('');
  });

  it('sends the trimmed email and reports the code was sent', async () => {
    const { result, startSignIn, onCodeSent } = setup();
    startSignIn.mockResolvedValue({ ok: true });

    act(() => result.current.setEmail(' jess@example.com '));
    await act(async () => result.current.handleSubmit(submit));

    expect(startSignIn).toHaveBeenCalledWith('jess@example.com');
    expect(onCodeSent).toHaveBeenCalledWith('jess@example.com');
  });

  it('shows the reason when sending fails and the generic message on an error', async () => {
    const { result, startSignIn, onCodeSent } = setup();
    startSignIn.mockResolvedValueOnce({ ok: false, reason: FailureReason.NoInvite });
    startSignIn.mockRejectedValueOnce(new Error('network'));

    await act(async () => result.current.handleSubmit(submit));
    expect(result.current.errorMessage).toBe(SIGN_IN_COPY.reasons[FailureReason.NoInvite]);

    await act(async () => result.current.handleSubmit(submit));
    expect(result.current.errorMessage).toBe(SIGN_IN_COPY.reasons[FailureReason.Unknown]);
    expect(onCodeSent).not.toHaveBeenCalled();
  });

  it('offers passkeys only when the flag is on and the browser supports them', () => {
    expect(setup().result.current.passkeysAvailable).toBe(false);
    expect(setup(undefined, PASSKEYS_ON).result.current.passkeysAvailable).toBe(true);

    vi.mocked(browserSupportsWebAuthn).mockReturnValue(false);
    expect(setup(undefined, PASSKEYS_ON).result.current.passkeysAvailable).toBe(false);
  });

  it('asks for an email before trying a passkey', () => {
    const { result, startPasskeySignIn } = setup('nope', PASSKEYS_ON);

    act(() => result.current.handlePasskey());

    expect(result.current.errorMessage).toBe(SIGN_IN_COPY.passkey.emailRequired);
    expect(startPasskeySignIn).not.toHaveBeenCalled();
  });

  it('remembers the email on this device after a passkey sign-in', async () => {
    const { result, startPasskeySignIn, verifyPasskey } = setup('jess@example.com', PASSKEYS_ON);
    startPasskeySignIn.mockResolvedValue({ ok: true, options: { challenge: 'c' } });
    vi.mocked(startAuthentication).mockResolvedValue({
      id: 'c',
      rawId: 'c',
      type: 'public-key',
      response: { clientDataJSON: 'a', authenticatorData: 'b', signature: 'c' },
      clientExtensionResults: {},
    });
    verifyPasskey.mockResolvedValue({ ok: true, tokens: { accessToken: 't', expiresIn: 60 } });

    await act(async () => result.current.handlePasskey());

    expect(window.localStorage.getItem('fb:passkey-email')).toBe('jess@example.com');
  });

  it('shows the reason when the passkey fails', async () => {
    const { result, startPasskeySignIn } = setup('jess@example.com', PASSKEYS_ON);
    startPasskeySignIn.mockResolvedValue({ ok: false, reason: FailureReason.Fallback });

    await act(async () => result.current.handlePasskey());

    expect(result.current.errorMessage).toBe(SIGN_IN_COPY.reasons[FailureReason.Fallback]);
  });
});
