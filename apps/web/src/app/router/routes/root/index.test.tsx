import { RemoteConfigProvider } from '../../../../Context/RemoteConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { ROUTER_COPY } from '../../../../app/router/constants';
import { Route as rootRoute } from '../../../../routes/__root';

const renderAt = (path: string) => {
  const okRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ok',
    component: () => <p>fine</p>,
  });
  const brokenRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/broken',
    component: () => {
      throw new Error('boom');
    },
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([okRoute, brokenRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RemoteConfigProvider>
        <RouterProvider router={router} />
      </RemoteConfigProvider>
    </QueryClientProvider>,
  );
};

describe('root route', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('renders matched routes inside the layout', async () => {
    renderAt('/ok');
    expect(await screen.findByText('fine')).toBeInTheDocument();
  });

  it('shows the not-found page for an unknown path', async () => {
    renderAt('/nope');
    expect(await screen.findByRole('heading', { name: ROUTER_COPY.notFound })).toBeInTheDocument();
  });

  it('shows the error page when a route throws', async () => {
    renderAt('/broken');
    expect(await screen.findByRole('heading', { name: ROUTER_COPY.error })).toBeInTheDocument();
  });
});
