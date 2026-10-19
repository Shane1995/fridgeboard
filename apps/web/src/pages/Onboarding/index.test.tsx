import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
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
import { ONBOARDING_COPY } from './constants';
import { Onboarding } from '.';

const apiFetch = vi.fn();
const signOut = vi.fn();
const session: SessionContextValue = {
  status: SessionStatus.SignedIn,
  startSignIn: vi.fn(),
  verifyCode: vi.fn(),
  signOut,
  refresh: vi.fn(),
  apiFetch,
};

const me = (overrides: Partial<IMeResponse>): IMeResponse => ({
  sub: 'sub-1',
  email: 'jess@example.com',
  username: null,
  isAdmin: false,
  canCreateHousehold: true,
  households: [],
  onboarding: [
    { id: 'username', done: false },
    { id: 'household', done: false },
  ],
  ...overrides,
});

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

const respond = (profile: IMeResponse, ...writes: Response[]) => {
  apiFetch.mockImplementation(async (_path: string, init?: RequestInit) =>
    init?.method === undefined ? json(200, profile) : (writes.shift() ?? json(500, {})),
  );
};

const renderPage = () => {
  const rootRoute = createRootRoute();
  const page = createRoute({
    getParentRoute: () => rootRoute,
    path: '/onboarding',
    component: Onboarding,
  });
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <p>sign in page</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([page, signInRoute]),
    history: createMemoryHistory({ initialEntries: ['/onboarding'] }),
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

const fill = async (label: string, value: string, button: string) => {
  fireEvent.change(await screen.findByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: button }));
};

const USERNAME = ONBOARDING_COPY.username;
const HOUSEHOLD = ONBOARDING_COPY.household;

describe('Onboarding', () => {
  beforeEach(() => vi.resetAllMocks());

  it('asks a creator for a username first, with step progress', async () => {
    respond(me({}));
    renderPage();

    expect(await screen.findByRole('heading', { name: USERNAME.title })).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
  });

  it('shows an invited joiner only the username step, without progress', async () => {
    respond(
      me({
        canCreateHousehold: false,
        households: [{ id: 'hh-1', name: 'Home', role: 'member' }],
        onboarding: [{ id: 'username', done: false }],
      }),
    );
    renderPage();

    expect(await screen.findByRole('heading', { name: USERNAME.title })).toBeInTheDocument();
    expect(screen.queryByText(/^Step /)).not.toBeInTheDocument();
  });

  it('saves the trimmed username then moves on to the household step', async () => {
    respond(me({}), json(200, { username: 'jess' }));
    renderPage();

    await fill(USERNAME.label, '  jess ', USERNAME.submit);

    expect(await screen.findByRole('heading', { name: HOUSEHOLD.title })).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith('/api/v1/me/username', {
      method: 'PUT',
      body: JSON.stringify({ username: 'jess' }),
    });
  });

  it('shows the taken message and stays on the username step', async () => {
    respond(me({}), json(409, { reason: 'username-taken' }));
    renderPage();

    await fill(USERNAME.label, 'jess', USERNAME.submit);

    expect(await screen.findByText(USERNAME.reasons['username-taken'])).toBeInTheDocument();
  });

  it('shows the generic username message when the request throws', async () => {
    respond(me({}));
    renderPage();
    await screen.findByLabelText(USERNAME.label);
    apiFetch.mockRejectedValue(new Error('network'));

    await fill(USERNAME.label, 'jess', USERNAME.submit);

    await waitFor(() => expect(screen.getByText(USERNAME.reasons.unknown)).toBeInTheDocument());
  });

  it('creates the household with the default name suggestion', async () => {
    respond(
      me({
        username: 'jess',
        onboarding: [
          { id: 'username', done: true },
          { id: 'household', done: false },
        ],
      }),
      json(201, { id: 'hh-1', name: 'Home', role: 'owner' }),
    );
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: HOUSEHOLD.submit }));

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith('/api/v1/households', {
        method: 'POST',
        body: JSON.stringify({ name: 'Home' }),
      }),
    );
  });

  it('shows the not-allowed message when the server refuses', async () => {
    respond(
      me({
        username: 'jess',
        onboarding: [
          { id: 'username', done: true },
          { id: 'household', done: false },
        ],
      }),
      json(403, { reason: 'not-allowed' }),
    );
    renderPage();

    await fill(HOUSEHOLD.label, 'Our home', HOUSEHOLD.submit);

    expect(await screen.findByText(HOUSEHOLD.reasons['not-allowed'])).toBeInTheDocument();
  });

  it('shows the generic household message when the request throws', async () => {
    respond(
      me({
        username: 'jess',
        onboarding: [
          { id: 'username', done: true },
          { id: 'household', done: false },
        ],
      }),
    );
    renderPage();
    await screen.findByLabelText(HOUSEHOLD.label);
    apiFetch.mockRejectedValue(new Error('network'));

    fireEvent.click(screen.getByRole('button', { name: HOUSEHOLD.submit }));

    await waitFor(() => expect(screen.getByText(HOUSEHOLD.reasons.unknown)).toBeInTheDocument());
  });

  it('asks for an invite when the user cannot create a household, and can sign out', async () => {
    signOut.mockResolvedValue(undefined);
    respond(
      me({
        username: 'jess',
        canCreateHousehold: false,
        onboarding: [
          { id: 'username', done: true },
          { id: 'needs-invite', done: false },
        ],
      }),
    );
    renderPage();

    expect(
      await screen.findByRole('heading', { name: ONBOARDING_COPY.needsInvite.title }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Step /)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.needsInvite.signOut }));

    expect(await screen.findByText('sign in page')).toBeInTheDocument();
  });
});
