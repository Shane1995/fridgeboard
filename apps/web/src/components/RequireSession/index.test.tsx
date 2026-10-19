import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';
import { APP_LOADER_COPY } from '../AppLoader/constants';
import { RequireSession } from '.';

const renderAt = async (status: SessionStatus) => {
  const session: SessionContextValue = {
    status,
    startSignIn: vi.fn(),
    verifyCode: vi.fn(),
    signOut: vi.fn(),
    refresh: vi.fn(),
    apiFetch: vi.fn(),
  };
  const rootRoute = createRootRoute();
  const privateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
      <RequireSession>
        <p>private page</p>
      </RequireSession>
    ),
  });
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    validateSearch: (search: { redirect?: string }) => search,
    component: () => <p>sign in page</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([privateRoute, signInRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <SessionContext.Provider value={session}>
      <RouterProvider router={router} />
    </SessionContext.Provider>,
  );
  return router;
};

describe('RequireSession', () => {
  it('shows the app loader while the session is loading', async () => {
    await renderAt(SessionStatus.Loading);

    expect(await screen.findByRole('status', { name: APP_LOADER_COPY.label })).toBeInTheDocument();
    expect(screen.queryByText('private page')).not.toBeInTheDocument();
  });

  it('renders its children when signed in', async () => {
    await renderAt(SessionStatus.SignedIn);

    expect(await screen.findByText('private page')).toBeInTheDocument();
  });

  it('redirects to sign-in carrying the original path when signed out', async () => {
    const router = await renderAt(SessionStatus.SignedOut);

    expect(await screen.findByText('sign in page')).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ redirect: '/' });
  });
});
