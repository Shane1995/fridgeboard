import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { Endpoint } from '../../../../services/configuration/types';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { FailureReason, SessionStatus } from '../../../../services/session/constants';
import { createProvidersWrapper } from '../../../../testUtils/createProvidersWrapper';
import { createSession } from '../../../../testUtils/createSession';
import { TEST_WEB_CONFIGURATION } from '../../../../testUtils/webConfiguration';
import { SIGN_IN_COPY } from '../../../../pages/SignIn/constants';
import { CONFIRMATION_MS, PASSKEY_PROMPT_COPY as COPY } from '../../constants';
import { usePasskeyPrompt } from './index';

vi.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: vi.fn(),
  startRegistration: vi.fn(),
}));

const PASSKEYS_ON = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: { ...TEST_WEB_CONFIGURATION.featureFlags, [WebFeatureFlag.ENABLE_PASSKEYS]: true },
};

const ME = {
  sub: 's',
  email: 'jess@example.com',
  username: 'jess',
  isAdmin: false,
  canCreateHousehold: true,
  hasOnboarding: false,
};

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const setup = ({ config = PASSKEYS_ON, recentCodeSignIn = true } = {}) => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn, recentCodeSignIn);
  apiFetch.mockImplementation(async (target: Endpoint) => {
    if (target.path === '/api/v1/me') {
      return json(200, ME);
    }
    return target.path.endsWith('/start')
      ? json(200, { options: { challenge: 'abc', user: { id: 'u' } } })
      : json(204);
  });
  const { result } = renderHook(() => usePasskeyPrompt(), {
    wrapper: createProvidersWrapper(session, config),
  });
  return { result, apiFetch };
};

describe('usePasskeyPrompt', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(browserSupportsWebAuthn).mockReturnValue(true);
    vi.mocked(startRegistration).mockResolvedValue({
      id: 'c',
      rawId: 'c',
      type: 'public-key',
      response: { clientDataJSON: 'cd', attestationObject: 'ao' },
      clientExtensionResults: {},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('is visible after an email-code sign-in on a device without a passkey', async () => {
    const { result } = setup();

    await waitFor(() => expect(result.current.visible).toBe(true));
  });

  it.each([
    ['passkeys are off', { config: TEST_WEB_CONFIGURATION }],
    ['the person signed in without a code', { recentCodeSignIn: false }],
  ])('stays hidden when %s', async (_label, options) => {
    const { result, apiFetch } = setup(options);

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(result.current.visible).toBe(false);
  });

  it('stays hidden when the browser does not support passkeys', async () => {
    vi.mocked(browserSupportsWebAuthn).mockReturnValue(false);
    const { result, apiFetch } = setup();

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(result.current.visible).toBe(false);
  });

  it('stays hidden when this device already has the account or was told not to ask', async () => {
    window.localStorage.setItem('fb:passkey-email', 'jess@example.com');
    const { result, apiFetch } = setup();

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(result.current.visible).toBe(false);
  });

  it('registers, remembers the device, confirms and then hides', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.visible).toBe(true));
    vi.useFakeTimers({ shouldAdvanceTime: true });

    await act(async () => result.current.handleSetUp());

    expect(result.current.done).toBe(true);
    expect(window.localStorage.getItem('fb:passkey-email')).toBe('jess@example.com');
    act(() => vi.advanceTimersByTime(CONFIRMATION_MS));
    expect(result.current.visible).toBe(false);
  });

  it('says so when the person cancels the prompt', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.visible).toBe(true));
    vi.mocked(startRegistration).mockRejectedValue(new Error('NotAllowedError'));

    await act(async () => result.current.handleSetUp());

    expect(result.current.message).toBe(COPY.cancelled);
    expect(result.current.done).toBe(false);
  });

  it('shows the reason when the server refuses', async () => {
    const { result, apiFetch } = setup();
    await waitFor(() => expect(result.current.visible).toBe(true));
    apiFetch.mockResolvedValue(json(403, { reason: 'recent-code-required' }));

    await act(async () => result.current.handleSetUp());

    expect(result.current.message).toBe(SIGN_IN_COPY.reasons[FailureReason.RecentCodeRequired]);
  });

  it('hides for now on "not now" and for good on "don\'t ask again"', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.visible).toBe(true));

    act(() => result.current.handleNotNow());
    expect(result.current.visible).toBe(false);
    expect(window.localStorage.getItem('fb:passkey-prompt-dismissed')).toBeNull();

    const second = setup();
    await waitFor(() => expect(second.result.current.visible).toBe(true));
    act(() => second.result.current.handleDontAsk());
    expect(second.result.current.visible).toBe(false);
    expect(window.localStorage.getItem('fb:passkey-prompt-dismissed')).toBe('1');
  });
});
