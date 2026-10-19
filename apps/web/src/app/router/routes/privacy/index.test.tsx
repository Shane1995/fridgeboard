import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { PRIVACY_COPY } from '../../../../pages/Privacy/constants';
import { Route } from '../../../../routes/privacy';

describe('privacy route', () => {
  it('renders the privacy notice', async () => {
    const rootRoute = createRootRoute();
    const component = Route.options.component;
    const privacyRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/privacy',
      ...(component && { component }),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([privacyRoute]),
      history: createMemoryHistory({ initialEntries: ['/privacy'] }),
    });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('heading', { name: PRIVACY_COPY.title })).toBeInTheDocument();
  });
});
