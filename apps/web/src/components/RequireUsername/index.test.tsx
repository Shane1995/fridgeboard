import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';
import { RequireUsername } from '.';

const apiFetch = vi.fn();
const session: SessionContextValue = {
  status: SessionStatus.SignedIn,
  startSignIn: vi.fn(),
  verifyCode: vi.fn(),
  signOut: vi.fn(),
  refresh: vi.fn(),
  apiFetch,
};

const me = (username: string | null): IMeResponse => ({
  sub: 'sub-1',
  email: 'jess@example.com',
  username,
  isAdmin: false,
  canCreateHousehold: false,
  households: [],
});

const renderAt = (path: string) => {
  const rootRoute = createRootRoute({
    component: () => (
      <RequireUsername>
        <div />
      </RequireUsername>
    ),
  });
  const home = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <p>home</p>,
  });
  const username = createRoute({
    getParentRoute: () => rootRoute,
    path: '/username',
    component: () => <p>username</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([home, username]),
    history: createMemoryHistory({ initialEntries: [path] }),
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
  return router;
};

const respondWith = (body: IMeResponse) =>
  apiFetch.mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

describe('RequireUsername', () => {
  beforeEach(() => vi.resetAllMocks());

  it('redirects to the username page when the profile has none', async () => {
    respondWith(me(null));

    const router = renderAt('/');

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/username'));
  });

  it('sends users who already have a username away from the username page', async () => {
    respondWith(me('jess'));

    const router = renderAt('/username');

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });

  it('leaves users with a username where they are', async () => {
    respondWith(me('jess'));

    renderAt('/');

    await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText('username')).not.toBeInTheDocument();
  });
});
