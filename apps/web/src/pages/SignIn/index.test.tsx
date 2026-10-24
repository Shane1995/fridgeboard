import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { fireEvent, render, screen } from '@testing-library/react';
import { APP_LOADER_COPY } from '../../components/AppLoader/constants';
import { SIGN_IN_COPY } from './constants';
import { SignIn } from '.';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { SessionStatus } from '../../services/session/constants';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';

vi.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: vi.fn(),
  startAuthentication: vi.fn(),
}));

const PASSKEYS_ON = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: {
    ...TEST_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_PASSKEYS]: true,
  },
};

const fixture = createSession(SessionStatus.SignedOut);
const { startSignIn } = fixture;
let session = fixture.session;

const renderSignIn = async (config = TEST_WEB_CONFIGURATION) => {
  const rootRoute = createRootRoute();
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <SignIn redirectTo="/" />,
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <p>home</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([signInRoute, homeRoute]),
    history: createMemoryHistory({ initialEntries: ['/sign-in'] }),
  });
  render(
    <TestProviders session={session} config={config}>
      <RouterProvider router={router} />
    </TestProviders>,
  );
  return router;
};

const renderForm = async () => {
  await renderSignIn();
  return screen.findByLabelText(SIGN_IN_COPY.emailLabel);
};

const submitEmail = (input: HTMLElement) => {
  fireEvent.change(input, { target: { value: 'a@b.com' } });
  fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.sendCode }));
};

describe('SignIn', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(browserSupportsWebAuthn).mockReturnValue(true);
    session = { ...session, status: SessionStatus.SignedOut };
  });

  afterEach(() => window.localStorage.clear());

  it('sends a signed-in user straight to where they were going', async () => {
    session = { ...session, status: SessionStatus.SignedIn };

    const router = await renderSignIn();

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(screen.queryByLabelText(SIGN_IN_COPY.emailLabel)).not.toBeInTheDocument();
  });

  it('shows the loader instead of the form while the session is resolving', async () => {
    session = { ...session, status: SessionStatus.Loading };

    await renderSignIn();

    expect(await screen.findByLabelText(APP_LOADER_COPY.label)).toBeInTheDocument();
    expect(screen.queryByLabelText(SIGN_IN_COPY.emailLabel)).not.toBeInTheDocument();
  });

  it('shows the no-invite copy when startSignIn returns no-invite', async () => {
    startSignIn.mockResolvedValue({ ok: false, reason: 'no-invite' });
    submitEmail(await renderForm());
    expect(
      await screen.findByText(
        'No invite found for this email. Ask whoever invited you to send one.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the verify-email copy', async () => {
    startSignIn.mockResolvedValue({ ok: false, reason: 'verify-email' });
    submitEmail(await renderForm());
    expect(await screen.findByText(/Open the email from Amazon Web Services/)).toBeInTheDocument();
  });

  it('moves to the code step once the code is sent', async () => {
    startSignIn.mockResolvedValue({ ok: true });
    submitEmail(await renderForm());
    expect(await screen.findByLabelText(SIGN_IN_COPY.codeLabel)).toBeInTheDocument();
  });

  it('links to /privacy', async () => {
    await renderForm();
    expect(screen.getByRole('link', { name: SIGN_IN_COPY.privacy })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });

  describe('with a remembered passkey', () => {
    const remember = () => window.localStorage.setItem('fb:passkey-email', 'jess@example.com');

    it('offers Face ID first when the flag is on', async () => {
      remember();

      await renderSignIn(PASSKEYS_ON);

      expect(
        await screen.findByRole('button', { name: SIGN_IN_COPY.passkey.submit }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(SIGN_IN_COPY.emailLabel)).not.toBeInTheDocument();
    });

    it('shows the email form with the remembered address after choosing the email code', async () => {
      remember();
      await renderSignIn(PASSKEYS_ON);

      fireEvent.click(await screen.findByRole('button', { name: SIGN_IN_COPY.passkey.useCode }));

      expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toHaveValue('jess@example.com');
    });

    it('ignores the remembered passkey when the flag is off', async () => {
      remember();

      await renderSignIn();

      expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: SIGN_IN_COPY.passkey.submit }),
      ).not.toBeInTheDocument();
    });

    it('ignores the remembered passkey when the browser cannot do passkeys', async () => {
      remember();
      vi.mocked(browserSupportsWebAuthn).mockReturnValue(false);

      await renderSignIn(PASSKEYS_ON);

      expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toBeInTheDocument();
    });

    it('shows the plain email form on a new device even with the flag on', async () => {
      await renderSignIn(PASSKEYS_ON);

      expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toHaveValue('');
    });
  });
});
