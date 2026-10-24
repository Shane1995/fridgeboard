import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { SETTINGS_MENU_COPY } from './constants';
import { SettingsMenu } from './index';

const { session, signOut } = createSession(SessionStatus.SignedIn);

const renderMenu = () => {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <SettingsMenu />
        <Outlet />
      </>
    ),
  });
  const profile = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: () => <p>profile page</p>,
  });
  const signIn = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <p>sign in page</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([profile, signIn]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <TestProviders session={session}>
      <RouterProvider router={router} />
    </TestProviders>,
  );
};

const choose = (item: HTMLElement) => {
  fireEvent.keyDown(item, { key: 'Enter' });
  fireEvent.keyUp(item, { key: 'Enter' });
};

const openMenu = async () =>
  fireEvent.click(await screen.findByRole('button', { name: SETTINGS_MENU_COPY.trigger }));

describe('SettingsMenu', () => {
  beforeEach(() => vi.resetAllMocks());

  it('lists profile and sign out', async () => {
    renderMenu();
    await openMenu();
    expect(
      await screen.findByRole('menuitem', { name: SETTINGS_MENU_COPY.profile }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: SETTINGS_MENU_COPY.signOut })).toBeInTheDocument();
  });

  it('opens the profile page from the menu', async () => {
    renderMenu();
    await openMenu();
    choose(await screen.findByRole('menuitem', { name: SETTINGS_MENU_COPY.profile }));
    expect(await screen.findByText('profile page')).toBeInTheDocument();
  });

  it('signs out and returns to the sign-in screen', async () => {
    signOut.mockResolvedValue(undefined);
    renderMenu();
    await openMenu();
    choose(await screen.findByRole('menuitem', { name: SETTINGS_MENU_COPY.signOut }));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('sign in page')).toBeInTheDocument();
  });
});
