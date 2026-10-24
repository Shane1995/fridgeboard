import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { RemoteConfigContext } from '../../Context/RemoteConfig/context';
import { SessionContext } from '../../Context/Session';
import { createSession } from '../../testUtils/createSession';
import { SessionStatus } from '../../services/session/constants';
import { RequireOnboarding } from '.';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
const { session, apiFetch } = createSession(SessionStatus.SignedIn);

const ME = {
  sub: 'sub-1',
  email: 'jess@example.com',
  username: 'jess',
  isAdmin: false,
  canCreateHousehold: false,
};

type Server = { hasOnboarding: boolean; sections?: IOnboardingResponse['sections'] };

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

const respondWith = ({ hasOnboarding, sections = [] }: Server) =>
  apiFetch.mockImplementation(async ({ path }: { path: string }) =>
    path.endsWith('/onboarding')
      ? new Response(JSON.stringify({ sections }), { status: 200 })
      : new Response(JSON.stringify({ ...ME, hasOnboarding }), { status: 200 }),
  );

describe('RequireOnboarding', () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    ['the username is pending', [{ id: 'username' }]],
    ['the household is pending', [{ id: 'household' }]],
    ['the user needs an invite', [{ id: 'needs-invite' }]],
  ] as const)('redirects to onboarding when %s', async (_label, sections) => {
    respondWith({ hasOnboarding: true, sections: [...sections] });

    const router = renderAt('/');

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/onboarding'));
  });

  it('does not trap the user on a section this build cannot show', async () => {
    const unknown = JSON.parse('{"id":"profile-photo"}');
    respondWith({ hasOnboarding: true, sections: [unknown] });

    const router = renderAt('/');

    await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe('/');
  });

  it('sends onboarded users away from the onboarding page', async () => {
    respondWith({ hasOnboarding: false });

    const router = renderAt('/onboarding');

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });

  it('leaves onboarded users where they are and never asks for the sections', async () => {
    respondWith({ hasOnboarding: false });

    const router = renderAt('/');

    await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe('/');
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: '/api/v1/me/onboarding' }),
    );
  });
});
