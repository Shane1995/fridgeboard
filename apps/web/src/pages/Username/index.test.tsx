import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';
import { USERNAME_COPY } from './constants';
import { Username } from '.';

const apiFetch = vi.fn();
const session: SessionContextValue = {
  status: SessionStatus.SignedIn,
  startSignIn: vi.fn(),
  verifyCode: vi.fn(),
  signOut: vi.fn(),
  refresh: vi.fn(),
  apiFetch,
};

const renderPage = () => {
  const rootRoute = createRootRoute();
  const usernameRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/username',
    component: Username,
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <p>home</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([usernameRoute, homeRoute]),
    history: createMemoryHistory({ initialEntries: ['/username'] }),
  });
  render(
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={new QueryClient()}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SessionContext.Provider>
    </RemoteConfigContext.Provider>,
  );
};

const submit = async (username: string) => {
  fireEvent.change(await screen.findByLabelText(USERNAME_COPY.label), {
    target: { value: username },
  });
  fireEvent.click(screen.getByRole('button', { name: USERNAME_COPY.submit }));
};

describe('Username', () => {
  beforeEach(() => vi.resetAllMocks());

  it('saves the trimmed username and goes home', async () => {
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ username: 'jess' }), { status: 200 }));
    renderPage();

    await submit('  jess ');

    expect(await screen.findByText('home')).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith('/api/v1/username', {
      method: 'PUT',
      body: JSON.stringify({ username: 'jess' }),
    });
  });

  it('shows the taken message and stays on the page', async () => {
    apiFetch.mockResolvedValue(
      new Response(JSON.stringify({ reason: 'username-taken' }), { status: 409 }),
    );
    renderPage();

    await submit('jess');

    expect(await screen.findByText(USERNAME_COPY.reasons['username-taken'])).toBeInTheDocument();
  });

  it('shows the generic message when the request throws', async () => {
    apiFetch.mockRejectedValue(new Error('network'));
    renderPage();

    await submit('jess');

    await waitFor(() =>
      expect(screen.getByText(USERNAME_COPY.reasons.unknown)).toBeInTheDocument(),
    );
  });
});
