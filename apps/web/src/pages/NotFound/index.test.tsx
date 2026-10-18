import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { ROUTER_COPY } from '../../app/router/constants';
import { NotFound } from '.';

const renderNotFound = () => {
  const rootRoute = createRootRoute({ component: NotFound });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
};

describe('NotFound', () => {
  it('tells the user the page was not found', async () => {
    renderNotFound();
    expect(await screen.findByRole('heading', { name: ROUTER_COPY.notFound })).toBeInTheDocument();
  });

  it('offers a way back home', async () => {
    renderNotFound();
    expect(await screen.findByRole('link', { name: ROUTER_COPY.home })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
