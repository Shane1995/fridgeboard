import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useRouter } from '@tanstack/react-router';
import { act, renderHook } from '@testing-library/react';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { SessionStatus } from '../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../testUtils/createSession';
import { TEST_WEB_CONFIGURATION } from '../../../../testUtils/webConfiguration';
import { useSignIn } from './index';

vi.mock('@simplewebauthn/browser', () => ({ browserSupportsWebAuthn: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ useRouter: vi.fn() }));

const PASSKEYS_ON = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: { ...TEST_WEB_CONFIGURATION.featureFlags, [WebFeatureFlag.ENABLE_PASSKEYS]: true },
};

const setup = (
  status = SessionStatus.SignedOut,
  {
    config = TEST_WEB_CONFIGURATION,
    initialEmail,
  }: { config?: typeof PASSKEYS_ON; initialEmail?: string } = {},
) => {
  const history = { push: vi.fn(), replace: vi.fn() };
  vi.mocked(useRouter).mockReturnValue({ history } as unknown as ReturnType<typeof useRouter>);
  const { session } = createSession(status);
  const { result } = renderHook(() => useSignIn({ initialEmail, redirectTo: '/home' }), {
    wrapper: createProvidersWrapper(session, config),
  });
  return { result, history };
};

describe('useSignIn', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(browserSupportsWebAuthn).mockReturnValue(true);
    window.localStorage.clear();
  });

  it('is loading while the session resolves and once signed in, then redirects', () => {
    expect(setup(SessionStatus.Loading).result.current.loading).toBe(true);

    const { result, history } = setup(SessionStatus.SignedIn);

    expect(result.current.loading).toBe(true);
    expect(history.replace).toHaveBeenCalledWith('/home');
  });

  it('starts on the email step and moves to the code step and back', () => {
    const { result } = setup();
    expect(result.current.loading).toBe(false);
    expect(result.current.codeEmail).toBeUndefined();

    act(() => result.current.handleCodeSent('jess@example.com'));
    expect(result.current.codeEmail).toBe('jess@example.com');

    act(() => result.current.handleBack());
    expect(result.current.codeEmail).toBeUndefined();
  });

  it('goes to the redirect target once the code is accepted', () => {
    const { result, history } = setup();

    act(() => result.current.handleSignedIn());

    expect(history.push).toHaveBeenCalledWith('/home');
  });

  it('prefers the invite email over the one remembered on this device', () => {
    window.localStorage.setItem('fb:passkey-email', 'device@example.com');

    expect(
      setup(SessionStatus.SignedOut, { initialEmail: 'a@x.com' }).result.current
        .emailStepInitialEmail,
    ).toBe('a@x.com');
    expect(setup().result.current.emailStepInitialEmail).toBe('device@example.com');
  });

  it('offers the passkey step for a remembered device until the person chooses a code', () => {
    window.localStorage.setItem('fb:passkey-email', 'device@example.com');
    const { result } = setup(SessionStatus.SignedOut, { config: PASSKEYS_ON });
    expect(result.current.passkeyEmail).toBe('device@example.com');

    act(() => result.current.handlePasskeyFallback());

    expect(result.current.passkeyEmail).toBeUndefined();
  });

  it('never offers the passkey step when passkeys are off or unsupported', () => {
    window.localStorage.setItem('fb:passkey-email', 'device@example.com');
    expect(setup().result.current.passkeyEmail).toBeUndefined();

    vi.mocked(browserSupportsWebAuthn).mockReturnValue(false);
    expect(
      setup(SessionStatus.SignedOut, { config: PASSKEYS_ON }).result.current.passkeyEmail,
    ).toBeUndefined();
  });
});
