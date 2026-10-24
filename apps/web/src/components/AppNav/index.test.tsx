import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { AppNav } from './index';
import { NAV_ITEMS, NAV_LABEL } from './constants';

const renderAt = async (path: string) => {
  const rootRoute = createRootRoute({ component: AppNav });
  const routes = NAV_ITEMS.map(({ to }) =>
    createRoute({ getParentRoute: () => rootRoute, path: to }),
  );
  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <TestProviders session={createSession(SessionStatus.SignedIn).session}>
      <RouterProvider router={router} />
    </TestProviders>,
  );
  await screen.findByRole('navigation', { name: NAV_LABEL });
};

describe('AppNav', () => {
  it('links to every destination', async () => {
    await renderAt('/');
    NAV_ITEMS.forEach(({ label, to }) =>
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', to),
    );
  });

  it('shows the app name linking home', async () => {
    await renderAt('/');
    expect(screen.getByRole('link', { name: 'Fridgeboard' })).toHaveAttribute('href', '/');
  });

  it('offers the settings menu', async () => {
    await renderAt('/');
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('marks only the current page as active', async () => {
    await renderAt('/calendar');
    expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Chop list' })).not.toHaveAttribute('aria-current');
  });
});
