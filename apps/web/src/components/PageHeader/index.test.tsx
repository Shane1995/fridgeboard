import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { PAGE_HEADER_COPY } from './constants';
import { PageHeader } from './index';

const renderHeader = async () => {
  const rootRoute = createRootRoute({ component: () => <PageHeader title="Calendar" /> });
  const home = createRoute({ getParentRoute: () => rootRoute, path: '/' });
  const router = createRouter({
    routeTree: rootRoute.addChildren([home]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
  await screen.findByRole('heading', { name: 'Calendar' });
};

describe('PageHeader', () => {
  it('shows the page title as the heading', async () => {
    await renderHeader();

    expect(screen.getByRole('heading', { name: 'Calendar', level: 1 })).toBeInTheDocument();
  });

  it('links the F badge home', async () => {
    await renderHeader();

    expect(screen.getByRole('link', { name: PAGE_HEADER_COPY.homeLabel })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
