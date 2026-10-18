import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { ROUTER_COPY } from '../../app/router/constants';
import { RouteError } from '.';

const renderRouteError = () => {
  const rootRoute = createRootRoute({ component: RouteError });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
};

describe('RouteError', () => {
  it('tells the user something went wrong', async () => {
    renderRouteError();
    expect(await screen.findByRole('heading', { name: ROUTER_COPY.error })).toBeInTheDocument();
  });

  it('offers a way back home', async () => {
    renderRouteError();
    expect(await screen.findByRole('link', { name: ROUTER_COPY.home })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
