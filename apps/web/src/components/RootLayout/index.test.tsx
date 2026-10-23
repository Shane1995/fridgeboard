import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { getConfiguration } from '../../services/configuration';
import { queryClient } from '../../app/queryClient';
import { RemoteConfigProvider } from '../../Context/RemoteConfig';
import { RootLayout } from '.';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));
vi.mock('../../app/devtools', () => ({ Devtools: () => <div data-testid="devtools" /> }));

const renderLayout = () => {
  const rootRoute = createRootRoute({ component: RootLayout });
  const pageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <p>page content</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  vi.mocked(getConfiguration).mockResolvedValue(TEST_WEB_CONFIGURATION);
  render(
    <QueryClientProvider client={queryClient}>
      <RemoteConfigProvider>
        <RouterProvider router={router} />
      </RemoteConfigProvider>
    </QueryClientProvider>,
  );
};

describe('RootLayout', () => {
  it('renders the matched route', async () => {
    renderLayout();
    expect(await screen.findByText('page content')).toBeInTheDocument();
  });

  it('loads the devtools in development', async () => {
    renderLayout();
    expect(await screen.findByTestId('devtools')).toBeInTheDocument();
  });
});
