import type { Endpoint } from '../../services/configuration/types';
import { WebFeatureFlag } from '../../services/configuration/flags/constants';
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { SIGN_IN_COPY } from '../../pages/SignIn/constants';
import { PASSKEY_PROMPT_COPY as COPY } from './constants';
import { PasskeyPrompt } from '.';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';

vi.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: vi.fn(),
  startRegistration: vi.fn(),
}));

const PASSKEYS_ON = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: {
    ...TEST_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_PASSKEYS]: true,
  },
};

const ME = {
  sub: 'sub-1',
  email: 'jess@example.com',
  username: 'jess',
  isAdmin: false,
  canCreateHousehold: true,
  households: [{ id: 'hh-1', name: 'Home', role: 'owner' }],
  onboarding: [{ id: 'username', done: true }],
};

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const renderPrompt = ({
  config = PASSKEYS_ON,
  recentCodeSignIn = true,
}: { config?: typeof PASSKEYS_ON; recentCodeSignIn?: boolean } = {}) => {
  const fixture = createSession(SessionStatus.SignedIn, recentCodeSignIn);
  fixture.apiFetch.mockImplementation(async (target: Endpoint, init?: RequestInit) => {
    if (target.path === '/api/v1/me') {
      return json(200, ME);
    }
    return target.path.endsWith('/start')
      ? json(200, { options: { challenge: 'abc', user: { id: 'u' } } })
      : json(init ? 204 : 500);
  });
  render(
    <TestProviders session={fixture.session} config={config}>
      <PasskeyPrompt />
    </TestProviders>,
  );
  return fixture;
};

describe('PasskeyPrompt', () => {
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

  it('offers Face ID shortly after an email-code sign-in', async () => {
    renderPrompt();

    expect(await screen.findByText(COPY.title)).toBeInTheDocument();
  });

  it.each([
    ['the flag is off', { config: TEST_WEB_CONFIGURATION as typeof PASSKEYS_ON }],
    ['the sign-in was not a recent email code', { recentCodeSignIn: false }],
  ])('stays hidden when %s', async (_label, options) => {
    const { apiFetch } = renderPrompt(options);

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(screen.queryByText(COPY.title)).not.toBeInTheDocument();
  });

  it.each([
    [
      'the browser cannot do passkeys',
      () => vi.mocked(browserSupportsWebAuthn).mockReturnValue(false),
    ],
    [
      'it was dismissed for good',
      () => window.localStorage.setItem('fb:passkey-prompt-dismissed', '1'),
    ],
    [
      'this device already has a passkey for the account',
      () => window.localStorage.setItem('fb:passkey-email', 'jess@example.com'),
    ],
  ])('stays hidden when %s', async (_label, arrange) => {
    arrange();
    const { apiFetch } = renderPrompt();

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(screen.queryByText(COPY.title)).not.toBeInTheDocument();
  });

  it('registers a passkey, remembers the email and confirms', async () => {
    renderPrompt();

    fireEvent.click(await screen.findByRole('button', { name: COPY.setUp }));

    expect(await screen.findByText(COPY.done)).toBeInTheDocument();
    expect(window.localStorage.getItem('fb:passkey-email')).toBe('jess@example.com');
  });

  it('hides the confirmation after a few seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderPrompt();
    fireEvent.click(await screen.findByRole('button', { name: COPY.setUp }));
    await screen.findByText(COPY.done);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    expect(screen.queryByText(COPY.done)).not.toBeInTheDocument();
  });

  it('explains when the emailed code is too old', async () => {
    const { apiFetch } = renderPrompt();
    apiFetch.mockResolvedValue(json(403, { reason: 'recent-code-required' }));

    fireEvent.click(await screen.findByRole('button', { name: COPY.setUp }));

    expect(
      await screen.findByText(SIGN_IN_COPY.reasons['recent-code-required']),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('fb:passkey-email')).toBeNull();
  });

  it('says so when Face ID setup is cancelled', async () => {
    vi.mocked(startRegistration).mockRejectedValue(new Error('NotAllowedError'));
    renderPrompt();

    fireEvent.click(await screen.findByRole('button', { name: COPY.setUp }));

    expect(await screen.findByText(COPY.cancelled)).toBeInTheDocument();
  });

  it('shows the generic message when the request throws', async () => {
    const { apiFetch } = renderPrompt();
    await screen.findByText(COPY.title);
    apiFetch.mockRejectedValue(new Error('network'));

    fireEvent.click(screen.getByRole('button', { name: COPY.setUp }));

    expect(await screen.findByText(SIGN_IN_COPY.reasons.unknown)).toBeInTheDocument();
  });

  it('hides for now without remembering the choice', async () => {
    renderPrompt();

    fireEvent.click(await screen.findByRole('button', { name: COPY.notNow }));

    expect(screen.queryByText(COPY.title)).not.toBeInTheDocument();
    expect(window.localStorage.getItem('fb:passkey-prompt-dismissed')).toBeNull();
  });

  it('remembers when told not to ask again', async () => {
    renderPrompt();

    fireEvent.click(await screen.findByRole('button', { name: COPY.dontAsk }));

    expect(screen.queryByText(COPY.title)).not.toBeInTheDocument();
    expect(window.localStorage.getItem('fb:passkey-prompt-dismissed')).toBe('1');
  });
});
