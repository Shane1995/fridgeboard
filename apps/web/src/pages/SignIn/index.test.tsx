import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { SIGN_IN_COPY } from './constants';
import { SignIn } from '.';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';

const startSignIn = vi.fn();
const verifyCode = vi.fn();
const signOut = vi.fn();
const apiFetch = vi.fn();
const session: SessionContextValue = {
  status: SessionStatus.SignedIn,
  startSignIn,
  verifyCode,
  signOut,
  refresh: vi.fn(),
  apiFetch,
};

const renderSignIn = async () => {
  const rootRoute = createRootRoute();
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <SignIn redirectTo="/" />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([signInRoute]),
    history: createMemoryHistory({ initialEntries: ['/sign-in'] }),
  });
  render(
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={new QueryClient()}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SessionContext.Provider>
    </RemoteConfigContext.Provider>,
  );
  return screen.findByLabelText(SIGN_IN_COPY.emailLabel);
};

const submitEmail = (input: HTMLElement) => {
  fireEvent.change(input, { target: { value: 'a@b.com' } });
  fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.sendCode }));
};

describe('SignIn', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows the no-invite copy when startSignIn returns no-invite', async () => {
    startSignIn.mockResolvedValue({ ok: false, reason: 'no-invite' });
    submitEmail(await renderSignIn());
    expect(
      await screen.findByText(
        'No invite found for this email. Ask whoever invited you to send one.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the verify-email copy', async () => {
    startSignIn.mockResolvedValue({ ok: false, reason: 'verify-email' });
    submitEmail(await renderSignIn());
    expect(await screen.findByText(/Open the email from Amazon Web Services/)).toBeInTheDocument();
  });

  it('moves to the code step once the code is sent', async () => {
    startSignIn.mockResolvedValue({ ok: true });
    submitEmail(await renderSignIn());
    expect(await screen.findByLabelText(SIGN_IN_COPY.codeLabel)).toBeInTheDocument();
  });

  it('links to /privacy', async () => {
    await renderSignIn();
    expect(screen.getByRole('link', { name: SIGN_IN_COPY.privacy })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });
});
