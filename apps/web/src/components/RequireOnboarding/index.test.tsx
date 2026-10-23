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
import { createSession } from '../../testUtils/createSession';
import { SessionStatus } from '../../services/session/constants';
import { RequireOnboarding } from '.';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
const { session, apiFetch } = createSession(SessionStatus.SignedIn);

const me = (onboarding: IMeResponse['onboarding']): IMeResponse => ({
  sub: 'sub-1',
  email: 'jess@example.com',
  username: 'jess',
  isAdmin: false,
  canCreateHousehold: false,
  households: [],
  onboarding,
});

const DONE = [{ id: 'username' as const, done: true }];

const renderAt = (path: string) => {
  const rootRoute = createRootRoute({
    component: () => (
      <RequireOnboarding>
        <div />
      </RequireOnboarding>
    ),
  });
  const home = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <p>home</p>,
  });
  const onboarding = createRoute({
    getParentRoute: () => rootRoute,
    path: '/onboarding',
    component: () => <p>onboarding</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([home, onboarding]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <RemoteConfigContext.Provider value={TEST_WEB_CONFIGURATION}>
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

describe('RequireOnboarding', () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    ['a section is pending', me([{ id: 'username', done: false }])],
    ['a later section is pending', me([...DONE, { id: 'household', done: false }])],
    ['the user needs an invite', me([...DONE, { id: 'needs-invite', done: false }])],
  ])('redirects to onboarding when %s', async (_label, profile) => {
    respondWith(profile);

    const router = renderAt('/');

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/onboarding'));
  });

  it('does not trap the user on a section this build cannot show', async () => {
    respondWith(me([...DONE, { id: 'profile-photo' as never, done: false }]));

    const router = renderAt('/');

    await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe('/');
  });

  it('sends onboarded users away from the onboarding page', async () => {
    respondWith(me(DONE));

    const router = renderAt('/onboarding');

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });

  it('leaves onboarded users where they are', async () => {
    respondWith(me(DONE));

    const router = renderAt('/');

    await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe('/');
  });
});
