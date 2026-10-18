import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { ROUTER_COPY } from '../../app/router/constants';
import { RouteFallback } from '.';

const renderFallback = (title: string) => {
  const rootRoute = createRootRoute({ component: () => <RouteFallback title={title} /> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
};

describe('RouteFallback', () => {
  it('shows the given title as the heading', async () => {
    renderFallback('Lost in the fridge');
    expect(await screen.findByRole('heading', { name: 'Lost in the fridge' })).toBeInTheDocument();
  });

  it('links back to the home page', async () => {
    renderFallback('Lost in the fridge');
    expect(await screen.findByRole('link', { name: ROUTER_COPY.home })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
