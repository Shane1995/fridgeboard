import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import type { RouterContext } from '../app/router/types';
import { SessionStatus } from '../services/session/constants';
import { Route as authenticatedRoute } from './_authenticated';

const { beforeLoad, component } = authenticatedRoute.options;

const renderAt = (status: SessionStatus) => {
  const rootRoute = createRootRouteWithContext<RouterContext>()();
  const guarded = createRoute({
    ...(beforeLoad && { beforeLoad }),
    ...(component && { component }),
    getParentRoute: () => rootRoute,
    id: '_authenticated',
  });
  const privateRoute = createRoute({
    getParentRoute: () => guarded,
    path: '/',
    component: () => <p>private page</p>,
  });
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <p>sign in page</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([guarded.addChildren([privateRoute]), signInRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    context: {
      session: { getStatus: () => status, refresh: async () => false },
    } as RouterContext,
  });
  render(<RouterProvider router={router} />);
  return router;
};

describe('authenticated route', () => {
  it('renders its children for a signed-in session', async () => {
    renderAt(SessionStatus.SignedIn);
    expect(await screen.findByText('private page')).toBeInTheDocument();
  });

  it('redirects a signed-out session to sign-in', async () => {
    const router = renderAt(SessionStatus.SignedOut);
    expect(await screen.findByText('sign in page')).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ redirect: '/' });
  });
});
