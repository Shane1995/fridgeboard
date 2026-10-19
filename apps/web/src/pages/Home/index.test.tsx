import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { queryClient } from '../../app/queryClient';
import { HOME_COPY } from './constants';
import { Home } from '.';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { SessionStatus } from '../../services/session/constants';

const fixture = createSession(SessionStatus.SignedIn);
const { signOut, apiFetch } = fixture;
const session = fixture.session;

const renderHome = () => {
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <p>sign in page</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, signInRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <TestProviders session={session} client={queryClient}>
      <RouterProvider router={router} />
    </TestProviders>,
  );
};

describe('Home', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
    apiFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          sub: 's',
          email: 'a@b.com',
          isAdmin: false,
          canCreateHousehold: false,
          households: [],
        }),
        { status: 200 },
      ),
    );
  });

  it('shows the app name as the heading', async () => {
    renderHome();
    expect(await screen.findByRole('heading', { name: HOME_COPY.title })).toBeInTheDocument();
  });

  it('shows who is signed in', async () => {
    renderHome();
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
  });

  it('shows a disabled add item button', async () => {
    renderHome();
    expect(await screen.findByRole('button', { name: HOME_COPY.addItem })).toBeDisabled();
  });

  it('signs out and returns to the sign-in screen', async () => {
    signOut.mockResolvedValue(undefined);
    renderHome();
    fireEvent.click(await screen.findByRole('button', { name: HOME_COPY.signOut }));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('sign in page')).toBeInTheDocument();
  });
});
