import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { RootLayout } from '.';

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
  render(<RouterProvider router={router} />);
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
