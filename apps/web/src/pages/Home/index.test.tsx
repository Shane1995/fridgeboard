import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { queryClient } from '../../app/queryClient';
import { SignIn } from '../SignIn';
import { SIGN_IN_COPY } from '../SignIn/constants';
import { HOME_COPY } from './constants';
import { Home } from '.';
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

const renderHome = () => {
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <SignIn redirectTo="/" />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, signInRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SessionContext.Provider>
    </RemoteConfigContext.Provider>,
  );
};

describe('Home', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
    apiFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          sub: 's',
          email: 'a@b.com',
          isAdmin: false,
          canCreateHousehold: false,
          households: [],
        }),
        { status: 200 },
      ),
    );
  });

  it('shows the app name as the heading', async () => {
    renderHome();
    expect(await screen.findByRole('heading', { name: HOME_COPY.title })).toBeInTheDocument();
  });

  it('shows who is signed in', async () => {
    renderHome();
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
  });

  it('shows a disabled add item button', async () => {
    renderHome();
    expect(await screen.findByRole('button', { name: HOME_COPY.addItem })).toBeDisabled();
  });

  it('signs out and returns to the sign-in screen', async () => {
    signOut.mockResolvedValue(undefined);
    renderHome();
    fireEvent.click(await screen.findByRole('button', { name: HOME_COPY.signOut }));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toBeInTheDocument();
  });
});
