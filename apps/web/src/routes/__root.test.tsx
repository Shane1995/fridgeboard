import { RemoteConfigProvider } from '../Context/RemoteConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { ROUTER_COPY } from '../app/router/constants';
import { Route as rootRoute } from './__root';
import { getConfiguration } from '../services/configuration';
import { TEST_WEB_CONFIGURATION } from '../testUtils/webConfiguration';

vi.mock('../services/configuration', () => ({ getConfiguration: vi.fn() }));

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
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getConfiguration).mockResolvedValue(TEST_WEB_CONFIGURATION);
  });
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
